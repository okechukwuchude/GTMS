export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_type: 'public' | 'staff'
          email: string
          full_name: string
          phone: string | null
          company_name: string | null
          company_registration: string | null
          company_verified: boolean
          address: string | null
          country_code: string | null
          preferred_language: string
          notification_preferences: Json
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          user_type: 'public' | 'staff'
          email: string
          full_name: string
          phone?: string | null
          company_name?: string | null
          company_registration?: string | null
          company_verified?: boolean
          address?: string | null
          country_code?: string | null
          preferred_language?: string
          notification_preferences?: Json
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          user_type?: 'public' | 'staff'
          email?: string
          full_name?: string
          phone?: string | null
          company_name?: string | null
          company_registration?: string | null
          company_verified?: boolean
          address?: string | null
          country_code?: string | null
          preferred_language?: string
          notification_preferences?: Json
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Relationships: []
      }
      ports: {
        Row: {
          id: string
          name: string
          code: string
          country_code: string
          city: string | null
          latitude: number | null
          longitude: number | null
          timezone: string | null
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          country_code: string
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          country_code?: string
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      containers: {
        Row: {
          id: string
          container_number: string
          seal_number: string | null
          bill_of_lading: string
          owner_id: string
          shipper_name: string
          shipper_address: string | null
          shipper_country: string | null
          consignee_name: string
          consignee_address: string | null
          consignee_country: string | null
          cargo_description: string
          hs_code: string | null
          commodity_type: string | null
          quantity: number | null
          quantity_unit: string | null
          weight_kg: number | null
          volume_cbm: number | null
          value_usd: number | null
          currency: string
          origin_port_id: string | null
          destination_port_id: string | null
          current_port_id: string | null
          container_type:
            | '20FT'
            | '40FT'
            | '40FT_HC'
            | '45FT'
            | 'REEFER'
            | 'TANK'
            | 'OPEN_TOP'
            | 'FLAT_RACK'
          container_condition: string | null
          is_hazardous: boolean
          hazard_class: string | null
          temperature_celsius: number | null
          status:
            | 'registered'
            | 'in_transit'
            | 'arrived'
            | 'pending_inspection'
            | 'under_inspection'
            | 'inspection_complete'
            | 'cleared'
            | 'detained'
            | 'released'
            | 'departed'
          sub_status: string | null
          current_location: string | null
          registration_date: string
          eta: string | null
          ata: string | null
          etd: string | null
          atd: string | null
          clearance_date: string | null
          ocr_processed: boolean
          ocr_confidence: number | null
          ocr_data: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          container_number: string
          seal_number?: string | null
          bill_of_lading: string
          owner_id: string
          shipper_name: string
          shipper_address?: string | null
          shipper_country?: string | null
          consignee_name: string
          consignee_address?: string | null
          consignee_country?: string | null
          cargo_description: string
          hs_code?: string | null
          commodity_type?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          weight_kg?: number | null
          volume_cbm?: number | null
          value_usd?: number | null
          currency?: string
          origin_port_id?: string | null
          destination_port_id?: string | null
          current_port_id?: string | null
          container_type?:
            | '20FT'
            | '40FT'
            | '40FT_HC'
            | '45FT'
            | 'REEFER'
            | 'TANK'
            | 'OPEN_TOP'
            | 'FLAT_RACK'
          container_condition?: string | null
          is_hazardous?: boolean
          hazard_class?: string | null
          temperature_celsius?: number | null
          status?:
            | 'registered'
            | 'in_transit'
            | 'arrived'
            | 'pending_inspection'
            | 'under_inspection'
            | 'inspection_complete'
            | 'cleared'
            | 'detained'
            | 'released'
            | 'departed'
          sub_status?: string | null
          current_location?: string | null
          registration_date?: string
          eta?: string | null
          ata?: string | null
          etd?: string | null
          atd?: string | null
          clearance_date?: string | null
          ocr_processed?: boolean
          ocr_confidence?: number | null
          ocr_data?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          container_number?: string
          seal_number?: string | null
          bill_of_lading?: string
          owner_id?: string
          shipper_name?: string
          shipper_address?: string | null
          shipper_country?: string | null
          consignee_name?: string
          consignee_address?: string | null
          consignee_country?: string | null
          cargo_description?: string
          hs_code?: string | null
          commodity_type?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          weight_kg?: number | null
          volume_cbm?: number | null
          value_usd?: number | null
          currency?: string
          origin_port_id?: string | null
          destination_port_id?: string | null
          current_port_id?: string | null
          container_type?:
            | '20FT'
            | '40FT'
            | '40FT_HC'
            | '45FT'
            | 'REEFER'
            | 'TANK'
            | 'OPEN_TOP'
            | 'FLAT_RACK'
          container_condition?: string | null
          is_hazardous?: boolean
          hazard_class?: string | null
          temperature_celsius?: number | null
          status?:
            | 'registered'
            | 'in_transit'
            | 'arrived'
            | 'pending_inspection'
            | 'under_inspection'
            | 'inspection_complete'
            | 'cleared'
            | 'detained'
            | 'released'
            | 'departed'
          sub_status?: string | null
          current_location?: string | null
          registration_date?: string
          eta?: string | null
          ata?: string | null
          etd?: string | null
          atd?: string | null
          clearance_date?: string | null
          ocr_processed?: boolean
          ocr_confidence?: number | null
          ocr_data?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'containers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_current_port_id_fkey'
            columns: ['current_port_id']
            isOneToOne: false
            referencedRelation: 'ports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_destination_port_id_fkey'
            columns: ['destination_port_id']
            isOneToOne: false
            referencedRelation: 'ports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_origin_port_id_fkey'
            columns: ['origin_port_id']
            isOneToOne: false
            referencedRelation: 'ports'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'containers_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      container_status_history: {
        Row: {
          id: string
          container_id: string
          status: string
          sub_status: string | null
          location: string | null
          notes: string | null
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          container_id: string
          status: string
          sub_status?: string | null
          location?: string | null
          notes?: string | null
          changed_by?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          container_id?: string
          status?: string
          sub_status?: string | null
          location?: string | null
          notes?: string | null
          changed_by?: string | null
          changed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'container_status_history_changed_by_fkey'
            columns: ['changed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'container_status_history_container_id_fkey'
            columns: ['container_id']
            isOneToOne: false
            referencedRelation: 'containers'
            referencedColumns: ['id']
          },
        ]
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
