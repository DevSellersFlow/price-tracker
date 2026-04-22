import { supabase } from '../supabase'

export interface IntradayBucket {
  hour: number
  reads: number
  avg_price: number
  min_price: number
  max_price: number
}

export async function fetchIntradayBuckets(uploadId: string): Promise<IntradayBucket[]> {
  // Get all history for this upload and aggregate by hour client-side
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('upload_id', uploadId)

  if (!products?.length) return []

  const productIds = products.map(p => p.id)
  const { data: history } = await supabase
    .from('price_history')
    .select('captured_at, price')
    .in('product_id', productIds)

  if (!history?.length) return []

  const buckets = new Map<number, number[]>()
  for (const { captured_at, price } of history) {
    const hour = new Date(captured_at).getHours()
    const existing = buckets.get(hour) ?? []
    existing.push(price)
    buckets.set(hour, existing)
  }

  const result: IntradayBucket[] = []
  for (const [hour, prices] of buckets) {
    result.push({
      hour,
      reads: prices.length,
      avg_price: Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
    })
  }

  return result.sort((a, b) => a.hour - b.hour)
}
