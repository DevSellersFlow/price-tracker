const CHANNEL_MAP: Array<[string, string]> = [
  ['amazon.com.br', 'Amazon'],
  ['mercadolivre.com.br', 'Mercado Livre'],
  ['mercadolibre.com', 'Mercado Livre'],
  ['shopee.com.br', 'Shopee'],
  ['magazineluiza.com.br', 'Magalu'],
  ['magalu.com.br', 'Magalu'],
  ['gsuplementos.com.br', 'G Suplementos'],
  ['netshoes.com.br', 'Netshoes'],
  ['americanas.com.br', 'Americanas'],
  ['submarino.com.br', 'Submarino'],
]

export function urlToChannel(url: string): string {
  try {
    const { hostname } = new URL(url)
    for (const [pattern, name] of CHANNEL_MAP) {
      if (hostname.includes(pattern)) return name
    }
    return hostname.replace(/^www\./, '')
  } catch {
    return 'Desconhecido'
  }
}
