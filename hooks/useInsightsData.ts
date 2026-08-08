import { useMemo } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  budgetsWithSpend,
  computeNetWorthHistory,
  computeWeeklySpend,
  monthsAgoISO,
  startOfMonthISO,
} from "@/lib/aggregate";
import { listBudgets, type Budget } from "@/lib/data/budgets";
import { listTransactions, type Transaction } from "@/lib/data/transactions";

import { useAsync, type AsyncState } from "./useAsync";

export type InsightsData = {
  budgetsSpend: (Budget & { spent: number })[];
  weeklySpend: { label: string; value: number }[];
  netWorthHistory: { label: string; value: number }[];
  transactions: Transaction[];
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useInsightsData(): AsyncState<InsightsData> {
  const { session, profile } = useAuth();

  const raw = useAsync(async () => {
    if (!session) return null;
    // Net worth history needs every transaction ever (running total from
    // starting_net_worth) -- same reasoning as useHomeData's netWorth calc.
    // Everything else here windows down from this same full fetch.
    const [transactions, budgets] = await Promise.all([
      listTransactions(session.user.id),
      listBudgets(session.user.id),
    ]);
    // Captured at fetch time, not render time -- the weekly window should
    // reflect when the data was pulled, not whenever this memo happens to re-run.
    return { transactions, budgets, weekStart: Date.now() - SEVEN_DAYS_MS };
  }, [session?.user.id]);

  const data = useMemo<InsightsData | null>(() => {
    if (!raw.data) return null;
    const { transactions, budgets, weekStart } = raw.data;
    const monthStart = new Date(startOfMonthISO()).getTime();
    const sixMonthsAgo = new Date(monthsAgoISO(6)).getTime();
    const recentTransactions = transactions.filter(
      (t) => new Date(t.occurred_at).getTime() >= sixMonthsAgo,
    );

    return {
      budgetsSpend: budgetsWithSpend(
        budgets,
        transactions.filter((t) => new Date(t.occurred_at).getTime() >= monthStart),
      ),
      weeklySpend: computeWeeklySpend(
        transactions.filter((t) => new Date(t.occurred_at).getTime() >= weekStart),
      ),
      netWorthHistory: computeNetWorthHistory(transactions, profile?.starting_net_worth ?? 0, 6),
      transactions: recentTransactions,
    };
  }, [raw.data, profile?.starting_net_worth]);

  return { data, loading: raw.loading, error: raw.error, refetch: raw.refetch };
}
