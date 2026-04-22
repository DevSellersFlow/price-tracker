import { describe, it, expect } from 'vitest'
import { parseBrlPrice } from '@/lib/parser/price'
import { urlToChannel } from '@/lib/parser/channel'
import { extractBrand, extractSize, extractType, extractModel, sizeToGrams } from '@/lib/parser/attributes'
import { normalizeTrack } from '@/lib/parser/normalize'

describe('parseBrlPrice', () => {
  it('parses "R$69\\n,\\n90"', () => expect(parseBrlPrice('R$69\n,\n90')).toBe(69.90))
  it('parses "R$59,90"', () => expect(parseBrlPrice('R$59,90')).toBe(59.90))
  it('parses "R$ 1.234,56"', () => expect(parseBrlPrice('R$ 1.234,56')).toBe(1234.56))
  it('parses prefixed string', () => expect(parseBrlPrice('Preço à vista: R$59,90(Cada)')).toBe(59.90))
  it('returns null for empty', () => expect(parseBrlPrice('')).toBeNull())
  it('returns null for non-price', () => expect(parseBrlPrice('sem preço')).toBeNull())
})

describe('urlToChannel', () => {
  it('detects Amazon', () => expect(urlToChannel('https://www.amazon.com.br/dp/B0CDNJ3S3D')).toBe('Amazon'))
  it('detects Mercado Livre', () => expect(urlToChannel('https://www.mercadolivre.com.br/produto')).toBe('Mercado Livre'))
  it('detects Shopee', () => expect(urlToChannel('https://shopee.com.br/produto')).toBe('Shopee'))
  it('detects G Suplementos', () => expect(urlToChannel('https://www.gsuplementos.com.br/creatina')).toBe('G Suplementos'))
})

describe('extractBrand', () => {
  it('extracts Vitafor', () => expect(extractBrand('Vitafor - Creatine Creatina Monohidratada 300g')).toBe('Vitafor'))
  it('extracts Nutrify', () => expect(extractBrand('Nutrify 100% Creatine 3g')).toBe('Nutrify'))
  it('extracts Dark Lab', () => expect(extractBrand('Refil Creatina Pura 1kg Dark Lab')).toBe('Dark Lab'))
  it('returns null for unknown', () => expect(extractBrand('Produto genérico sem marca')).toBeNull())
})

describe('extractSize', () => {
  it('extracts 300g', () => expect(extractSize('Creatina 300g')).toBe('300g'))
  it('extracts 1kg', () => expect(extractSize('Refil Creatina Pura 1kg')).toBe('1kg'))
  it('extracts comp count', () => expect(extractSize('Creatina Creapure 120 Comprimidos')).toBe('120 comp'))
  it('returns null when missing', () => expect(extractSize('Creatina sem tamanho')).toBeNull())
})

describe('sizeToGrams', () => {
  it('converts 300g', () => expect(sizeToGrams('300g')).toBe(300))
  it('converts 1kg', () => expect(sizeToGrams('1kg')).toBe(1000))
  it('returns null for comp', () => expect(sizeToGrams('120 comp')).toBeNull())
  it('returns null for null', () => expect(sizeToGrams(null)).toBeNull())
})

describe('extractType', () => {
  it('detects Monohidratada', () => expect(extractType('Creatina Monohidratada 300g')).toBe('Monohidratada'))
  it('detects Creapure', () => expect(extractType('Creatina Creapure® 120 Comprimidos')).toBe('Creapure'))
  it('detects HCL', () => expect(extractType('Creatine HCL capsules')).toBe('HCL'))
  it('defaults to Monohidratada', () => expect(extractType('Creatina pura')).toBe('Monohidratada'))
})

describe('extractModel', () => {
  it('detects Refil', () => expect(extractModel('Refil Creatina 1kg')).toBe('Refil'))
  it('detects Pote', () => expect(extractModel('Creatina Pote 300g')).toBe('Pote'))
  it('defaults Normal', () => expect(extractModel('Creatina 300g')).toBe('Normal'))
})

describe('normalizeTrack', () => {
  const track = {
    id: '2026-04-08T10:00:00.000Z',
    title: 'Vitafor Creatina Monohidratada 300g',
    url: 'https://www.amazon.com.br/dp/B07LCTTF8V',
    history: [
      { timestamp: '2026-04-08T10:00:00.000Z', value: 'R$72,53' },
      { timestamp: '2026-04-09T11:00:00.000Z', value: 'R$68,90' },
    ],
    lastCheckDate: '2026-04-09T11:00:00.000Z',
    favicon: '',
    images: [],
  }

  it('computes price_initial and price_current', () => {
    const { product } = normalizeTrack(track)
    expect(product.price_initial).toBe(72.53)
    expect(product.price_current).toBe(68.90)
  })

  it('computes var_pct as negative', () => {
    const { product } = normalizeTrack(track)
    expect(product.var_pct).toBeLessThan(0)
  })

  it('produces 2 history entries', () => {
    const { history } = normalizeTrack(track)
    expect(history).toHaveLength(2)
  })

  it('sets channel to Amazon', () => {
    const { product } = normalizeTrack(track)
    expect(product.channel).toBe('Amazon')
  })

  it('sets brand to Vitafor', () => {
    const { product } = normalizeTrack(track)
    expect(product.brand).toBe('Vitafor')
  })

  it('dedupes duplicate date entries', () => {
    const dupTrack = {
      ...track,
      history: [
        { timestamp: '2026-04-08T08:00:00.000Z', value: 'R$70,00' },
        { timestamp: '2026-04-08T18:00:00.000Z', value: 'R$72,53' }, // later same day
      ],
    }
    const { history } = normalizeTrack(dupTrack)
    expect(history).toHaveLength(1)
    expect(history[0].price).toBe(72.53) // last capture of day wins
  })
})
