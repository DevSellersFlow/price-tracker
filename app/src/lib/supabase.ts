import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(url, key)

export type ProductRow = Database['public']['Tables']['products']['Row']
export type PriceHistoryRow = Database['public']['Tables']['price_history']['Row']
export type UploadRow = Database['public']['Tables']['uploads']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type PriceHistoryInsert = Database['public']['Tables']['price_history']['Insert']
export type UploadInsert = Database['public']['Tables']['uploads']['Insert']
