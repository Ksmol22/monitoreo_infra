import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === SYSTEMS ===
export const systems = pgTable("systems", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'database', 'linux', 'windows'
  ipAddress: text("ip_address").notNull(),
  status: text("status").notNull().default('offline'), // 'online', 'offline', 'warning'
  version: text("version"),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === METRICS ===
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").notNull().references(() => systems.id, { onDelete: 'cascade' }),
  cpuUsage: decimal("cpu_usage", { precision: 5, scale: 2 }),
  memoryUsage: decimal("memory_usage", { precision: 5, scale: 2 }),
  diskUsage: decimal("disk_usage", { precision: 5, scale: 2 }),
  networkIn: decimal("network_in", { precision: 10, scale: 2 }),
  networkOut: decimal("network_out", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === LOGS ===
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").notNull().references(() => systems.id, { onDelete: 'cascade' }),
  level: text("level").notNull(), // 'info', 'warning', 'error', 'critical'
  message: text("message").notNull(),
  source: text("source"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === RELATIONS ===
export const systemsRelations = relations(systems, ({ many }) => ({
  metrics: many(metrics),
  logs: many(logs),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  system: one(systems, {
    fields: [metrics.systemId],
    references: [systems.id],
  }),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  system: one(systems, {
    fields: [logs.systemId],
    references: [systems.id],
  }),
}));

// === SCHEMAS ===
export const insertSystemSchema = createInsertSchema(systems).omit({ 
  id: true, 
  lastSeen: true, 
  createdAt: true 
});

export const insertMetricSchema = createInsertSchema(metrics).omit({ 
  id: true, 
  timestamp: true 
});

export const insertLogSchema = createInsertSchema(logs).omit({ 
  id: true, 
  timestamp: true 
});

// === TYPES ===
export type System = typeof systems.$inferSelect;
export type InsertSystem = z.infer<typeof insertSystemSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
