import { supabase } from "../supabase";
import type { CategoryId, Database } from "../database.types";

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export async function listBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase.from("budgets").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}

// Rough share of monthly income per category -- gives a new signup a
// sensible starting envelope instead of the burn ring/Budgets screen being
// empty (there's no other source of a first budget; the old mock shipped
// with 8 pre-populated rows, real accounts start with zero).
const DEFAULT_CATEGORY_SHARE: Record<CategoryId, number> = {
  housing: 0.25,
  food: 0.15,
  bills: 0.1,
  transport: 0.06,
  shopping: 0.06,
  fun: 0.05,
  learning: 0.05,
  health: 0.04,
};

export async function seedDefaultBudgets(userId: string, monthlyIncome: number): Promise<void> {
  const rows = (Object.keys(DEFAULT_CATEGORY_SHARE) as CategoryId[]).map((category) => ({
    user_id: userId,
    category,
    monthly_limit: Math.round(monthlyIncome * DEFAULT_CATEGORY_SHARE[category]),
  }));
  const { error } = await supabase.from("budgets").insert(rows);
  if (error) throw error;
}
