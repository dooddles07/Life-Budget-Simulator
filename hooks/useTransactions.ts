import { useAuth } from "@/lib/auth-context";
import { listTransactions, type Transaction } from "@/lib/data/transactions";

import { useAsync, type AsyncState } from "./useAsync";

export function useTransactions(opts?: {
  limit?: number;
  sinceISO?: string;
}): AsyncState<Transaction[]> {
  const { session } = useAuth();
  return useAsync(
    async () => (session ? listTransactions(session.user.id, opts) : []),
    [session?.user.id, opts?.limit, opts?.sinceISO],
  );
}
