import { KPICards } from './KPICards'
import { MoversTable } from './MoversTable'
import { FilterBar } from '@/components/filters/FilterBar'
import type { ProductRow } from '@/lib/supabase'
import type { FilterBarPassProps } from '@/pages/Dashboard'

interface Props {
  products: ProductRow[]
  loading: boolean
  filterBarProps: FilterBarPassProps
}

export function Overview({ products, loading, filterBarProps }: Props) {
  return (
    <div>
      <FilterBar
        products={filterBarProps.allProducts}
        filters={filterBarProps.filters}
        onChange={filterBarProps.onFilterChange}
        onReset={filterBarProps.onFilterReset}
      />
      <KPICards products={products} loading={loading} />
      <MoversTable products={products} />
    </div>
  )
}
