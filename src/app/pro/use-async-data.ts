/**
 * Small server-state hook for the OC Pro seam.
 *
 * Every seam function returns `ApiResponse<T>` ({ data, error }) rather than throwing, so
 * this hook unwraps that contract into loading / data / error states and gives pages a
 * `refresh` to call after writes. Deliberately not a query library — the Vue portal used
 * plain composable calls, and four pages of read-mostly data do not justify one yet.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "./types";

interface AsyncDataState<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
}

export function useAsyncData<T>(fetcher: () => Promise<ApiResponse<T>>): AsyncDataState<T> & {
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: undefined,
    error: undefined,
    loading: true,
  });

  // Tracks the latest in-flight request so a stale response never overwrites a fresh one,
  // and unmount stops all writes.
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true }));
    const { data, error } = await fetcher();
    if (id !== requestId.current) return;
    setState({ data, error: error?.message, loading: false });
  }, [fetcher]);

  useEffect(() => {
    void refresh();
    return () => {
      // Invalidate in-flight requests on unmount.
      requestId.current++;
    };
  }, [refresh]);

  return { ...state, refresh };
}
