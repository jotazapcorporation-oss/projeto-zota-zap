export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      agenda_eventos: {
        Row: {
          created_at: string
          end_time: string | null
          event_date: string | null
          event_id: string
          event_time: string
          id: string
          local: string | null
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          event_date?: string | null
          event_id?: string
          event_time: string
          id: string
          local?: string | null
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          event_date?: string | null
          event_id?: string
          event_time?: string
          id?: string
          local?: string | null
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      boards: {
        Row: {
          created_at: string
          descricao: string | null
          display_order: number | null
          icone: string | null
          id: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          display_order?: number | null
          icone?: string | null
          id?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          display_order?: number | null
          icone?: string | null
          id?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      caixinhas_poupanca: {
        Row: {
          card_color: string | null
          data_criacao: string
          deadline_date: string | null
          display_order: number | null
          goal_icon: string | null
          id: string
          nome_caixinha: string
          updated_at: string
          user_id: string
          valor_atual: number
          valor_meta: number
        }
        Insert: {
          card_color?: string | null
          data_criacao?: string
          deadline_date?: string | null
          display_order?: number | null
          goal_icon?: string | null
          id?: string
          nome_caixinha: string
          updated_at?: string
          user_id: string
          valor_atual?: number
          valor_meta: number
        }
        Update: {
          card_color?: string | null
          data_criacao?: string
          deadline_date?: string | null
          display_order?: number | null
          goal_icon?: string | null
          id?: string
          nome_caixinha?: string
          updated_at?: string
          user_id?: string
          valor_atual?: number
          valor_meta?: number
        }
        Relationships: []
      }
      card_attachments: {
        Row: {
          card_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          card_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          card_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_comments: {
        Row: {
          card_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_members: {
        Row: {
          assigned_at: string
          assigned_by: string
          card_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          card_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          card_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_members_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          checklist: Json | null
          cover_image: string | null
          created_at: string
          data_vencimento: string | null
          descricao: string | null
          display_order: number | null
          etiquetas: Json | null
          id: string
          lista_id: string
          priority: string | null
          reminder_days: number | null
          start_date: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          checklist?: Json | null
          cover_image?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          display_order?: number | null
          etiquetas?: Json | null
          id?: string
          lista_id: string
          priority?: string | null
          reminder_days?: number | null
          start_date?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          checklist?: Json | null
          cover_image?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao?: string | null
          display_order?: number | null
          etiquetas?: Json | null
          id?: string
          lista_id?: string
          priority?: string | null
          reminder_days?: number | null
          start_date?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "Trello"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          nome: string
          tags: string | null
          tipo: string | null
          updated_at: string
          userid: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          nome: string
          tags?: string | null
          tipo?: string | null
          updated_at?: string
          userid: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          nome?: string
          tags?: string | null
          tipo?: string | null
          updated_at?: string
          userid?: string
        }
        Relationships: []
      }
      family_plan: {
        Row: {
          created_at: string
          id: string
          limite_de_slots: number
          master_id: string
          slots_utilizados: number
          status_plano: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          limite_de_slots?: number
          master_id: string
          slots_utilizados?: number
          status_plano?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          limite_de_slots?: number
          master_id?: string
          slots_utilizados?: number
          status_plano?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_users_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      frasediaria: {
        Row: {
          autor: string | null
          created_at: string | null
          id: string
          mensagem: string
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          id?: string
          mensagem: string
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          id: number
          userid: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: number
          userid: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: number
          userid?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assinaturaid: string | null
          ativo: boolean | null
          avatar_url: string | null
          card_form_field_order: Json | null
          created_at: string
          customerid: string | null
          email: string | null
          id: string
          intencao: string | null
          master_id: string | null
          nome: string | null
          phone: string | null
          saldo: number | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          assinaturaid?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          card_form_field_order?: Json | null
          created_at?: string
          customerid?: string | null
          email?: string | null
          id: string
          intencao?: string | null
          master_id?: string | null
          nome?: string | null
          phone?: string | null
          saldo?: number | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          assinaturaid?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          card_form_field_order?: Json | null
          created_at?: string
          customerid?: string | null
          email?: string | null
          id?: string
          intencao?: string | null
          master_id?: string | null
          nome?: string | null
          phone?: string | null
          saldo?: number | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          concluida: boolean | null
          created_at: string
          descricao: string | null
          display_order: number | null
          horario: string | null
          id: string
          local: string | null
          prioridade: string | null
          subtarefas: Json | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string
          descricao?: string | null
          display_order?: number | null
          horario?: string | null
          id?: string
          local?: string | null
          prioridade?: string | null
          subtarefas?: Json | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concluida?: boolean | null
          created_at?: string
          descricao?: string | null
          display_order?: number | null
          horario?: string | null
          id?: string
          local?: string | null
          prioridade?: string | null
          subtarefas?: Json | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          category_id: string
          created_at: string
          detalhes: string | null
          estabelecimento: string | null
          id: number
          quando: string | null
          tipo: string | null
          userid: string
          valor: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          detalhes?: string | null
          estabelecimento?: string | null
          id?: never
          quando?: string | null
          tipo?: string | null
          userid: string
          valor?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          detalhes?: string | null
          estabelecimento?: string | null
          id?: never
          quando?: string | null
          tipo?: string | null
          userid?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transacoes_categoria"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Trello: {
        Row: {
          board_id: string
          created_at: string
          display_order: number | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          board_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listas_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string | null
          timezone: string
          whatsapp_e164: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name?: string | null
          timezone?: string
          whatsapp_e164?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string | null
          timezone?: string
          whatsapp_e164?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      depositar_caixinha: {
        Args: { _caixinha_id: string; _valor: number }
        Returns: Json
      }
      duplicate_card: {
        Args: { _card_id: string }
        Returns: string
      }
      duplicate_lista: {
        Args: { _lista_id: string }
        Returns: string
      }
      get_random_phrase: {
        Args: Record<PropertyKey, never>
        Returns: {
          autor: string | null
          created_at: string | null
          id: string
          mensagem: string
        }[]
      }
      random_phrase: {
        Args: Record<PropertyKey, never>
        Returns: {
          text: string
        }[]
      }
      retirar_caixinha: {
        Args: { _caixinha_id: string; _valor: number }
        Returns: Json
      }
    }
    Enums: {
      agent_action_type: "create" | "edit" | "cancel" | "remind" | "list"
      event_status: "scheduled" | "canceled" | "completed"
      reminder_method: "push" | "email" | "sms" | "webhook"
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_action_type: ["create", "edit", "cancel", "remind", "list"],
      event_status: ["scheduled", "canceled", "completed"],
      reminder_method: ["push", "email", "sms", "webhook"],
    },
  },
} as const
