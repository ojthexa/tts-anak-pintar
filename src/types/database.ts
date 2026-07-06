/**
 * Database type definitions for Supabase
 * Generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          role: string;
          grade: number | null;
          xp: number;
          coins: number;
          level: number;
          created_at: string;
          last_login_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          role?: string;
          grade?: number | null;
          xp?: number;
          coins?: number;
          level?: number;
          created_at?: string;
          last_login_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          role?: string;
          grade?: number | null;
          xp?: number;
          coins?: number;
          level?: number;
          created_at?: string;
          last_login_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      puzzles: {
        Row: {
          id: string;
          title: string;
          theme: string;
          difficulty: string;
          subject: string;
          grade: number;
          grid_data: Json;
          words: Json;
          is_daily: boolean;
          approved: boolean;
          created_by: string | null;
          source_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          theme: string;
          difficulty: string;
          subject: string;
          grade: number;
          grid_data: Json;
          words: Json;
          is_daily?: boolean;
          approved?: boolean;
          created_by?: string | null;
          source_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          theme?: string;
          difficulty?: string;
          subject?: string;
          grade?: number;
          grid_data?: Json;
          words?: Json;
          is_daily?: boolean;
          approved?: boolean;
          created_by?: string | null;
          source_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      puzzle_attempts: {
        Row: {
          id: string;
          user_id: string;
          puzzle_id: string;
          score: number;
          time_seconds: number;
          hints_used: number;
          words_found: number;
          total_words: number;
          accuracy: number;
          xp_earned: number;
          coins_earned: number;
          completed: boolean;
          mode: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          puzzle_id: string;
          score?: number;
          time_seconds?: number;
          hints_used?: number;
          words_found?: number;
          total_words?: number;
          accuracy?: number;
          xp_earned?: number;
          coins_earned?: number;
          completed?: boolean;
          mode?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          puzzle_id?: string;
          score?: number;
          time_seconds?: number;
          hints_used?: number;
          words_found?: number;
          total_words?: number;
          accuracy?: number;
          xp_earned?: number;
          coins_earned?: number;
          completed?: boolean;
          mode?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          xp_reward: number;
          coins_reward: number;
          requirement_type: string;
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          xp_reward?: number;
          coins_reward?: number;
          requirement_type: string;
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          xp_reward?: number;
          coins_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
        Relationships: [
          {
            type: "foreign";
            columns: ["achievement_id"];
            foreignKeys: { table: "achievements"; schema: "public"; columns: ["id"] };
          }
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          user_id: string | null;
          display_name: string | null;
          avatar_url: string | null;
          score: number | null;
          level: number | null;
          rank: number | null;
        };
        Insert: never;
        Update: never;
        Delete: never;
      };
    };
    Functions: {
      get_daily_puzzle: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["puzzles"]["Row"][];
      };
      get_user_stats: {
        Args: { user_id: string };
        Returns: Array<{
          total_puzzles: number;
          completed_puzzles: number;
          total_score: number;
          average_time: number;
          total_xp: number;
          accuracy: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
