export function avg(arr: (number | null | undefined)[]): number {
  const nums = arr.filter((v): v is number => v != null)
  if (!nums.length) return 0
  return nums.reduce((s, v) => s + v, 0) / nums.length
}

export function uniq<T>(arr: (T | null | undefined)[]): T[] {
  return [...new Set(arr.filter((v): v is T => v != null))]
}

export function brl(v: number | null | undefined): string {
  if (v == null) return '—'
  return 'R$' + v.toFixed(2).replace('.', ',')
}

export function pct(v: number | null | undefined, d = 1): string {
  if (v == null) return '—'
  return (v > 0 ? '+' : '') + v.toFixed(d) + '%'
}

export function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function channelBadge(c: string | null | undefined): string {
  const cls: Record<string, string> = {
    Amazon: 'b-amz',
    'Mercado Livre': 'b-ml',
    Magalu: 'b-mg',
    'Site Oficial': 'b-sit',
  }
  const c2 = c ?? ''
  return `<span class="badge ${cls[c2] ?? 'b-sit'}">${esc(c2) || '—'}</span>`
}

export function varCell(v: number | null | undefined): string {
  if (v == null || v === 0) return '<span class="gray" style="font-family:monospace">—</span>'
  return `<span class="${v < 0 ? 'green' : 'red'}" style="font-family:monospace;font-weight:700">${v < 0 ? '▼' : '▲'}${Math.abs(v).toFixed(1)}%</span>`
}
