import { db } from "./db";
import {
  systems, metrics, logs,
  type System, type InsertSystem,
  type Metric, type InsertMetric,
  type Log, type InsertLog
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Systems
  getSystems(): Promise<System[]>;
  getSystem(id: number): Promise<System | undefined>;
  createSystem(system: InsertSystem): Promise<System>;
  updateSystem(id: number, updates: Partial<InsertSystem>): Promise<System>;

  // Metrics
  getMetrics(systemId?: number, limit?: number): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;

  // Logs
  getLogs(systemId?: number, level?: string): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
}

export class DatabaseStorage implements IStorage {
  async getSystems(): Promise<System[]> {
    return await db.select().from(systems);
  }

  async getSystem(id: number): Promise<System | undefined> {
    const [system] = await db.select().from(systems).where(eq(systems.id, id));
    return system;
  }

  async createSystem(insertSystem: InsertSystem): Promise<System> {
    const [system] = await db.insert(systems).values(insertSystem).returning();
    return system;
  }

  async updateSystem(id: number, updates: Partial<InsertSystem>): Promise<System> {
    const [system] = await db.update(systems).set(updates).where(eq(systems.id, id)).returning();
    return system;
  }

  async getMetrics(systemId?: number, limit: number = 100): Promise<Metric[]> {
    let query = db.select().from(metrics).orderBy(desc(metrics.timestamp)).limit(limit);
    
    if (systemId) {
      // @ts-ignore
      query = query.where(eq(metrics.systemId, systemId));
    }
    
    return await query;
  }

  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db.insert(metrics).values(insertMetric).returning();
    return metric;
  }

  async getLogs(systemId?: number, level?: string): Promise<Log[]> {
    let query = db.select().from(logs).orderBy(desc(logs.timestamp));
    
    // Simple dynamic filtering
    const filters = [];
    if (systemId) filters.push(eq(logs.systemId, systemId));
    if (level) filters.push(eq(logs.level, level));
    
    // @ts-ignore - combining filters needs a bit more verbose syntax in drizzle usually, 
    // but for this simple case we'll rely on the array spread if supported or just basic chaining
    // Actually, let's just chain them for safety
    
    let resultQuery = query;
    if (systemId) resultQuery = resultQuery.where(eq(logs.systemId, systemId));
    if (level) resultQuery = resultQuery.where(eq(logs.level, level));

    return await resultQuery;
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
