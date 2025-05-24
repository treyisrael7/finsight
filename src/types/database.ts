export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          preferences: Json
          risk_profile: string | null
          financial_goals: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json
          risk_profile?: string | null
          financial_goals?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json
          risk_profile?: string | null
          financial_goals?: Json
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
          category: string | null
          summary: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          summary?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          summary?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          role: string
          created_at: string
          sentiment: string | null
          confidence: number | null
          metadata: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          role: string
          created_at?: string
          sentiment?: string | null
          confidence?: number | null
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          role?: string
          created_at?: string
          sentiment?: string | null
          confidence?: number | null
          metadata?: Json
        }
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number | null
          current_amount: number
          deadline: string | null
          category: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount?: number | null
          current_amount?: number
          deadline?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number | null
          current_amount?: number
          deadline?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          income: number
          expenses: Json
          savings_target: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          income?: number
          expenses?: Json
          savings_target?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          income?: number
          expenses?: Json
          savings_target?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          risk_level: string | null
          total_value: number
          assets: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          risk_level?: string | null
          total_value?: number
          assets?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          risk_level?: string | null
          total_value?: number
          assets?: Json
          created_at?: string
          updated_at?: string
        }
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
  }
} 