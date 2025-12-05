"use client";

import { useState, useEffect, useCallback } from "react";
import { translateErrorMessage } from "@/lib/error-translator";

/**
 * Generic hook for data fetching with loading and error states.
 * Automatically fetches on mount and when dependencies change.
 *
 * @param fetchFn - Async function that returns data
 * @param deps - Dependencies array that triggers refetch when changed
 * @param options - Optional configuration
 * @returns { data, isLoading, error, refresh }
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  options: {
    /** Skip initial fetch */
    skip?: boolean;
    /** Initial data value */
    initialData?: T | null;
    /** Transform error before setting state */
    transformError?: (error: unknown) => string;
  } = {},
) {
  const { skip = false, initialData = null, transformError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const errorMessage = transformError
        ? transformError(err)
        : translateErrorMessage(
            err instanceof Error ? err : new Error("Error desconocido"),
          );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, transformError, ...deps]);

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [fetchData, skip]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    setData,
  };
}

/**
 * Hook for mutations (create, update, delete) with loading and error states.
 * Does not auto-execute - call mutate() to trigger.
 *
 * @param mutationFn - Async function that performs the mutation
 * @param options - Optional configuration
 * @returns { mutate, isLoading, error, reset }
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    /** Called on successful mutation */
    onSuccess?: (data: TData) => void;
    /** Called on error */
    onError?: (error: string) => void;
    /** Transform error before setting state */
    transformError?: (error: unknown) => string;
  } = {},
) {
  const { onSuccess, onError, transformError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = transformError
          ? transformError(err)
          : translateErrorMessage(
              err instanceof Error ? err : new Error("Error desconocido"),
            );
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, transformError],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    data,
    reset,
  };
}

/**
 * Hook for lazy data fetching - does not auto-fetch on mount.
 * Call fetch() manually when needed.
 *
 * @param fetchFn - Async function that returns data
 * @returns { data, isLoading, error, fetch, reset }
 */
export function useLazyFetch<T, TVariables = void>(
  fetchFn: (variables: TVariables) => Promise<T>,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (variables: TVariables): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFn(variables);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = translateErrorMessage(
          err instanceof Error ? err : new Error("Error desconocido"),
        );
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetch,
    reset,
    setData,
  };
}
