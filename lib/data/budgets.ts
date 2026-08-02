import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export async function listBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase.from("budgets").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}
