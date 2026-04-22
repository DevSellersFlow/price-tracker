import type { ProductRow } from '@/lib/supabase'
import { buildReportHTML } from './buildReportHTML'

export function buildClientReport(products: ProductRow[], client: string): string {
  const rows = products
    .filter(p => p.brand === client)
    .sort((a, b) =>
      String(a.size).localeCompare(String(b.size), 'pt-BR') ||
      String(a.channel).localeCompare(String(b.channel), 'pt-BR')
    )
  return buildReportHTML(rows, 'Relatório Cliente · ' + client, 'Portfólio completo da marca', 'client')
}
