import { useState, useMemo, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { ControlBar } from '@/components/layout/ControlBar'
import { TabNav } from '@/components/layout/TabNav'
import { Overview } from '@/components/overview/Overview'
import { Market } from '@/components/market/Market'
import { Evolution } from '@/components/evolution/Evolution'
import { Intraday } from '@/components/intraday/Intraday'
import { useFilters, applyFilters } from '@/hooks/useFilters'
import { useProjectedProducts } from '@/hooks/useProjectedProducts'
import { useAvailableDates } from '@/hooks/useAvailableDates'
import type { TabId, Filters } from '@/lib/types'
import type { ProductRow } from '@/lib/supabase'

interface Props { theme: 'dark' | 'light'; onToggleTheme: () => void }

export interface FilterBarPassProps {
  allProducts: ProductRow[]
  filters: Filters
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onFilterReset: () => void
}

export function Dashboard({ theme, onToggleTheme }: Props) {
  const [tab, setTab] = useState<TabId>('overview')
  const { filters, setFilter, reset } = useFilters()
  const { data: dates } = useAvailableDates()

  useEffect(() => {
    if (!filters.date && dates.length > 0) setFilter('date', dates[0])
  }, [dates, filters.date, setFilter])

  const { data: projected, isLoading } = useProjectedProducts(filters.date)

  const filtered = useMemo(
    () => applyFilters(projected, filters),
    [projected, filters]
  )

  const filterBarProps: FilterBarPassProps = {
    allProducts: projected,
    filters,
    onFilterChange: setFilter,
    onFilterReset: reset,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar theme={theme} onToggleTheme={onToggleTheme} />
      <ControlBar
        filters={filters}
        setFilter={setFilter}
        dates={dates}
        allProducts={projected}
        filtered={filtered}
      />
      <TabNav active={tab} onChange={setTab} />
      <main className="flex-1 mx-auto w-full max-w-[1720px] px-4 py-5">
        {tab === 'overview' && <Overview products={filtered} loading={isLoading} filterBarProps={filterBarProps} />}
        {tab === 'mercado'  && <Market products={filtered} isLoading={isLoading} filterBarProps={filterBarProps} />}
        {tab === 'evolucao' && <Evolution products={filtered} filterBarProps={filterBarProps} />}
        {tab === 'intraday' && <Intraday products={filtered} filterBarProps={filterBarProps} />}
      </main>
    </div>
  )
}
