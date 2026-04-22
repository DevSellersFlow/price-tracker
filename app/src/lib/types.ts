export interface Filters {
  q: string
  brand: string
  size: string
  type: string
  channel: string
  model: string
  date: string    // yyyy-mm-dd; "" = all dates (projection uses full history)
  client: string  // brand name for client report; "" = no client selected
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  brand: '',
  size: '',
  type: '',
  channel: '',
  model: '',
  date: '',
  client: '',
}

export type TabId = 'overview' | 'mercado' | 'evolucao' | 'intraday'
