// Pure functions that turn raw Supabase rows into the shapes screens render.
// Kept separate from lib/data/* (I/O) so they're testable without a DB.

import type { CategoryId } from "./database.types";
import type { Achievement, UserAchievement } from "./data/achievements";
import type { Budget } from "./data/budgets";
import type { Transaction } from "./data/transactions";

export function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function monthsAgoISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function computeSpendByCategory(transactions: Transaction[]): Record<CategoryId, number> {
  const totals = {} as Record<CategoryId, number>;
  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // income doesn't count against a category budget
    totals[tx.category] = (totals[tx.category] ?? 0) + Math.abs(tx.amount);
  }
  return totals;
}

export function budgetsWithSpend(
  budgets: Budget[],
  transactions: Transaction[],
): (Budget & { spent: number })[] {
  const spend = computeSpendByCategory(transactions);
  return budgets.map((b) => ({ ...b, spent: spend[b.category] ?? 0 }));
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Expects `transactions` already scoped to the last 7 days by the caller.
export function computeWeeklySpend(transactions: Transaction[]): { label: string; value: number }[] {
  const totals = new Array(7).fill(0);
  for (const tx of transactions) {
    if (tx.amount >= 0) continue;
    const day = new Date(tx.occurred_at).getDay();
    totals[day] += Math.abs(tx.amount);
  }
  // Mon-first to match the old mock's week layout.
  const mondayFirst = [1, 2, 3, 4, 5, 6, 0];
  return mondayFirst.map((day) => ({ label: WEEKDAY_LABELS[day], value: totals[day] }));
}

// Net worth per month = starting balance + cumulative sum of every
// transaction up to and including that month. `transactions` should be
// ordered oldest-first for the running total to come out right.
export function computeNetWorthHistory(
  transactions: Transaction[],
  startingNetWorth: number,
  months = 6,
): { label: string; value: number }[] {
  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );

  let running = startingNetWorth;
  let txIndex = 0;
  const points: { label: string; value: number }[] = [];
  for (const key of monthKeys) {
    const [y, m] = key.split("-").map(Number);
    const monthEnd = new Date(y, m + 1, 1);
    while (txIndex < sorted.length && new Date(sorted[txIndex].occurred_at) < monthEnd) {
      running += sorted[txIndex].amount;
      txIndex += 1;
    }
    points.push({ label: monthEnd.toLocaleString("en-US", { month: "short" }), value: running });
  }
  return points;
}

/** Requires the FULL transaction history, not a time-limited slice -- net
 *  worth is a running total since account creation, not a windowed sum. */
export function computeCurrentNetWorth(transactions: Transaction[], startingNetWorth: number): number {
  return startingNetWorth + transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function computeMonthDelta(transactions: Transaction[]): number {
  const monthStart = new Date(startOfMonthISO()).getTime();
  return transactions
    .filter((t) => new Date(t.occurred_at).getTime() >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0);
}

export type BudgetInsight = {
  id: string;
  tone: "warn" | "bad";
  category: CategoryId;
  amount: number;
};

// Real, derived signals only -- no per-merchant narrative ("coffee is your
// quiet leak") since that needs pattern detection this app doesn't do.
// Screens compose these into display copy with CATEGORY_MAP for the label.
export function computeBudgetInsights(budgets: (Budget & { spent: number })[]): BudgetInsight[] {
  const insights: BudgetInsight[] = [];
  for (const b of budgets) {
    if (b.monthly_limit <= 0) continue;
    if (b.spent > b.monthly_limit) {
      insights.push({ id: `over-${b.category}`, tone: "bad", category: b.category, amount: b.spent - b.monthly_limit });
    } else if (b.spent >= b.monthly_limit * 0.8) {
      insights.push({ id: `near-${b.category}`, tone: "warn", category: b.category, amount: b.monthly_limit - b.spent });
    }
  }
  return insights.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "bad" ? -1 : 1)).slice(0, 3);
}

export function mergeAchievements(
  achievements: Achievement[],
  userAchievements: UserAchievement[],
): (Achievement & { unlocked: boolean; progress: number })[] {
  const byId = new Map(userAchievements.map((ua) => [ua.achievement_id, ua]));
  return achievements.map((a) => {
    const state = byId.get(a.id);
    return { ...a, unlocked: state?.unlocked ?? false, progress: state?.progress ?? 0 };
  });
}
