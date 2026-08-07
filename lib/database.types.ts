// Hand-written to match supabase/migrations/0001_init.sql.
// Once a live Supabase project exists, regenerate from source of truth with:
//   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
// and diff against this file before trusting it blindly.

export type CategoryId =
  | "food"
  | "transport"
  | "housing"
  | "fun"
  | "shopping"
  | "health"
  | "bills"
  | "learning";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          handle: string;
          xp: number;
          streak_days: number;
          starting_net_worth: number;
          monthly_income: number;
          monthly_fixed: number;
          monthly_variable: number;
          coffee_per_month: number;
          persona_id: string | null;
          subscriptions: { id: string; name: string; cost: number }[];
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          handle?: string;
          xp?: number;
          streak_days?: number;
          starting_net_worth?: number;
          monthly_income?: number;
          monthly_fixed?: number;
          monthly_variable?: number;
          coffee_per_month?: number;
          persona_id?: string | null;
          subscriptions?: { id: string; name: string; cost: number }[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          merchant: string;
          amount: number;
          category: CategoryId;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          merchant?: string;
          amount: number;
          category: CategoryId;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: CategoryId;
          monthly_limit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: CategoryId;
          monthly_limit: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target: number;
          saved: number;
          monthly: number;
          icon: string;
          accent_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target: number;
          saved?: number;
          monthly?: number;
          icon?: string;
          accent_index?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          detail: string;
          icon: string;
          xp: number;
        };
        Insert: {
          id: string;
          title: string;
          detail: string;
          icon: string;
          xp?: number;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked: boolean;
          progress: number;
          unlocked_at: string | null;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked?: boolean;
          progress?: number;
          unlocked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      category_id: CategoryId;
    };
    CompositeTypes: Record<string, never>;
  };
};
