import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar } from '@/components/filters/FilterBar'
import { IntradayChart } from './IntradayChart'
import { useAllHistory } from '@/hooks/useAllHistory'
import { brl } from '@/lib/format'
import type { ProductRow } from '@/lib/supabase'
import type { FilterBarPassProps } from '@/pages/Dashboard'
import type { IntradayBucket } from '@/lib/queries/intraday'

interface Props {
  products: ProductRow[]
  filterBarProps: FilterBarPassProps
}

export function Intraday({ products, filterBarProps }: Props) {
  const { data: historyMap, isLoading } = useAllHistory()

  const buckets = useMemo<IntradayBucket[]>(() => {
    if (!historyMap || !products.length) return []

    const productSet = new Set(products.map(p => p.id))
    const hourPrices = new Map<number, number[]>()

    for (const [productId, rows] of historyMap) {
      if (!productSet.has(productId)) continue
      for (const { captured_at, price } of rows) {
        const hour = new Date(captured_at).getHours()
        const arr = hourPrices.get(hour) ?? []
        arr.push(price)
        hourPrices.set(hour, arr)
      }
    }

    return [...hourPrices.entries()]
      .map(([hour, prices]) => ({
        hour,
        reads: prices.length,
        avg_price: Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100,
        min_price: Math.min(...prices),
        max_price: Math.max(...prices),
      }))
      .sort((a, b) => a.hour - b.hour)
  }, [historyMap, products])

  return (
    <div className="space-y-4">
      <FilterBar
        products={filterBarProps.allProducts}
        filters={filterBarProps.filters}
        onChange={filterBarProps.onFilterChange}
        onReset={filterBarProps.onFilterReset}
      />

      {!products.length && !isLoading
        ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-[var(--color-muted-foreground)]">
              Nenhum dataset carregado. Importe um prices.json primeiro.
            </CardContent>
          </Card>
        )
        : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Hora do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] rounded-lg" />
                  : buckets.length === 0
                    ? <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">Sem dados intraday</p>
                    : <IntradayChart data={buckets} />
                }
              </CardContent>
            </Card>

            {!isLoading && buckets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tabela por Hora</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="border-b border-[var(--color-border)] bg-[var(--color-secondary)]/50">
                        <tr>
                          {['Hora', 'Capturas', 'Preço médio', 'Mínimo', 'Máximo'].map(h => (
                            <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {buckets.map(b => (
                          <tr key={b.hour} className="border-b border-[var(--color-border)]/40 last:border-0 hover:bg-[var(--color-accent)]/20 transition-colors">
                            <td className="py-2.5 px-4 text-sm font-semibold text-[var(--color-foreground)]">{String(b.hour).padStart(2, '0')}:00</td>
                            <td className="py-2.5 px-4 text-sm text-[var(--color-muted-foreground)]">{b.reads}</td>
                            <td className="py-2.5 px-4 text-sm text-[var(--color-foreground)]">{brl(b.avg_price)}</td>
                            <td className="py-2.5 px-4 text-sm text-[var(--color-success)]">{brl(b.min_price)}</td>
                            <td className="py-2.5 px-4 text-sm text-[var(--color-destructive)]">{brl(b.max_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )
      }
    </div>
  )
}
