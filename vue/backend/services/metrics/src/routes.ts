import { Router } from "express";
import { z } from "zod";
import { db } from "../../../shared/db.js";
import { metrics } from "../../../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export const metricsRouter = Router();

// Get metrics with optional filters
metricsRouter.get("/", async (req, res, next) => {
  try {
    const systemId = req.query.systemId ? parseInt(req.query.systemId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    let query = db.select().from(metrics).orderBy(desc(metrics.timestamp)).limit(limit);
    
    if (systemId) {
      query = query.where(eq(metrics.systemId, systemId)) as any;
    }
    
    const allMetrics = await query;
    res.json(allMetrics);
  } catch (error) {
    next(error);
  }
});

// Get metric by ID
metricsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const metric = await db.select().from(metrics).where(eq(metrics.id, id));
    
    if (metric.length === 0) {
      return res.status(404).json({ error: "Metric not found" });
    }
    
    res.json(metric[0]);
  } catch (error) {
    next(error);
  }
});

// Create metric
const createMetricSchema = z.object({
  systemId: z.number(),
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  diskUsage: z.number().min(0).max(100),
  networkIn: z.number().min(0),
  networkOut: z.number().min(0),
});

metricsRouter.post("/", async (req, res, next) => {
  try {
    const data = createMetricSchema.parse(req.body);
    const [newMetric] = await db.insert(metrics).values(data).returning();
    res.status(201).json(newMetric);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Bulk create metrics
metricsRouter.post("/bulk", async (req, res, next) => {
  try {
    const data = z.array(createMetricSchema).parse(req.body);
    const newMetrics = await db.insert(metrics).values(data).returning();
    res.status(201).json(newMetrics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});
