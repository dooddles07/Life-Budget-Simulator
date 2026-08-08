import { supabase } from "../supabase";

// XP, streak, and achievement-unlock logic all live server-side
// (supabase/migrations/0003_gamification.sql, 0004_gamification_fix.sql) so
// the client never writes those columns directly -- see docs/PRODUCT.md
// Product Principle #2.

/** Call once, right after a transaction insert succeeds. */
export async function awardTransactionXp(): Promise<void> {
  const { error } = await supabase.rpc("award_transaction_xp");
  if (error) throw error;
}

/**
 * Call when the user closes the Simulator having actually moved a lever.
 * `coffeeCut` is the scenario's current coffee-cut value (0-100); passing it
 * lets the RPC unlock "coffee-cutter" when it's at 100 without a separate call.
 */
export async function recordSimulatorRun(coffeeCut: number): Promise<void> {
  const { error } = await supabase.rpc("record_simulator_run", { p_coffee_cut: coffeeCut });
  if (error) throw error;
}

/** Call right after a goal is created (onboarding's first goal, or New Goal). */
export async function recordGoalCreated(): Promise<void> {
  const { error } = await supabase.rpc("record_goal_created");
  if (error) throw error;
}
