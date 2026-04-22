/**
 * Parse Brazilian Real price strings like "R$69\n,\n90", "R$ 1.234,56",
 * "Preço à vista: R$59,90(Cada)" → numeric value.
 */
export function parseBrlPrice(raw: string | null | undefined): number | null {
  if (!raw) return null
  // Handle "R$69\n,\n90" split format — integer part, then newline-comma-newline, then decimal
  const splitMatch = raw.match(/R\$\s*(\d+)\s*,\s*(\d+)/)
  if (splitMatch) {
    const value = parseFloat(`${splitMatch[1]}.${splitMatch[2]}`)
    return isNaN(value) ? null : value
  }
  // Normalize whitespace/newlines
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  // Find the numeric portion after R$ (or just grab digits, dots, commas)
  const match = cleaned.match(/R\$\s*([\d.,]+)/i) ?? cleaned.match(/([\d.,]+)/)
  if (!match) return null
  let num = match[1]
  // BR format: dots = thousands sep, comma = decimal
  // If both present: remove dots, replace comma with dot
  if (num.includes('.') && num.includes(',')) {
    num = num.replace(/\./g, '').replace(',', '.')
  } else if (num.includes(',')) {
    // Could be "69,90" (decimal) or "1,000" (thousands) — assume decimal if ≤2 digits after comma
    const parts = num.split(',')
    if (parts[1] && parts[1].length <= 2) {
      num = num.replace(',', '.')
    } else {
      num = num.replace(',', '')
    }
  }
  const value = parseFloat(num)
  return isNaN(value) ? null : value
}
