import { useAuth } from "@/lib/auth-context";
import { budgetsWithSpend, startOfMonthISO } from "@/lib/aggregate";
import { listBudgets, type Budget } from "@/lib/data/budgets";
import { listTransactions } from "@/lib/data/transactions";

import { useAsync, type AsyncState } from "./useAsync";

export function useBudgetsWithSpend(): AsyncState<(Budget & { spent: number })[]> {
  const { session } = useAuth();
  return useAsync(async () => {
    if (!session) return [];
    const [budgets, transactions] = await Promise.all([
      listBudgets(session.user.id),
      listTransactions(session.user.id, { sinceISO: startOfMonthISO() }),
    ]);
    return budgetsWithSpend(budgets, transactions);
  }, [session?.user.id]);
}
