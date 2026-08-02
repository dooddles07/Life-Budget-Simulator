import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInput = Database["public"]["Tables"]["profiles"]["Insert"];

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Used by both signup (create) and onboarding finish (persist persona/income/goal choice) --
// same upsert covers both since profiles.id === auth.uid() is the only identity.
export async function upsertProfile(input: ProfileInput): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").upsert(input).select().single();
  if (error) throw error;
  return data;
}
