"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPredictionRequestsWithPredictionsByUserId } from "@/server/services/prediction_request";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";
import { usePagination } from "./use-pagination";

const INITIAL_PAGE_SIZE = 10;

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

export function usePredictionRequests() {
  const { user, accessToken } = useAuth();
  const [requests, setRequests] = useState<PredictionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pagination = usePagination(INITIAL_PAGE_SIZE);

  useEffect(() => {
    if (user?.id && accessToken) {
      fetchRequests(user.id, accessToken);
    }
  }, [user?.id, accessToken, pagination.pageSize, pagination.offset]);

  const fetchRequests = useCallback(
    async (userId: string, token: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { requests: data, count } =
          await getAllPredictionRequestsWithPredictionsByUserId(
            token,
            userId,
            pagination.pageSize,
            pagination.offset,
          );
        setRequests(data);
        pagination.setTotalItems(count);
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
    [pagination],
  );

  const getDiagnosesForRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    return request?.predictions;
  };

  const getRequestInfo = (requestId: string) => {
    return requests.find((r) => r.id === requestId);
  };

  return {
    requests,
    isLoading,
    error,
    getDiagnosesForRequest,
    getRequestInfo,
    refreshRequests: () =>
      user?.id && accessToken && fetchRequests(user.id, accessToken),
    pagination,
  };
}
