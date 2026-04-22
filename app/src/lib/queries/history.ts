import { supabase } from '../supabase'
import type { PriceHistoryRow } from '../supabase'

export async function fetchAllHistory(uploadId: string): Promise<Map<string, PriceHistoryRow[]>> {
  // Fetch products + nested history in one request via PostgREST embed
  const { data: rows, error } = await supabase
    .from('products')
    .select('id, price_history(id, product_id, captured_at, captured_date, price, raw_value)')
    .eq('upload_id', uploadId)

  if (error || !rows) return new Map()

  const map = new Map<string, PriceHistoryRow[]>()
  for (const p of rows) {
    const history = ((p as { id: string; price_history: PriceHistoryRow[] }).price_history) ?? []
    history.sort((a, b) => a.captured_at.localeCompare(b.captured_at))
    map.set(p.id, history)
  }
  return map
}
