// Brand list derived from index.html client list + prices.json samples
const BRANDS = [
  'DUX Nutrition',
  'Dux Nutrition',
  'Equaliv',
  'Integralmedica',
  'Integral Médica',
  'Nutrify',
  'Darkness',
  'Guday',
  'Dark Lab',
  'Vitafor',
  'Growth Supplements',
  'Growth',
  'Probiotica',
  'Probiótica',
  'Max Titanium',
  'Midway',
  'Body Action',
  'BRN Foods',
  'Atlhetica Nutrition',
  'Power Supplements',
  'Criogenix',
  'HSN',
  'EFX Sports',
  'BioTech USA',
  'Optimum Nutrition',
  'MuscleTech',
  'Universal Nutrition',
  'Cellucor',
  'Bulk',
  'Creapure',
]

export function extractBrand(title: string): string | null {
  const t = title.toLowerCase()
  // Sort by length desc so longer matches win ("Growth Supplements" before "Growth")
  const sorted = [...BRANDS].sort((a, b) => b.length - a.length)
  for (const brand of sorted) {
    if (t.includes(brand.toLowerCase())) return brand
  }
  return null
}

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(kg|g)\b/gi
const COMP_RE = /(\d+)\s*(?:comp(?:rimidos?)?|cáps(?:ulas?)?|caps?)\b/i

export function extractSize(title: string): string | null {
  const matches = [...title.matchAll(SIZE_RE)]
  if (matches.length) {
    // Prefer kg, otherwise pick largest gram value
    const kg = matches.find(m => m[2].toLowerCase() === 'kg')
    if (kg) return `${kg[1]}kg`
    // Return the one that produces biggest gram value
    const best = matches.reduce((a, b) => {
      const aG = parseFloat(a[1].replace(',', '.')) * (a[2].toLowerCase() === 'kg' ? 1000 : 1)
      const bG = parseFloat(b[1].replace(',', '.')) * (b[2].toLowerCase() === 'kg' ? 1000 : 1)
      return bG > aG ? b : a
    })
    return `${best[1]}${best[2].toLowerCase()}`
  }
  const comp = title.match(COMP_RE)
  if (comp) return `${comp[1]} comp`
  return null
}

export function sizeToGrams(size: string | null): number | null {
  if (!size) return null
  const kg = size.match(/^([\d.,]+)\s*kg$/i)
  if (kg) return parseFloat(kg[1].replace(',', '.')) * 1000
  const g = size.match(/^([\d.,]+)\s*g$/i)
  if (g) return parseFloat(g[1].replace(',', '.'))
  return null
}

const TYPE_KEYWORDS: Array<[RegExp, string]> = [
  [/creapure/i, 'Creapure'],
  [/micronizada|micronized/i, 'Micronizada'],
  [/alcalina|kre.?alkalyn/i, 'Alcalina'],
  [/hcl/i, 'HCL'],
  [/monohidratada|monohydrate|monoidratada/i, 'Monohidratada'],
]

export function extractType(title: string): string {
  for (const [re, label] of TYPE_KEYWORDS) {
    if (re.test(title)) return label
  }
  return 'Monohidratada' // default for creatine products
}

export function extractModel(title: string): string {
  if (/refil/i.test(title)) return 'Refil'
  if (/pote/i.test(title)) return 'Pote'
  return 'Normal'
}
