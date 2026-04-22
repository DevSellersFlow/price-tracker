import { useState, useCallback } from 'react'
import type { Filters } from '@/lib/types'
import { DEFAULT_FILTERS } from '@/lib/types'
import type { ProductRow } from '@/lib/supabase'

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return { filters, setFilter, reset }
}

export function applyFilters(products: ProductRow[], filters: Filters): ProductRow[] {
  return products.filter(p => {
    if (filters.q) {
      const q = filters.q.toLowerCase()
      const hit =
        p.title.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        (p.display_name?.toLowerCase().includes(q) ?? false)
      if (!hit) return false
    }
    if (filters.brand && p.brand !== filters.brand) return false
    if (filters.size && p.size !== filters.size) return false
    if (filters.type && p.type !== filters.type) return false
    if (filters.channel && p.channel !== filters.channel) return false
    if (filters.model && p.model !== filters.model) return false
    return true
  })
}
