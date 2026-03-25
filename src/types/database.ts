/** Fases persistidas em project_phase (alinha ao PRD). */
type ProjectPhaseRow =
  | 'discovery'
  | 'ideation'
  | 'structuring'
  | 'refinement'
  | 'delivery'

/** Subset usado pelo cliente Supabase (tabela projects). */
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          client_name: string | null
          initiative_type: string | null
          challenge_summary: string | null
          objective: string | null
          problem: string | null
          audience: string | null
          journey_flow: string | null
          technical_constraints: string | null
          business_constraints: string | null
          deadline: string | null
          dependencies: string | null
          expected_metrics: string | null
          desired_outcome: string | null
          acceptance_criteria: string | null
          project_phase: ProjectPhaseRow
          additional_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          client_name?: string | null
          initiative_type?: string | null
          challenge_summary?: string | null
          objective?: string | null
          problem?: string | null
          audience?: string | null
          journey_flow?: string | null
          technical_constraints?: string | null
          business_constraints?: string | null
          deadline?: string | null
          dependencies?: string | null
          expected_metrics?: string | null
          desired_outcome?: string | null
          acceptance_criteria?: string | null
          project_phase?: ProjectPhaseRow
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          client_name?: string | null
          initiative_type?: string | null
          challenge_summary?: string | null
          objective?: string | null
          problem?: string | null
          audience?: string | null
          journey_flow?: string | null
          technical_constraints?: string | null
          business_constraints?: string | null
          deadline?: string | null
          dependencies?: string | null
          expected_metrics?: string | null
          desired_outcome?: string | null
          acceptance_criteria?: string | null
          project_phase?: ProjectPhaseRow
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_threads: {
        Row: {
          id: string
          project_id: string
          agent_type: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          agent_type: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          agent_type?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          id: string
          project_id: string
          message_id: string | null
          agent_type: string | null
          content: string
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          message_id?: string | null
          agent_type?: string | null
          content: string
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          message_id?: string | null
          agent_type?: string | null
          content?: string
          label?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type AgentThread = Database['public']['Tables']['agent_threads']['Row']
export type MessageRow = Database['public']['Tables']['messages']['Row']
export type InsightRow = Database['public']['Tables']['insights']['Row']
