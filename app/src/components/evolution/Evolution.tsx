import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar } from '@/components/filters/FilterBar'
import { PriceLineChart } from './PriceLineChart'
import { useProductHistory } from '@/hooks/useProductHistory'
import { brl, pct } from '@/lib/format'
import type { ProductRow } from '@/lib/supabase'
import type { FilterBarPassProps } from '@/pages/Dashboard'

interface Props {
  products: ProductRow[]
  filterBarProps: FilterBarPassProps
}

export function Evolution({ products, filterBarProps }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: history = [], isLoading: loadingHistory } = useProductHistory(selectedId)

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.display_name ?? '').localeCompare(b.display_name ?? '')),
    [products]
  )

  useEffect(() => {
    if (selectedId && !products.find(p => p.id === selectedId)) {
      setSelectedId(sortedProducts[0]?.id ?? null)
    }
  }, [products, selectedId, sortedProducts])

  const selected = useMemo(
    () => products.find(p => p.id === selectedId) ?? null,
    [products, selectedId]
  )

  return (
    <div className="space-y-4">
      <FilterBar
        products={filterBarProps.allProducts}
        filters={filterBarProps.filters}
        onChange={filterBarProps.onFilterChange}
        onReset={filterBarProps.onFilterReset}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Produto:</label>
        <Select
          className="max-w-lg"
          value={selectedId ?? ''}
          onChange={e => setSelectedId(e.target.value || null)}
          disabled={!products.length}
        >
          <option value="">Selecione um produto…</option>
          {sortedProducts.map(p => (
            <option key={p.id} value={p.id}>{p.display_name ?? p.title.slice(0, 80)}</option>
          ))}
        </Select>
      </div>

      {selectedId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Preço</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory
                ? <Skeleton className="h-[260px] rounded-lg" />
                : history.length < 2
                  ? <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">Dados insuficientes para gráfico (mín. 2 capturas)</p>
                  : <PriceLineChart history={history} />
              }
            </CardContent>
          </Card>

          {selected && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Preço atual', value: brl(selected.price_current) },
                { label: 'Mínimo histórico', value: brl(selected.price_min), cls: 'text-[var(--color-success)]' },
                { label: 'Máximo histórico', value: brl(selected.price_max), cls: 'text-[var(--color-destructive)]' },
                { label: 'Variação total', value: pct(selected.var_pct), cls: (selected.var_pct ?? 0) >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-destructive)]' },
                { label: 'Capturas', value: selected.reads.toString() },
                { label: 'Canal', value: selected.channel ?? '—' },
                { label: 'Tamanho', value: selected.size ?? '—' },
                { label: 'Tipo', value: selected.type ?? '—' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
                  <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className={`mt-1 text-lg font-bold ${item.cls ?? 'text-[var(--color-foreground)]'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedId && products.length > 0 && (
        <Card>
          <CardContent className="py-16 text-center text-sm text-[var(--color-muted-foreground)]">
            Selecione um produto acima para ver a evolução de preço
          </CardContent>
        </Card>
      )}
    </div>
  )
}
