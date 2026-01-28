import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use("/api", limiter);

// Body parsing
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    service: "api-gateway",
    uptime: process.uptime()
  });
});

// Service URLs from environment or defaults
const SYSTEMS_SERVICE = process.env.SYSTEMS_SERVICE_URL || "http://localhost:4001";
const METRICS_SERVICE = process.env.METRICS_SERVICE_URL || "http://localhost:4002";
const LOGS_SERVICE = process.env.LOGS_SERVICE_URL || "http://localhost:4003";

// Proxy middleware options
const proxyOptions = {
  changeOrigin: true,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  onError: (err: Error, _req: express.Request, res: express.Response) => {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Bad Gateway - Service unavailable" });
  },
};

// Proxy to Systems Service
app.use(
  "/api/systems",
  createProxyMiddleware({
    ...proxyOptions,
    target: SYSTEMS_SERVICE,
    pathRewrite: { "^/api/systems": "/api/systems" },
  })
);

// Proxy to Metrics Service
app.use(
  "/api/metrics",
  createProxyMiddleware({
    ...proxyOptions,
    target: METRICS_SERVICE,
    pathRewrite: { "^/api/metrics": "/api/metrics" },
  })
);

// Proxy to Logs Service
app.use(
  "/api/logs",
  createProxyMiddleware({
    ...proxyOptions,
    target: LOGS_SERVICE,
    pathRewrite: { "^/api/logs": "/api/logs" },
  })
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Gateway error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Proxying to:`);
  console.log(`  - Systems: ${SYSTEMS_SERVICE}`);
  console.log(`  - Metrics: ${METRICS_SERVICE}`);
  console.log(`  - Logs: ${LOGS_SERVICE}`);
});
