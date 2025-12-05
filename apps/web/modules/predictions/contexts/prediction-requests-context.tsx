"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllPredictionRequestsWithPredictionsByUserId } from "@/server/services/prediction_request";
import { translateErrorMessage } from "@/lib/error-translator";
import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";
import { usePagination } from "@/hooks/use-pagination";
import type { PredictionRequestsContextType } from "../types";
import { INITIAL_PAGE_SIZE } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const PredictionRequestsContext = createContext<
  PredictionRequestsContextType | undefined
>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

export const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTaskLabel = (task: string) => {
  const taskMap: Record<string, string> = {
    classification: "Clasificación",
    detection: "Detección",
    segmentation: "Segmentación",
  };
  return taskMap[task] || task;
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function PredictionRequestsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, accessToken } = useAuth();

  // ─────────────────── Data State ───────────────────

  const [allRequests, setAllRequests] = useState<PredictionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<PredictionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // ─────────────────── Pagination ───────────────────

  const pagination = usePagination(INITIAL_PAGE_SIZE);
  const { setTotalItems } = pagination;

  // ─────────────────── Fetch Data ───────────────────

  const fetchRequests = useCallback(
    async (force = false) => {
      if (!user?.id || !accessToken) return;
      if (hasFetched && !force) return; // Skip if already fetched

      setIsLoading(true);
      setError(null);

      try {
        const { requests: data } =
          await getAllPredictionRequestsWithPredictionsByUserId(
            accessToken,
            user.id,
          );
        setAllRequests(data);
        setTotalItems(data.length);
        setHasFetched(true);
      } catch (err) {
        const errorMessage = translateErrorMessage(
          err instanceof Error ? err : new Error(String(err)),
        );
        setError(errorMessage);
        console.error("Failed to fetch prediction requests:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, accessToken, setTotalItems, hasFetched],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ─────────────────── Derived Data ───────────────────

  // Paginated requests for current page
  const requests = useMemo(() => {
    const start = pagination.offset;
    const end = start + pagination.pageSize;
    return allRequests.slice(start, end);
  }, [allRequests, pagination.offset, pagination.pageSize]);

  // Map for quick lookup by ID
  const requestsMap = useMemo(() => {
    const map = new Map<string, PredictionRequest>();
    allRequests.forEach((request) => {
      if (request.id) {
        map.set(request.id, request);
      }
    });
    return map;
  }, [allRequests]);

  // ─────────────────── Actions ───────────────────

  const getRequestById = useCallback(
    (id: string) => requestsMap.get(id),
    [requestsMap],
  );

  const getDiagnosesForRequest = useCallback(
    (requestId: string) => {
      const request = requestsMap.get(requestId);
      return request?.predictions;
    },
    [requestsMap],
  );

  // ─────────────────── Actions ───────────────────

  const refreshRequests = useCallback(async () => {
    await fetchRequests(true); // Force refresh
  }, [fetchRequests]);

  // ─────────────────── Context Value ───────────────────

  const value: PredictionRequestsContextType = useMemo(
    () => ({
      requests,
      allRequests,
      requestsMap,
      selectedRequest,
      setSelectedRequest,
      isLoading,
      error,
      refreshRequests,
      getRequestById,
      getDiagnosesForRequest,
      pagination,
    }),
    [
      requests,
      allRequests,
      requestsMap,
      selectedRequest,
      isLoading,
      error,
      refreshRequests,
      getRequestById,
      getDiagnosesForRequest,
      pagination,
    ],
  );

  return (
    <PredictionRequestsContext.Provider value={value}>
      {children}
    </PredictionRequestsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePredictionRequests() {
  const context = useContext(PredictionRequestsContext);
  if (context === undefined) {
    throw new Error(
      "usePredictionRequests must be used within a PredictionRequestsProvider",
    );
  }
  return context;
}
