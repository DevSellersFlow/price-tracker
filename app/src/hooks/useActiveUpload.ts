import { useQuery } from '@tanstack/react-query'
import { fetchActiveUpload } from '@/lib/queries/overview'

export function useActiveUpload() {
  return useQuery({
    queryKey: ['active-upload'],
    queryFn: fetchActiveUpload,
    staleTime: 60_000,
  })
}
