import { supabase } from "../supabase";

// XP, streak, and achievement-unlock logic all live server-side
// (supabase/migrations/0003_gamification.sql) so the client never writes
// those columns directly -- see docs/PRODUCT.md Product Principle #2.

/** Call once, right after a transaction insert succeeds. */
export async function awardTransactionXp(): Promise<void> {
  const { error } = await supabase.rpc("award_transaction_xp");
  if (error) throw error;
}

/** Call when the user closes the Simulator having actually moved a lever. */
export async function recordSimulatorRun(): Promise<void> {
  const { error } = await supabase.rpc("record_simulator_run");
  if (error) throw error;
}
