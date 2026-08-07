import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/** Shared fetch/loading/error wrapper so screens don't hand-roll the same
 *  try/catch/cancelled-flag boilerplate against the data layer. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        if (!cancelled) setData(result);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // deps is caller-controlled (mirrors useEffect's own contract) -- fn is
    // intentionally excluded since callers pass a fresh closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  // Screens sharing this hook (Home, Budgets, Transactions, Insights, ...)
  // otherwise show stale data after mutating elsewhere -- e.g. logging an
  // expense in the Add modal doesn't touch Home's deps, so its mount effect
  // never re-runs on return. Skip the first focus since the mount effect
  // above already covers it.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );

  return { data, loading, error, refetch };
}
