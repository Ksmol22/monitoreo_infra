import { z } from 'zod';
import { insertSystemSchema, insertMetricSchema, insertLogSchema, systems, metrics, logs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  systems: {
    list: {
      method: 'GET' as const,
      path: '/api/systems',
      responses: {
        200: z.array(z.custom<typeof systems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/systems/:id',
      responses: {
        200: z.custom<typeof systems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/systems',
      input: insertSystemSchema,
      responses: {
        201: z.custom<typeof systems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/systems/:id',
      input: insertSystemSchema.partial(),
      responses: {
        200: z.custom<typeof systems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  metrics: {
    list: {
      method: 'GET' as const,
      path: '/api/metrics',
      input: z.object({
        systemId: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof metrics.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/metrics',
      input: insertMetricSchema,
      responses: {
        201: z.custom<typeof metrics.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      input: z.object({
        systemId: z.string().optional(),
        level: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
