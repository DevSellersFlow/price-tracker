import type { PriceHistoryRow } from '../supabase'

export function extractAvailableDates(historyMap: Map<string, PriceHistoryRow[]>): string[] {
  const seen = new Set<string>()
  for (const rows of historyMap.values()) {
    for (const r of rows) seen.add(r.captured_date)
  }
  return [...seen].sort((a, b) => b.localeCompare(a)) // newest first
}
