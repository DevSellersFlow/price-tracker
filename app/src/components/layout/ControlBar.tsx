import { useState, useRef, useEffect, useMemo } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { buildMacroReport } from '@/lib/reports/buildMacroReport'
import { buildClientReport } from '@/lib/reports/buildClientReport'
import { downloadHTML, downloadPDF } from '@/lib/reports/download'
import type { Filters } from '@/lib/types'
import type { ProductRow } from '@/lib/supabase'

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function ReportMenu({
  label, disabled, onHTML, onPDF,
}: {
  label: string
  disabled?: boolean
  onHTML: () => void
  onPDF: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePDF = async () => {
    setOpen(false)
    setLoading(true)
    try { await onPDF() } finally { setLoading(false) }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || loading}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1"
      >
        <Download size={13} />
        <span className="hidden sm:inline">{loading ? 'Gerando…' : label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg overflow-hidden">
          <button
            onClick={() => { setOpen(false); onHTML() }}
            className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/30 transition-colors"
          >
            HTML
          </button>
          <button
            onClick={handlePDF}
            className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/30 transition-colors border-t border-[var(--color-border)]"
          >
            PDF
          </button>
        </div>
      )}
    </div>
  )
}

interface Props {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  dates: string[]
  allProducts: ProductRow[]
  filtered: ProductRow[]
}

export function ControlBar({ filters, setFilter, dates, allProducts, filtered }: Props) {
  const brands = useMemo(
    () => [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])].sort(),
    [allProducts]
  )

  const macroFilename = () =>
    `relatorio-macro-${filters.date || new Date().toISOString().slice(0, 10)}`

  const clientFilename = () =>
    `relatorio-cliente-${slugify(filters.client)}-${filters.date || new Date().toISOString().slice(0, 10)}`

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]/60">
      <div className="mx-auto max-w-[1720px] px-4 py-2 flex items-center gap-2 flex-wrap">
        <Select
          className="w-[130px]"
          value={filters.date}
          onChange={e => setFilter('date', e.target.value)}
          disabled={dates.length === 0}
        >
          <option value="">Todos os dias</option>
          {dates.map(d => (
            <option key={d} value={d}>{d.slice(8)}/{d.slice(5, 7)}</option>
          ))}
        </Select>

        <Select
          className="w-[170px]"
          value={filters.client}
          onChange={e => setFilter('client', e.target.value)}
        >
          <option value="">Selecionar cliente</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </Select>

        <ReportMenu
          label="Relatório macro"
          onHTML={() => downloadHTML(macroFilename() + '.html', buildMacroReport(filtered, filters.date))}
          onPDF={() => downloadPDF(macroFilename() + '.pdf', buildMacroReport(filtered, filters.date))}
        />

        <div title={!filters.client ? 'Selecione um cliente acima' : undefined}>
          <ReportMenu
            label="Relatório cliente"
            disabled={!filters.client}
            onHTML={() => downloadHTML(clientFilename() + '.html', buildClientReport(allProducts, filters.client))}
            onPDF={() => downloadPDF(clientFilename() + '.pdf', buildClientReport(allProducts, filters.client))}
          />
        </div>
      </div>
    </div>
  )
}
