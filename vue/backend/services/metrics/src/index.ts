import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { metricsRouter } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 4002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200 // Higher limit for metrics
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "metrics" });
});

// Routes
app.use("/api/metrics", metricsRouter);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

app.listen(PORT, () => {
  console.log(`Metrics service running on port ${PORT}`);
});
