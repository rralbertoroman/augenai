import { useState, useEffect } from "react";
import { getPredictionRequestById } from "@/server/services/prediction_request";
import { getAllDiseases } from "@/server/services/disease";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import { EnrichedPredictionDTO } from "@/server/zod-schemas";

export interface EnrichedPredictionRequestDetail {
  id: string;
  createdAt: Date;
  patient: {
    name: string;
    email?: string;
  };
  task: string;
  imageType: string;
  diseases: string[];
  diseaseNames: string[];
  totalPredictions: number;
  predictions: EnrichedPredictionDTO[];
}

export function usePredictionRequestDetail(requestId: string) {
  const { accessToken } = useAuth();
  const [request, setRequest] =
    useState<EnrichedPredictionRequestDetail | null>(null);
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
      const [result, diseasesData] = await Promise.all([
        getPredictionRequestById(token, { id }),
        getAllDiseases(token),
      ]);

      if (!result) {
        setRequest(null);
        setIsLoading(false);
        return;
      }

      const diseaseMap = new Map(
        diseasesData.map((disease) => [disease.id, disease.name]),
      );

      const diseaseIds = result.enrichedPredictions
        .map((p) => p.disease_id ?? "")
        .filter(Boolean);
      const diseaseNames = diseaseIds
        .map((diseaseId) => diseaseMap.get(diseaseId) || diseaseId)
        .filter(Boolean);

      setRequest({
        id: result.request.id,
        createdAt: result.request.createdAt,
        patient: {
          name: result.patient.name,
        },
        task: result.request.task,
        imageType: result.request.imageType,
        diseases: diseaseIds,
        diseaseNames,
        totalPredictions: result.enrichedPredictions.length,
        predictions: result.enrichedPredictions,
      });
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
