import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { PriceHistoryRow } from '@/lib/supabase'
import { brl } from '@/lib/format'

interface Props {
  history: PriceHistoryRow[]
}

interface DataPoint {
  date: string
  price: number
}

export function PriceLineChart({ history }: Props) {
  const data: DataPoint[] = history.map(h => ({
    date: h.captured_date,
    price: h.price,
  }))

  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const padding = (max - min) * 0.1 || 2

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={v => {
            const parts = v.split('-')
            return `${parts[2]}/${parts[1]}`
          }}
        />
        <YAxis
          domain={[min - padding, max + padding]}
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={v => `R$${v.toFixed(0)}`}
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: 4 }}
          formatter={(val: number) => [brl(val), 'Preço']}
          labelFormatter={label => {
            const parts = label.split('-')
            return `${parts[2]}/${parts[1]}/${parts[0]}`
          }}
        />
        <ReferenceLine y={min} stroke="var(--color-success)" strokeDasharray="4 2" opacity={0.6} />
        <ReferenceLine y={max} stroke="var(--color-destructive)" strokeDasharray="4 2" opacity={0.6} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--color-primary)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
