import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInput = Database["public"]["Tables"]["goals"]["Insert"];

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function addGoal(input: GoalInput): Promise<Goal> {
  const { data, error } = await supabase.from("goals").insert(input).select().single();
  if (error) throw error;
  return data;
}
