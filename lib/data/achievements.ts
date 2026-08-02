import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"];

// Static catalog, public read (no user_id column) -- same rows for every user.
export async function listAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from("achievements").select("*");
  if (error) throw error;
  return data;
}

export async function listUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase.from("user_achievements").select("*").eq("user_id", userId);
  if (error) throw error;
  return data;
}
