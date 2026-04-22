import { useState, useMemo } from 'react'
import { ExternalLink, ArrowUpDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterBar } from '@/components/filters/FilterBar'
import { brl, pct } from '@/lib/format'
import type { ProductRow } from '@/lib/supabase'
import type { FilterBarPassProps } from '@/pages/Dashboard'
import { cn } from '@/lib/cn'

type SortKey = 'display_name' | 'price_current' | 'var_pct' | 'amp_pct' | 'reads' | 'channel'

function VarBadge({ val }: { val: number | null }) {
  if (val == null) return <span className="text-[var(--color-muted-foreground)] text-xs">—</span>
  return (
    <Badge variant={val > 0 ? 'success' : val < 0 ? 'destructive' : 'secondary'}>
      {pct(val)}
    </Badge>
  )
}

interface Props {
  products: ProductRow[]
  isLoading: boolean
  filterBarProps: FilterBarPassProps
}

export function Market({ products, isLoading, filterBarProps }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('display_name')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortAsc ? cmp : -cmp
    })
  }, [products, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="py-2.5 px-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide cursor-pointer select-none hover:text-[var(--color-foreground)] whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} className={cn('opacity-40', sortKey === k && 'opacity-100 text-[var(--color-primary)]')} />
      </span>
    </th>
  )

  return (
    <div>
      <FilterBar
        products={filterBarProps.allProducts}
        filters={filterBarProps.filters}
        onChange={filterBarProps.onFilterChange}
        onReset={filterBarProps.onFilterReset}
      />
      {isLoading
        ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
        : (
          <Card>
            <CardHeader>
              <CardTitle>Base de Produtos — {sorted.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-secondary)]/50 sticky top-0">
                    <tr>
                      <Th label="Produto" k="display_name" />
                      <Th label="Canal" k="channel" />
                      <Th label="Preço atual" k="price_current" />
                      <Th label="Variação" k="var_pct" />
                      <Th label="Oscilação" k="amp_pct" />
                      <Th label="Capturas" k="reads" />
                      <th className="py-2.5 px-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide whitespace-nowrap">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p: ProductRow) => (
                      <tr key={p.id} className="border-b border-[var(--color-border)]/40 last:border-0 hover:bg-[var(--color-accent)]/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="text-sm font-medium text-[var(--color-foreground)] leading-tight max-w-xs truncate" title={p.title}>
                            {p.display_name ?? p.title.slice(0, 60)}
                          </div>
                          <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5 max-w-xs truncate">{p.title}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="secondary">{p.channel ?? '—'}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-sm font-semibold text-[var(--color-foreground)] whitespace-nowrap">{brl(p.price_current)}</td>
                        <td className="py-2.5 px-3"><VarBadge val={p.var_pct} /></td>
                        <td className="py-2.5 px-3 text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">{p.amp_pct != null ? pct(p.amp_pct) : '—'}</td>
                        <td className="py-2.5 px-3 text-sm text-[var(--color-muted-foreground)]">{p.reads}</td>
                        <td className="py-2.5 px-3">
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline text-xs font-semibold">
                            Ver <ExternalLink size={11} />
                          </a>
                        </td>
                      </tr>
                    ))}
                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
                          Nenhum produto encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      }
    </div>
  )
}
