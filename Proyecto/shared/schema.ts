import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
});

// === METRICS ===
// We use a flexible JSONB column 'data' to store type-specific metrics
// DB: { activeConnections, blockedUsers, tablespaceUsage, logSize, serviceStatus }
// Windows: { iisStatus, cpuUsage, ramUsage, openPorts }
// Linux: { loadAverage, diskUsage }
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === LOGS ===
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").notNull(),
  level: text("level").notNull(), // 'info', 'warning', 'error'
  message: text("message").notNull(),
  source: text("source"), // e.g., 'IIS', 'PostgreSQL', 'System'
  timestamp: timestamp("timestamp").defaultNow(),
  isResolved: boolean("is_resolved").default(false),
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
export const insertSystemSchema = createInsertSchema(systems).omit({ id: true, lastSeen: true });
export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true, timestamp: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });

// === TYPES ===
export type System = typeof systems.$inferSelect;
export type InsertSystem = z.infer<typeof insertSystemSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
