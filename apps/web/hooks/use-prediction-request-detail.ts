import { useState, useEffect } from "react";
import { getPredictionRequestById } from "@/server/services/prediction_request";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";

export function usePredictionRequestDetail(requestId: string) {
  const { accessToken } = useAuth();
  const [request, setRequest] = useState<PredictionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId && accessToken) {
      fetchRequest(requestId, accessToken);
    }
  }, [requestId, accessToken]);

  const fetchRequest = async (id: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Cargar request con feedbacks incluidos
      const result = await getPredictionRequestById(token, id, true);

      if (!result) {
        throw new Error("No se encontró la solicitud de predicción");
      }

      setRequest(result);
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error(String(err)),
      );
      setError(errorMessage);
      setRequest(null);
      console.error("Failed to fetch prediction request detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    request,
    isLoading,
    error,
    refreshRequest: () =>
      requestId && accessToken && fetchRequest(requestId, accessToken),
  };
}
