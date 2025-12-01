import { useState, useEffect } from "react";
import { getPredictionRequestById } from "@/server/services/prediction_request";
import { getClassificationsWithExtrasByRequestId } from "@/server/services/classification";
import { getAllDiseases } from "@/server/services/disease";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type {
  EnrichedPredictionDTO,
  EnrichedClassificationWithExtras,
} from "@/server/zod-schemas";

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
  classifications: EnrichedClassificationWithExtras[];
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
      const [result, classificationsWithExtras, diseasesData] =
        await Promise.all([
          getPredictionRequestById(token, { id }),
          getClassificationsWithExtrasByRequestId(token, { id }),
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

      // Collect unique disease IDs from classifications with extras
      const diseaseIds = new Set<string>();
      classificationsWithExtras.forEach((c) => diseaseIds.add(c.disease_id));

      const diseaseIdsArray = Array.from(diseaseIds);
      const diseaseNames = diseaseIdsArray
        .map((diseaseId) => diseaseMap.get(diseaseId) || diseaseId)
        .filter(Boolean);

      // Count total classifications + detections
      const totalPredictions = result.predictions.reduce(
        (sum, pred) =>
          sum + pred.classifications.length + pred.detections.length,
        0,
      );

      setRequest({
        id: result.id,
        createdAt: result.created_at,
        patient: {
          name: result.patient_name || "Patient",
        },
        task: result.task,
        imageType: result.image_type,
        diseases: diseaseIdsArray,
        diseaseNames,
        totalPredictions,
        predictions: result.predictions,
        classifications: classificationsWithExtras,
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
