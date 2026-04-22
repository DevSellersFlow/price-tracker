import type { ProductRow, PriceHistoryRow } from './supabase'

// ProductView has the same shape as ProductRow but with fields recomputed for an as-of date.
export type ProductView = ProductRow

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function projectAsOf(
  products: ProductRow[],
  historyByProduct: Map<string, PriceHistoryRow[]>,
  asOfDate: string | null  // null/'' = use full history
): ProductView[] {
  return products.map(p => {
    const allRows = historyByProduct.get(p.id) ?? []
    const rows = asOfDate
      ? allRows.filter(r => r.captured_date <= asOfDate)
      : allRows

    if (!rows.length) {
      return {
        ...p,
        price_current: null,
        price_initial: null,
        price_min: null,
        price_max: null,
        var_pct: null,
        amp_pct: null,
        price_per_100g: null,
        reads: 0,
        last_check_date: null,
      }
    }

    const prices = rows.map(r => r.price)
    const priceInitial = prices[0]
    const priceCurrent = prices[prices.length - 1]
    const priceMin = Math.min(...prices)
    const priceMax = Math.max(...prices)
    const varPct = priceInitial !== 0
      ? round2((priceCurrent - priceInitial) / priceInitial * 100)
      : null
    const ampPct = priceMin !== 0 && priceMax !== priceMin
      ? round2((priceMax - priceMin) / priceMin * 100)
      : 0
    const sizeg = p.size_grams
    const pricePer100g = sizeg && sizeg > 0
      ? round2(priceCurrent / sizeg * 100)
      : null

    return {
      ...p,
      price_current: priceCurrent,
      price_initial: priceInitial,
      price_min: priceMin,
      price_max: priceMax,
      var_pct: varPct,
      amp_pct: ampPct,
      price_per_100g: pricePer100g,
      reads: rows.length,
      last_check_date: rows[rows.length - 1].captured_at,
    }
  })
}
