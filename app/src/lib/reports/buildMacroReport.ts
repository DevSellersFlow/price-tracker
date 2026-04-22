import type { ProductRow } from '@/lib/supabase'
import { buildReportHTML } from './buildReportHTML'

export function buildMacroReport(products: ProductRow[], date: string): string {
  const dateLabel = date ? date.split('-').reverse().join('/') : 'todas as datas'
  return buildReportHTML(products, 'Relatório Macro · Creatina Brasil', 'Recorte: ' + dateLabel, 'macro')
}
