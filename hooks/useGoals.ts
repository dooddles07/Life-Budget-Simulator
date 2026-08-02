import { useAuth } from "@/lib/auth-context";
import { listGoals, type Goal } from "@/lib/data/goals";

import { useAsync, type AsyncState } from "./useAsync";

export function useGoals(): AsyncState<Goal[]> {
  const { session } = useAuth();
  return useAsync(async () => (session ? listGoals(session.user.id) : []), [session?.user.id]);
}
