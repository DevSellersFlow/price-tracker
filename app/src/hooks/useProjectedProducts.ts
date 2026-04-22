import { useMemo } from 'react'
import { useProducts } from './useProducts'
import { useAllHistory } from './useAllHistory'
import { projectAsOf, type ProductView } from '@/lib/projection'

export function useProjectedProducts(asOfDate: string): {
  data: ProductView[]
  isLoading: boolean
} {
  const { data: products = [], isLoading: loadingProducts } = useProducts()
  const { data: historyMap, isLoading: loadingHistory } = useAllHistory()

  const data = useMemo(
    () => projectAsOf(products, historyMap ?? new Map(), asOfDate || null),
    [products, historyMap, asOfDate]
  )

  return { data, isLoading: loadingProducts || loadingHistory }
}
