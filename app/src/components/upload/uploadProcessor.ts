import { supabase } from '@/lib/supabase'
import { PricesFileSchema } from '@/lib/parser/schema'
import { normalizeTrack } from '@/lib/parser/normalize'

export interface UploadResult {
  uploadId: string
  trackCount: number
  warnings: number
}

export type ProgressCallback = (pct: number, message: string) => void

export async function processUpload(
  file: File,
  onProgress: ProgressCallback
): Promise<UploadResult> {
  onProgress(2, 'Lendo arquivo…')
  const text = await file.text()
  const raw = JSON.parse(text)

  onProgress(8, 'Validando schema…')
  const parsed = PricesFileSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(`Schema inválido: ${parsed.error.issues[0]?.message ?? 'erro desconhecido'}`)
  }
  const { tracks, version, exportDate } = parsed.data

  onProgress(12, 'Desativando uploads anteriores…')
  await supabase.from('uploads').update({ is_active: false }).eq('is_active', true)

  onProgress(15, 'Criando registro de upload…')
  const { data: uploadRow, error: uploadErr } = await supabase
    .from('uploads')
    .insert({
      file_name: file.name,
      export_date: exportDate ?? null,
      version: version ?? null,
      track_count: tracks.length,
      is_active: true,
    })
    .select('id')
    .single()

  if (uploadErr || !uploadRow) throw new Error('Erro ao criar upload: ' + uploadErr?.message)

  const uploadId = uploadRow.id
  let warnings = 0

  // Normalize all tracks
  onProgress(20, 'Normalizando produtos…')
  const normalized = tracks.map(t => {
    try {
      return normalizeTrack(t)
    } catch {
      warnings++
      return null
    }
  }).filter(Boolean) as ReturnType<typeof normalizeTrack>[]

  // Insert products in batches of 100
  const productBatches: typeof normalized[] = []
  for (let i = 0; i < normalized.length; i += 100) {
    productBatches.push(normalized.slice(i, i + 100))
  }

  const productIdMap = new Map<number, string>() // index → db id
  for (let bi = 0; bi < productBatches.length; bi++) {
    const batch = productBatches[bi]
    const pct = 20 + Math.round((bi / productBatches.length) * 40)
    onProgress(pct, `Inserindo produtos (lote ${bi + 1}/${productBatches.length})…`)

    const { data: rows, error } = await supabase
      .from('products')
      .insert(batch.map(n => ({ ...n.product, upload_id: uploadId })))
      .select('id')

    if (error) throw new Error('Erro ao inserir produtos: ' + error.message)

    const startIdx = bi * 100
    rows?.forEach((r, ri) => {
      productIdMap.set(startIdx + ri, r.id)
    })
  }

  // Insert price_history in batches of 500
  type HistoryRow = { product_id: string; captured_at: string; captured_date: string; price: number; raw_value: string | null }
  const allHistory: HistoryRow[] = []

  normalized.forEach((n, idx) => {
    const pid = productIdMap.get(idx)
    if (!pid) return
    for (const h of n.history) {
      allHistory.push({ ...h, product_id: pid, raw_value: h.raw_value ?? null })
    }
  })

  const histBatches: typeof allHistory[] = []
  for (let i = 0; i < allHistory.length; i += 500) {
    histBatches.push(allHistory.slice(i, i + 500))
  }

  for (let bi = 0; bi < histBatches.length; bi++) {
    const pct = 60 + Math.round((bi / Math.max(histBatches.length, 1)) * 35)
    onProgress(pct, `Inserindo histórico (lote ${bi + 1}/${histBatches.length})…`)
    const { error } = await supabase.from('price_history').insert(histBatches[bi])
    if (error) throw new Error('Erro ao inserir histórico: ' + error.message)
  }

  onProgress(100, 'Concluído!')
  return { uploadId, trackCount: tracks.length, warnings }
}
