"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllPredictionsWithFeedbacksAndExtrasByUserId } from "@/server/services/prediction";
import type {
  TaskWithExtras,
  ClassificationWithExtras,
  DetectionWithExtras,
  PredictionWithExtras,
} from "@/server/zod-schemas/prediction_workflow";

type UsePredictionsWithFeedbackReturn = {
  predictions: TaskWithExtras[];
  isLoading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
};

export function usePredictionsWithFeedback(): UsePredictionsWithFeedbackReturn {
  const { user, accessToken } = useAuth();
  const [predictions, setPredictions] = useState<TaskWithExtras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPredictions = useCallback((data: PredictionWithExtras[]) => {
    return data.flatMap((pred) => {
      const results: TaskWithExtras[] = [];

      // Process Classifications
      pred.classifications.forEach((c: ClassificationWithExtras) => {
        results.push(c);
      });

      // Process Detections
      pred.detections.forEach((d: DetectionWithExtras) => {
        results.push(d);
      });

      return results;
    });
  }, []);

  const fetchPredictions = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllPredictionsWithFeedbacksAndExtrasByUserId(
        accessToken,
        user.id,
      );
      const processedData = processPredictions(data);
      setPredictions(processedData);
    } catch (err) {
      console.error("Failed to fetch predictions with feedback:", err);
      setError("Error al cargar predicciones. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, accessToken, processPredictions]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    isLoading,
    error,
    refreshPredictions: fetchPredictions,
  };
}
