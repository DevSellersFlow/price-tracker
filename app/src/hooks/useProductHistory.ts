import { useQuery } from '@tanstack/react-query'
import { fetchProductHistory } from '@/lib/queries/evolution'

export function useProductHistory(productId: string | null) {
  return useQuery({
    queryKey: ['product-history', productId],
    queryFn: () => fetchProductHistory(productId!),
    enabled: productId != null,
    staleTime: 60_000,
  })
}
