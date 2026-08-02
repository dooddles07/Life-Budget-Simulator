import { useMemo } from "react";

import { useAuth } from "@/lib/auth-context";
import { computeCurrentNetWorth, computeMonthDelta, startOfMonthISO } from "@/lib/aggregate";
import { listBudgets } from "@/lib/data/budgets";
import { listTransactions, type Transaction } from "@/lib/data/transactions";

import { useAsync, type AsyncState } from "./useAsync";

export type HomeData = {
  netWorth: number;
  monthDelta: number;
  spent: number;
  limit: number;
  safeToSpend: number;
  daysLeft: number;
  recent: Transaction[];
};

export function useHomeData(): AsyncState<HomeData> {
  const { session, profile } = useAuth();

  const raw = useAsync(async () => {
    if (!session) return null;
    // Net worth needs every transaction ever (running total); everything
    // else here only needs this month's, but one fetch covers both cheaply
    // at demo scale.
    const [allTransactions, budgets] = await Promise.all([
      listTransactions(session.user.id),
      listBudgets(session.user.id),
    ]);
    return { allTransactions, budgets };
  }, [session?.user.id]);

  const data = useMemo<HomeData | null>(() => {
    if (!raw.data || !profile) return null;
    const { allTransactions, budgets } = raw.data;

    const monthStart = new Date(startOfMonthISO()).getTime();
    const monthTransactions = allTransactions.filter(
      (t) => new Date(t.occurred_at).getTime() >= monthStart,
    );

    const limit = budgets.reduce((s, b) => s + b.monthly_limit, 0);
    const spent = monthTransactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate());

    return {
      netWorth: computeCurrentNetWorth(allTransactions, profile.starting_net_worth),
      monthDelta: computeMonthDelta(allTransactions),
      spent,
      limit,
      safeToSpend: Math.max(0, Math.round((limit - spent) / daysLeft)),
      daysLeft,
      recent: allTransactions.slice(0, 4),
    };
  }, [raw.data, profile]);

  return { data, loading: raw.loading, error: raw.error, refetch: raw.refetch };
}
