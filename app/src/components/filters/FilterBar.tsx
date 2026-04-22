import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Filters } from '@/lib/types'
import type { ProductRow } from '@/lib/supabase'

interface Props {
  products: ProductRow[]
  filters: Filters
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
}

function unique(arr: (string | null)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])].sort()
}

export function FilterBar({ products, filters, onChange, onReset }: Props) {
  const brands   = useMemo(() => unique(products.map(p => p.brand)),   [products])
  const sizes    = useMemo(() => unique(products.map(p => p.size)),    [products])
  const types    = useMemo(() => unique(products.map(p => p.type)),    [products])
  const channels = useMemo(() => unique(products.map(p => p.channel)), [products])
  const models   = useMemo(() => unique(products.map(p => p.model)),   [products])

  const hasFilters = filters.q || filters.brand || filters.size || filters.type || filters.channel || filters.model

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 mb-4">
      <div className="relative lg:col-span-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <Input
          placeholder="Buscar produto, marca…"
          value={filters.q}
          onChange={e => onChange('q', e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={filters.brand} onChange={e => onChange('brand', e.target.value)}>
        <option value="">Todas as marcas</option>
        {brands.map(b => <option key={b} value={b}>{b}</option>)}
      </Select>

      <Select value={filters.size} onChange={e => onChange('size', e.target.value)}>
        <option value="">Todos os tamanhos</option>
        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>

      <Select value={filters.type} onChange={e => onChange('type', e.target.value)}>
        <option value="">Todos os tipos</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </Select>

      <Select value={filters.channel} onChange={e => onChange('channel', e.target.value)}>
        <option value="">Todos os canais</option>
        {channels.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      <div className="flex gap-2">
        <Select
          className="flex-1"
          value={filters.model}
          onChange={e => onChange('model', e.target.value)}
        >
          <option value="">Todos os modelos</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
        {hasFilters && (
          <Button size="icon" variant="ghost" onClick={onReset} title="Limpar filtros" className="flex-shrink-0">
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}
