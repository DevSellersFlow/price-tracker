import { useMemo } from 'react'
import { useAllHistory } from './useAllHistory'
import { extractAvailableDates } from '@/lib/queries/dates'

export function useAvailableDates() {
  const { data: historyMap, isLoading } = useAllHistory()
  const dates = useMemo(
    () => (historyMap ? extractAvailableDates(historyMap) : []),
    [historyMap]
  )
  return { data: dates, isLoading }
}
