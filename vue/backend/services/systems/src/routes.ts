import { Router } from "express";
import { z } from "zod";
import { db } from "../../../shared/db.js";
import { systems } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";

export const systemsRouter = Router();

// Get all systems
systemsRouter.get("/", async (_req, res, next) => {
  try {
    const allSystems = await db.select().from(systems);
    res.json(allSystems);
  } catch (error) {
    next(error);
  }
});

// Get system by ID
systemsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const system = await db.select().from(systems).where(eq(systems.id, id));
    
    if (system.length === 0) {
      return res.status(404).json({ error: "System not found" });
    }
    
    res.json(system[0]);
  } catch (error) {
    next(error);
  }
});

// Create system
const createSystemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["database", "windows", "linux"]),
  ipAddress: z.string().ip(),
  status: z.enum(["online", "warning", "offline"]).default("online"),
  version: z.string().optional(),
});

systemsRouter.post("/", async (req, res, next) => {
  try {
    const data = createSystemSchema.parse(req.body);
    const [newSystem] = await db.insert(systems).values(data).returning();
    res.status(201).json(newSystem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Update system
systemsRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = createSystemSchema.partial().parse(req.body);
    
    const [updated] = await db
      .update(systems)
      .set(data)
      .where(eq(systems.id, id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "System not found" });
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Delete system
systemsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(systems).where(eq(systems.id, id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
