import { useAuth } from "@/lib/auth-context";
import { mergeAchievements } from "@/lib/aggregate";
import { listAchievements, listUserAchievements, type Achievement } from "@/lib/data/achievements";

import { useAsync, type AsyncState } from "./useAsync";

export type AchievementWithProgress = Achievement & { unlocked: boolean; progress: number };

export function useAchievements(): AsyncState<AchievementWithProgress[]> {
  const { session } = useAuth();
  return useAsync(async () => {
    if (!session) return [];
    const [achievements, userAchievements] = await Promise.all([
      listAchievements(),
      listUserAchievements(session.user.id),
    ]);
    return mergeAchievements(achievements, userAchievements);
  }, [session?.user.id]);
}
