import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { brl, pct } from '@/lib/format'
import type { ProductRow } from '@/lib/supabase'

interface KPI {
  label: string
  value: string
  meta?: string
  colorClass?: string
}

function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)]">{kpi.label}</p>
      <p className={`mt-2 text-3xl font-black ${kpi.colorClass ?? 'text-[var(--color-foreground)]'}`}>{kpi.value}</p>
      {kpi.meta && <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">{kpi.meta}</p>}
    </div>
  )
}

interface Props {
  products: ProductRow[]
  loading: boolean
}

export function KPICards({ products, loading }: Props) {
  const kpis = useMemo<KPI[]>(() => {
    if (!products.length) return []

    const valid = products.filter(p => p.price_current != null)
    const brands = new Set(products.map(p => p.brand).filter(Boolean))
    const avgPrice = valid.length
      ? valid.reduce((s, p) => s + (p.price_current ?? 0), 0) / valid.length
      : 0

    const withVar = products.filter(p => p.var_pct != null)
    const topUp = withVar.reduce<ProductRow | null>((best, p) =>
      !best || (p.var_pct ?? -Infinity) > (best.var_pct ?? -Infinity) ? p : best, null)
    const topDown = withVar.reduce<ProductRow | null>((best, p) =>
      !best || (p.var_pct ?? Infinity) < (best.var_pct ?? Infinity) ? p : best, null)

    return [
      { label: 'Produtos válidos', value: valid.length.toString(), meta: `de ${products.length} total` },
      { label: 'Marcas', value: brands.size.toString() },
      { label: 'Preço médio', value: brl(avgPrice) },
      {
        label: 'Maior alta',
        value: topUp ? pct(topUp.var_pct) : '—',
        meta: topUp?.display_name ?? undefined,
        colorClass: 'text-[var(--color-success)]',
      },
      {
        label: 'Maior queda',
        value: topDown ? pct(topDown.var_pct) : '—',
        meta: topDown?.display_name ?? undefined,
        colorClass: 'text-[var(--color-destructive)]',
      },
    ]
  }, [products])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {kpis.map(k => <KPICard key={k.label} kpi={k} />)}
    </div>
  )
}
