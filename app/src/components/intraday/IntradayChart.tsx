import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts'
import type { IntradayBucket } from '@/lib/queries/intraday'
import { brl } from '@/lib/format'

interface Props {
  data: IntradayBucket[]
}

export function IntradayChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    hourLabel: `${String(d.hour).padStart(2, '0')}h`,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={formatted} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis dataKey="hourLabel" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
        <YAxis
          yAxisId="price"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          tickFormatter={v => `R$${v.toFixed(0)}`}
          width={64}
        />
        <YAxis
          yAxisId="reads"
          orientation="right"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: 12,
          }}
          formatter={(val, name) => {
            if (name === 'avg_price') return [brl(val as number), 'Preço médio']
            if (name === 'reads') return [val as number, 'Capturas']
            return [val as number, name as string]
          }}
        />
        <Legend
          formatter={(v: string) => v === 'avg_price' ? 'Preço médio' : 'Capturas'}
          wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}
        />
        <Bar yAxisId="reads" dataKey="reads" fill="var(--color-primary)" opacity={0.25} radius={[3, 3, 0, 0]} />
        <Line yAxisId="price" type="monotone" dataKey="avg_price" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
