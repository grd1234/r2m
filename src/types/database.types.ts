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
      activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_papers: {
        Row: {
          abstract: string | null
          analysis_id: string
          authors: string[] | null
          citation_count: number | null
          created_at: string | null
          id: string
          publication_date: string | null
          relevance_score: number | null
          title: string
          url: string | null
        }
        Insert: {
          abstract?: string | null
          analysis_id: string
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string | null
          id?: string
          publication_date?: string | null
          relevance_score?: number | null
          title: string
          url?: string | null
        }
        Update: {
          abstract?: string | null
          analysis_id?: string
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string | null
          id?: string
          publication_date?: string | null
          relevance_score?: number | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_papers_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "cvs_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_papers_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["analysis_id"]
          },
        ]
      }
      batch_analyses: {
        Row: {
          batch_name: string
          completed_count: number | null
          created_at: string | null
          id: string
          status: string | null
          total_queries: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          batch_name: string
          completed_count?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          total_queries: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          batch_name?: string
          completed_count?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          total_queries?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "batch_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "batch_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "batch_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_results: {
        Row: {
          analysis_id: string | null
          batch_id: string
          created_at: string | null
          cvs_score: number | null
          id: string
          query: string
          result_summary: string | null
          status: string | null
        }
        Insert: {
          analysis_id?: string | null
          batch_id: string
          created_at?: string | null
          cvs_score?: number | null
          id?: string
          query: string
          result_summary?: string | null
          status?: string | null
        }
        Update: {
          analysis_id?: string | null
          batch_id?: string
          created_at?: string | null
          cvs_score?: number | null
          id?: string
          query?: string
          result_summary?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_results_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "cvs_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_results_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["analysis_id"]
          },
          {
            foreignKeyName: "batch_results_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batch_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs_analyses: {
        Row: {
          analysis_notes: Json | null
          analyzed_by: string
          commercial_score: number | null
          competitive_score: number | null
          created_at: string | null
          cvs_score: number | null
          go_to_market_strategy: string | null
          id: string
          ip_score: number | null
          is_ai_generated: boolean | null
          key_risks: string[] | null
          key_strengths: string[] | null
          market_score: number | null
          paper_id: string | null
          query: string
          recommendations: string | null
          risk_score: number | null
          status: string | null
          summary: string | null
          tam: number | null
          target_industry: string | null
          technical_score: number | null
          title: string
          trl: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_notes?: Json | null
          analyzed_by: string
          commercial_score?: number | null
          competitive_score?: number | null
          created_at?: string | null
          cvs_score?: number | null
          go_to_market_strategy?: string | null
          id?: string
          ip_score?: number | null
          is_ai_generated?: boolean | null
          key_risks?: string[] | null
          key_strengths?: string[] | null
          market_score?: number | null
          paper_id?: string | null
          query: string
          recommendations?: string | null
          risk_score?: number | null
          status?: string | null
          summary?: string | null
          tam?: number | null
          target_industry?: string | null
          technical_score?: number | null
          title: string
          trl?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_notes?: Json | null
          analyzed_by?: string
          commercial_score?: number | null
          competitive_score?: number | null
          created_at?: string | null
          cvs_score?: number | null
          go_to_market_strategy?: string | null
          id?: string
          ip_score?: number | null
          is_ai_generated?: boolean | null
          key_risks?: string[] | null
          key_strengths?: string[] | null
          market_score?: number | null
          paper_id?: string | null
          query?: string
          recommendations?: string | null
          risk_score?: number | null
          status?: string | null
          summary?: string | null
          tam?: number | null
          target_industry?: string | null
          technical_score?: number | null
          title?: string
          trl?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cvs_analyses_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "cvs_analyses_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "cvs_analyses_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "cvs_analyses_analyzed_by_fkey"
            columns: ["analyzed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cvs_analyses_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "cvs_analyses_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "cvs_analyses_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_updates: {
        Row: {
          created_at: string | null
          deal_id: string
          id: string
          new_status: string | null
          note: string | null
          old_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_updates_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["deal_id"]
          },
          {
            foreignKeyName: "deal_updates_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "deal_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "deal_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "deal_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          commitment_id: string
          created_at: string | null
          documents: Json | null
          expected_close_date: string | null
          id: string
          milestones: Json | null
          notes: string | null
          progress: number | null
          start_date: string | null
          status: string
          success_fee_amount: number | null
          success_fee_invoice_id: string | null
          success_fee_paid: boolean | null
          success_fee_paid_at: string | null
          update_history: Json | null
          updated_at: string | null
        }
        Insert: {
          actual_close_date?: string | null
          commitment_id: string
          created_at?: string | null
          documents?: Json | null
          expected_close_date?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string
          success_fee_amount?: number | null
          success_fee_invoice_id?: string | null
          success_fee_paid?: boolean | null
          success_fee_paid_at?: string | null
          update_history?: Json | null
          updated_at?: string | null
        }
        Update: {
          actual_close_date?: string | null
          commitment_id?: string
          created_at?: string | null
          documents?: Json | null
          expected_close_date?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string
          success_fee_amount?: number | null
          success_fee_invoice_id?: string | null
          success_fee_paid?: boolean | null
          success_fee_paid_at?: string | null
          update_history?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["commitment_id"]
          },
          {
            foreignKeyName: "deals_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "investment_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      introduction_requests: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string
          message: string | null
          paper_id: string
          startup_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id: string
          message?: string | null
          paper_id: string
          startup_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string
          message?: string | null
          paper_id?: string
          startup_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "introduction_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "introduction_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "introduction_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "introduction_requests_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introduction_requests_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "introduction_requests_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "introduction_requests_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introduction_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "introduction_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "introduction_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "introduction_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_commitments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          investment_type: string
          investor_id: string
          message: string | null
          paper_id: string
          startup_id: string
          status: string
          timeline: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          investment_type: string
          investor_id: string
          message?: string | null
          paper_id: string
          startup_id: string
          status?: string
          timeline: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          investment_type?: string
          investor_id?: string
          message?: string | null
          paper_id?: string
          startup_id?: string
          status?: string
          timeline?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_commitments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "investment_commitments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "investment_commitments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "investment_commitments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_commitments_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "investment_commitments_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "investment_commitments_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_commitments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "investment_commitments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "investment_commitments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "investment_commitments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          cvs_reports_limit: number | null
          cvs_reports_used: number | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          subscription_renews_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          cvs_reports_limit?: number | null
          cvs_reports_used?: number | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          subscription_renews_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          cvs_reports_limit?: number | null
          cvs_reports_used?: number | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          subscription_renews_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          abstract: string | null
          authors: string[] | null
          citation_count: number | null
          created_at: string | null
          doi: string | null
          external_id: string | null
          funding_goal: number | null
          id: string
          industry: string | null
          is_published_to_marketplace: boolean | null
          keywords: string[] | null
          marketplace_description: string | null
          metadata: Json | null
          pdf_url: string | null
          publication_date: string | null
          source: string | null
          stage: string | null
          tech_category: string | null
          title: string
          updated_at: string | null
          uploaded_by: string
          view_count: number | null
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string | null
          doi?: string | null
          external_id?: string | null
          funding_goal?: number | null
          id?: string
          industry?: string | null
          is_published_to_marketplace?: boolean | null
          keywords?: string[] | null
          marketplace_description?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          publication_date?: string | null
          source?: string | null
          stage?: string | null
          tech_category?: string | null
          title: string
          updated_at?: string | null
          uploaded_by: string
          view_count?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          citation_count?: number | null
          created_at?: string | null
          doi?: string | null
          external_id?: string | null
          funding_goal?: number | null
          id?: string
          industry?: string | null
          is_published_to_marketplace?: boolean | null
          keywords?: string[] | null
          marketplace_description?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          publication_date?: string | null
          source?: string | null
          stage?: string | null
          tech_category?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "research_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "research_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "research_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "research_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_opportunities: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          paper_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          paper_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "saved_opportunities_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["paper_id"]
          },
          {
            foreignKeyName: "saved_opportunities_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "research_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          member_email: string
          owner_id: string
          permissions: string[] | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_email: string
          owner_id: string
          permissions?: string[] | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_email?: string
          owner_id?: string
          permissions?: string[] | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["investor_id"]
          },
          {
            foreignKeyName: "team_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "deal_pipeline"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "team_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "marketplace_opportunities"
            referencedColumns: ["startup_id"]
          },
          {
            foreignKeyName: "team_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      deal_pipeline: {
        Row: {
          actual_close_date: string | null
          commitment_id: string | null
          deal_created_at: string | null
          deal_id: string | null
          documents: Json | null
          expected_close_date: string | null
          investment_amount: number | null
          investment_type: string | null
          investor_company: string | null
          investor_email: string | null
          investor_id: string | null
          investor_message: string | null
          investor_name: string | null
          milestones: Json | null
          notes: string | null
          paper_authors: string[] | null
          paper_id: string | null
          paper_title: string | null
          progress: number | null
          start_date: string | null
          startup_company: string | null
          startup_email: string | null
          startup_id: string | null
          startup_name: string | null
          status: string | null
          success_fee_amount: number | null
          success_fee_paid: boolean | null
          timeline: string | null
        }
        Relationships: []
      }
      marketplace_opportunities: {
        Row: {
          abstract: string | null
          analysis_id: string | null
          authors: string[] | null
          created_at: string | null
          cvs_score: number | null
          funding_goal: number | null
          industry: string | null
          market_score: number | null
          marketplace_description: string | null
          paper_id: string | null
          stage: string | null
          startup_company: string | null
          startup_id: string | null
          startup_name: string | null
          summary: string | null
          tam: number | null
          tech_category: string | null
          technical_score: number | null
          title: string | null
          trl: number | null
          view_count: number | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
