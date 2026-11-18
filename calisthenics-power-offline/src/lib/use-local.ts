"use client";
import * as React from "react";

// Adapter: makes useQuery work with local-storage data
// Usage: const { data } = useLocalQuery("profile", () => getProfile());
export function useLocalQuery<T>(
  key: string,
  fn: () => T,
  deps: React.DependencyList = [],
): { data: T | undefined; isLoading: boolean; refetch: () => void } {
  const [data, setData] = React.useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(() => {
    try {
      setData(fn());
    } catch (e) {
      console.error("useLocalQuery error:", e);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  React.useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, refetch: load };
}

// Adapter for mutations
export function useLocalMutation<T, V>(
  fn: (vars: V) => T,
): {
  mutate: (vars: V) => void;
  isPending: boolean;
} {
  const [isPending, setIsPending] = React.useState(false);

  const mutate = React.useCallback(
    (vars: V) => {
      setIsPending(true);
      try {
        fn(vars);
      } finally {
        setIsPending(false);
      }
    },
    [fn],
  );

  return { mutate, isPending };
}
