import { z } from 'zod';

export const pageViewEventSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, 'Path is required.')
    .max(2048, 'Path must be 2048 characters or less.')
    .refine((value) => value.startsWith('/'), 'Path must be relative to the website.'),
  title: z.string().trim().max(300).optional().nullable(),
  referrer: z.string().trim().max(2048).optional().nullable(),
  viewportWidth: z.number().int().positive().max(10000).optional().nullable(),
  viewportHeight: z.number().int().positive().max(10000).optional().nullable(),
});

export const analyticsMetricsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const analyticsVisitorsTimeseriesRangeSchema = z.enum(['7d', '30d', '90d']);

export const analyticsVisitorsTimeseriesQuerySchema = z.object({
  range: analyticsVisitorsTimeseriesRangeSchema.default('7d'),
});

export const analyticsVisitorListQuerySchema = z.object({
  range: analyticsVisitorsTimeseriesRangeSchema.default('7d'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type PageViewEventInput = z.infer<typeof pageViewEventSchema>;
export type AnalyticsMetricsQuery = z.infer<typeof analyticsMetricsQuerySchema>;
export type AnalyticsVisitorsTimeseriesRange = z.infer<typeof analyticsVisitorsTimeseriesRangeSchema>;
export type AnalyticsVisitorsTimeseriesQuery = z.infer<typeof analyticsVisitorsTimeseriesQuerySchema>;
export type AnalyticsVisitorListQuery = z.infer<typeof analyticsVisitorListQuerySchema>;
