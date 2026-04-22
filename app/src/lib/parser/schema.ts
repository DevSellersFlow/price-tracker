import { z } from 'zod'

export const HistoryEntrySchema = z.object({
  timestamp: z.string(),
  value: z.string(),
})

export const TrackSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  url: z.string(),
  history: z.array(HistoryEntrySchema).default([]),
  lastCheckDate: z.string().optional(),
  favicon: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  minValue: z.object({ timestamp: z.string(), value: z.string() }).optional(),
  maxValue: z.object({ timestamp: z.string(), value: z.string() }).optional(),
})

export const PricesFileSchema = z.object({
  version: z.string().optional(),
  exportDate: z.string().optional(),
  warning: z.string().optional(),
  tracks: z.array(TrackSchema),
})

export type Track = z.infer<typeof TrackSchema>
export type PricesFile = z.infer<typeof PricesFileSchema>
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>
