import { supabase } from '../supabase'
import type { ProductRow } from '../supabase'

export async function fetchActiveProducts(): Promise<ProductRow[]> {
  const { data: upload } = await supabase
    .from('uploads')
    .select('id')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (!upload) return []

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('upload_id', upload.id)
    .order('display_name')

  return data ?? []
}

export async function fetchActiveUpload() {
  const { data } = await supabase
    .from('uploads')
    .select('*')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}
