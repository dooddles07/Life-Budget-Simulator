import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}
