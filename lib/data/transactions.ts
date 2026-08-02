import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInput = Database["public"]["Tables"]["transactions"]["Insert"];

export async function listTransactions(
  userId: string,
  opts?: { limit?: number; sinceISO?: string },
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false });
  if (opts?.sinceISO) query = query.gte("occurred_at", opts.sinceISO);
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addTransaction(input: TransactionInput): Promise<Transaction> {
  const { data, error } = await supabase.from("transactions").insert(input).select().single();
  if (error) throw error;
  return data;
}
