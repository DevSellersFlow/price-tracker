export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      price_history: {
        Row: {
          captured_at: string
          captured_date: string
          id: string
          price: number
          product_id: string
          raw_value: string | null
        }
        Insert: {
          captured_at: string
          captured_date: string
          id?: string
          price: number
          product_id: string
          raw_value?: string | null
        }
        Update: {
          captured_at?: string
          captured_date?: string
          id?: string
          price?: number
          product_id?: string
          raw_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          amp_pct: number | null
          brand: string | null
          channel: string | null
          created_at: string
          display_name: string | null
          favicon: string | null
          id: string
          images: string[] | null
          last_check_date: string | null
          model: string | null
          price_current: number | null
          price_initial: number | null
          price_max: number | null
          price_min: number | null
          price_per_100g: number | null
          reads: number
          size: string | null
          size_grams: number | null
          title: string
          track_id: string | null
          type: string | null
          upload_id: string
          url: string
          var_pct: number | null
        }
        Insert: {
          amp_pct?: number | null
          brand?: string | null
          channel?: string | null
          created_at?: string
          display_name?: string | null
          favicon?: string | null
          id?: string
          images?: string[] | null
          last_check_date?: string | null
          model?: string | null
          price_current?: number | null
          price_initial?: number | null
          price_max?: number | null
          price_min?: number | null
          price_per_100g?: number | null
          reads?: number
          size?: string | null
          size_grams?: number | null
          title: string
          track_id?: string | null
          type?: string | null
          upload_id: string
          url: string
          var_pct?: number | null
        }
        Update: {
          amp_pct?: number | null
          brand?: string | null
          channel?: string | null
          created_at?: string
          display_name?: string | null
          favicon?: string | null
          id?: string
          images?: string[] | null
          last_check_date?: string | null
          model?: string | null
          price_current?: number | null
          price_initial?: number | null
          price_max?: number | null
          price_min?: number | null
          price_per_100g?: number | null
          reads?: number
          size?: string | null
          size_grams?: number | null
          title?: string
          track_id?: string | null
          type?: string | null
          upload_id?: string
          url?: string
          var_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          export_date: string | null
          file_name: string | null
          id: string
          is_active: boolean
          track_count: number
          uploaded_at: string
          version: string | null
        }
        Insert: {
          export_date?: string | null
          file_name?: string | null
          id?: string
          is_active?: boolean
          track_count: number
          uploaded_at?: string
          version?: string | null
        }
        Update: {
          export_date?: string | null
          file_name?: string | null
          id?: string
          is_active?: boolean
          track_count?: number
          uploaded_at?: string
          version?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
