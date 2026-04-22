import { useQuery } from '@tanstack/react-query'
import { fetchActiveProducts } from '@/lib/queries/overview'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchActiveProducts,
    staleTime: 60_000,
  })
}
