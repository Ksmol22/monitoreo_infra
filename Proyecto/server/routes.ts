import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Systems Routes ===
  app.get(api.systems.list.path, async (req, res) => {
    const systems = await storage.getSystems();
    res.json(systems);
  });

  app.get(api.systems.get.path, async (req, res) => {
    const system = await storage.getSystem(Number(req.params.id));
    if (!system) return res.status(404).json({ message: "System not found" });
    res.json(system);
  });

  app.post(api.systems.create.path, async (req, res) => {
    try {
      const input = api.systems.create.input.parse(req.body);
      const system = await storage.createSystem(input);
      res.status(201).json(system);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Metrics Routes ===
  app.get(api.metrics.list.path, async (req, res) => {
    const systemId = req.query.systemId ? Number(req.query.systemId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const metrics = await storage.getMetrics(systemId, limit);
    res.json(metrics);
  });

  app.post(api.metrics.create.path, async (req, res) => {
    try {
      const input = api.metrics.create.input.parse(req.body);
      const metric = await storage.createMetric(input);
      res.status(201).json(metric);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Logs Routes ===
  app.get(api.logs.list.path, async (req, res) => {
    const systemId = req.query.systemId ? Number(req.query.systemId) : undefined;
    const level = req.query.level as string | undefined;
    const logs = await storage.getLogs(systemId, level);
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingSystems = await storage.getSystems();
  if (existingSystems.length === 0) {
    // 1. Database System
    const dbSystem = await storage.createSystem({
      name: "Prod-DB-01",
      type: "database",
      ipAddress: "192.168.1.10",
      status: "online",
      version: "PostgreSQL 15"
    });

    // 2. Windows System
    const winSystem = await storage.createSystem({
      name: "Win-IIS-Server",
      type: "windows",
      ipAddress: "192.168.1.20",
      status: "online",
      version: "Windows Server 2022"
    });

    // 3. Linux System
    const linuxSystem = await storage.createSystem({
      name: "App-Server-01",
      type: "linux",
      ipAddress: "192.168.1.30",
      status: "warning",
      version: "Ubuntu 22.04 LTS"
    });

    // Seed Metrics for DB
    await storage.createMetric({
      systemId: dbSystem.id,
      data: {
        activeConnections: 145,
        blockedUsers: 2,
        tablespaceUsage: { "users": 85, "system": 45, "temp": 12 },
        logSize: "2.5 GB",
        serviceStatus: "up"
      }
    });

    // Seed Metrics for Windows
    await storage.createMetric({
      systemId: winSystem.id,
      data: {
        iisStatus: "running",
        cpuUsage: 45,
        ramUsage: 60,
        openPorts: [80, 443, 3389],
        performance: { cpu: 45, memory: 60, disk: 30 }
      }
    });

    // Seed Logs
    await storage.createLog({
      systemId: dbSystem.id,
      level: "info",
      message: "Backup completed successfully",
      source: "PostgreSQL"
    });

    await storage.createLog({
      systemId: linuxSystem.id,
      level: "warning",
      message: "Disk usage exceeds 80%",
      source: "System"
    });
    
    await storage.createLog({
      systemId: winSystem.id,
      level: "error",
      message: "IIS Worker Process failed",
      source: "IIS"
    });
  }
}
