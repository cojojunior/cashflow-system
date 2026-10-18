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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_transfers: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          created_by: string | null
          description: string | null
          from_account_id: string
          id: string
          occurred_on: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_account_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_account_id: string
          id?: string
          occurred_on: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_account_id?: string
          id?: string
          occurred_on?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transfers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          business_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          business_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          business_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string
          id: string
          limit_amount: number
          note: string | null
          period_end: string
          period_start: string
          updated_at: string
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string
          id?: string
          limit_amount: number
          note?: string | null
          period_end: string
          period_start: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          note?: string | null
          period_end?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_type: string | null
          created_at: string
          currency: string
          id: string
          location: string | null
          name: string
          owner_id: string
          safe_cash_threshold: number
          timezone: string
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          name: string
          owner_id: string
          safe_cash_threshold?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          safe_cash_threshold?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_adjustments: {
        Row: {
          account_id: string
          amount: number
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          occurred_on: string
          reason: Database["public"]["Enums"]["adjustment_reason"]
        }
        Insert: {
          account_id: string
          amount: number
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          occurred_on: string
          reason: Database["public"]["Enums"]["adjustment_reason"]
        }
        Update: {
          account_id?: string
          amount?: number
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          occurred_on?: string
          reason?: Database["public"]["Enums"]["adjustment_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "cash_adjustments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_adjustments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          business_id: string
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          triggered_at: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          business_id: string
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          triggered_at?: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          business_id?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          business_id: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_lessons: {
        Row: {
          content: string
          created_at: string
          display_order: number
          estimated_minutes: number
          ghs_example: string | null
          id: string
          is_published: boolean
          level: Database["public"]["Enums"]["lesson_level"]
          slug: string
          summary: string
          title: string
          topics: string[]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          estimated_minutes?: number
          ghs_example?: string | null
          id?: string
          is_published?: boolean
          level?: Database["public"]["Enums"]["lesson_level"]
          slug: string
          summary: string
          title: string
          topics?: string[]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          estimated_minutes?: number
          ghs_example?: string | null
          id?: string
          is_published?: boolean
          level?: Database["public"]["Enums"]["lesson_level"]
          slug?: string
          summary?: string
          title?: string
          topics?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_viewed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "financial_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_expenses: {
        Row: {
          amount: number
          business_id: string
          category_id: string | null
          created_at: string
          due_on: string
          id: string
          is_paid: boolean
          name: string
          note: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          category_id?: string | null
          created_at?: string
          due_on: string
          id?: string
          is_paid?: boolean
          name: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          category_id?: string | null
          created_at?: string
          due_on?: string
          id?: string
          is_paid?: boolean
          name?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string
          onboarded: boolean
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string
          onboarded?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string
          onboarded?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempted_at: string
          id: string
          lesson_id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          lesson_id: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempted_at?: string
          id?: string
          lesson_id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "financial_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          correct_key: string
          created_at: string
          display_order: number
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          question: string
        }
        Insert: {
          correct_key: string
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          lesson_id: string
          options: Json
          question: string
        }
        Update: {
          correct_key?: string
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "financial_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_categories: {
        Row: {
          business_id: string
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          business_id: string
          category_id: string | null
          created_at: string
          created_by: string | null
          customer_reference: string | null
          description: string | null
          id: string
          is_reversed: boolean
          notes: string | null
          occurred_on: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_url: string | null
          reversed_transaction_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          business_id: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          description?: string | null
          id?: string
          is_reversed?: boolean
          notes?: string | null
          occurred_on: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_url?: string | null
          reversed_transaction_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          business_id?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_reference?: string | null
          description?: string | null
          id?: string
          is_reversed?: boolean
          notes?: string | null
          occurred_on?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_url?: string | null
          reversed_transaction_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_reversed_transaction_id_fkey"
            columns: ["reversed_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write_business: { Args: { p_business_id: string }; Returns: boolean }
      is_business_member: { Args: { p_business_id: string }; Returns: boolean }
      is_business_owner: { Args: { p_business_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      account_type: "cash" | "mobile_money" | "bank"
      adjustment_reason:
        | "opening_balance"
        | "reconciliation"
        | "correction"
        | "other"
      alert_severity: "info" | "warning" | "critical"
      alert_status: "active" | "dismissed" | "resolved"
      alert_type:
        | "low_balance"
        | "high_expense"
        | "repeated_negative_cash_flow"
        | "upcoming_planned_expense"
      category_type: "income" | "expense" | "both"
      lesson_level: "beginner" | "intermediate" | "advanced"
      member_role: "owner" | "manager" | "viewer"
      payment_method: "cash" | "mobile_money" | "bank_transfer" | "other"
      transaction_type: "income" | "expense"
      transfer_status: "completed" | "reversed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_type: ["cash", "mobile_money", "bank"],
      adjustment_reason: [
        "opening_balance",
        "reconciliation",
        "correction",
        "other",
      ],
      alert_severity: ["info", "warning", "critical"],
      alert_status: ["active", "dismissed", "resolved"],
      alert_type: [
        "low_balance",
        "high_expense",
        "repeated_negative_cash_flow",
        "upcoming_planned_expense",
      ],
      category_type: ["income", "expense", "both"],
      lesson_level: ["beginner", "intermediate", "advanced"],
      member_role: ["owner", "manager", "viewer"],
      payment_method: ["cash", "mobile_money", "bank_transfer", "other"],
      transaction_type: ["income", "expense"],
      transfer_status: ["completed", "reversed"],
    },
  },
} as const
