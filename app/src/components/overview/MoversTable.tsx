import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { brl, pct } from '@/lib/format'
import type { ProductRow } from '@/lib/supabase'

interface Props {
  products: ProductRow[]
}

function MoverRow({ p, direction }: { p: ProductRow; direction: 'up' | 'down' }) {
  return (
    <tr className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-[var(--color-accent)]/30 transition-colors">
      <td className="py-2.5 px-3">
        <div className="text-sm font-medium text-[var(--color-foreground)] leading-tight">{p.display_name ?? p.title.slice(0, 50)}</div>
        <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{p.channel}</div>
      </td>
      <td className="py-2.5 px-3 text-sm font-semibold text-[var(--color-foreground)] whitespace-nowrap">{brl(p.price_current)}</td>
      <td className="py-2.5 px-3 whitespace-nowrap">
        <Badge variant={direction === 'up' ? 'success' : 'destructive'}>
          {pct(p.var_pct)}
        </Badge>
      </td>
    </tr>
  )
}

export function MoversTable({ products }: Props) {
  const { topDown, topUp } = useMemo(() => {
    const withVar = products.filter(p => p.var_pct != null && p.reads > 1)
    const sorted = [...withVar].sort((a, b) => (a.var_pct ?? 0) - (b.var_pct ?? 0))
    return {
      topDown: sorted.slice(0, 10),
      topUp: [...sorted].reverse().slice(0, 10),
    }
  }, [products])

  const TableCard = ({ title, items, direction }: { title: string; items: ProductRow[]; direction: 'up' | 'down' }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 px-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">Produto</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">Preço</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">Var.</th>
              </tr>
            </thead>
            <tbody>
              {items.length
                ? items.map(p => <MoverRow key={p.id} p={p} direction={direction} />)
                : <tr><td colSpan={3} className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">Sem dados suficientes</td></tr>
              }
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TableCard title="📉 Maiores Quedas" items={topDown} direction="down" />
      <TableCard title="📈 Maiores Altas" items={topUp} direction="up" />
    </div>
  )
}
