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
    const [transactions, budgets] = await Promise.all([
      listTransactions(session.user.id, { sinceISO: monthsAgoISO(6) }),
      listBudgets(session.user.id),
    ]);
    return { transactions, budgets };
  }, [session?.user.id]);

  const data = useMemo<InsightsData | null>(() => {
    if (!raw.data) return null;
    const { transactions, budgets } = raw.data;
    const monthStart = new Date(startOfMonthISO()).getTime();
    const weekStart = Date.now() - SEVEN_DAYS_MS;

    return {
      budgetsSpend: budgetsWithSpend(
        budgets,
        transactions.filter((t) => new Date(t.occurred_at).getTime() >= monthStart),
      ),
      weeklySpend: computeWeeklySpend(
        transactions.filter((t) => new Date(t.occurred_at).getTime() >= weekStart),
      ),
      netWorthHistory: computeNetWorthHistory(transactions, profile?.starting_net_worth ?? 0, 6),
      transactions,
    };
  }, [raw.data, profile?.starting_net_worth]);

  return { data, loading: raw.loading, error: raw.error, refetch: raw.refetch };
}
