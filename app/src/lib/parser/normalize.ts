import { parseBrlPrice } from './price'
import { urlToChannel } from './channel'
import { extractBrand, extractSize, extractType, extractModel, sizeToGrams } from './attributes'
import type { Track } from './schema'
import type { ProductInsert, PriceHistoryInsert } from '../supabase'

export interface NormalizedTrack {
  product: Omit<ProductInsert, 'upload_id'>
  history: Omit<PriceHistoryInsert, 'product_id'>[]
}

export function normalizeTrack(track: Track): NormalizedTrack {
  // Parse & dedupe history by date (keep last capture per day)
  const dateMap = new Map<string, { price: number; captured_at: string; raw_value: string }>()
  for (const entry of track.history) {
    const price = parseBrlPrice(entry.value)
    if (price == null || price <= 0) continue
    const d = entry.timestamp.slice(0, 10) // "YYYY-MM-DD"
    const existing = dateMap.get(d)
    if (!existing || entry.timestamp > existing.captured_at) {
      dateMap.set(d, { price, captured_at: entry.timestamp, raw_value: entry.value })
    }
  }

  const history: Omit<PriceHistoryInsert, 'product_id'>[] = []
  for (const [date, { price, captured_at, raw_value }] of dateMap) {
    history.push({ captured_date: date, captured_at, price, raw_value })
  }
  history.sort((a, b) => a.captured_at.localeCompare(b.captured_at))

  const prices = history.map(h => h.price)
  const price_initial = prices[0] ?? null
  const price_current = prices[prices.length - 1] ?? null
  const price_min = prices.length ? Math.min(...prices) : null
  const price_max = prices.length ? Math.max(...prices) : null

  const var_pct =
    price_initial && price_current
      ? Math.round(((price_current - price_initial) / price_initial) * 10000) / 100
      : null

  const amp_pct =
    price_min && price_max && price_min > 0
      ? Math.round(((price_max - price_min) / price_min) * 10000) / 100
      : null

  const brand = extractBrand(track.title)
  const size = extractSize(track.title)
  const size_grams = sizeToGrams(size)
  const type = extractType(track.title)
  const model = extractModel(track.title)
  const channel = urlToChannel(track.url)

  const price_per_100g =
    price_current && size_grams && size_grams > 0
      ? Math.round((price_current / size_grams) * 100 * 100) / 100
      : null

  const parts = [brand, size, type].filter(Boolean)
  const display_name = parts.length ? parts.join(' · ') : track.title.slice(0, 60)

  return {
    product: {
      track_id: track.id ?? null,
      title: track.title,
      url: track.url,
      channel,
      brand,
      size,
      size_grams,
      type,
      model,
      display_name,
      price_initial,
      price_current,
      price_min,
      price_max,
      var_pct,
      amp_pct,
      price_per_100g,
      reads: history.length,
      last_check_date: track.lastCheckDate ?? null,
      favicon: track.favicon ?? null,
      images: track.images ?? [],
    },
    history,
  }
}
