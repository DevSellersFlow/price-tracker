import { supabase } from '../supabase'
import type { PriceHistoryRow } from '../supabase'

export async function fetchProductHistory(productId: string): Promise<PriceHistoryRow[]> {
  const { data } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .order('captured_at')
  return data ?? []
}
