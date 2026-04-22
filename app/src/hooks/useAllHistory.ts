import { useQuery } from '@tanstack/react-query'
import { fetchAllHistory } from '@/lib/queries/history'
import { useActiveUpload } from './useActiveUpload'
import type { PriceHistoryRow } from '@/lib/supabase'

export function useAllHistory() {
  const { data: upload } = useActiveUpload()
  return useQuery<Map<string, PriceHistoryRow[]>>({
    queryKey: ['all-history', upload?.id],
    queryFn: () => fetchAllHistory(upload!.id),
    enabled: upload != null,
    staleTime: 60_000,
  })
}
