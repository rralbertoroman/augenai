"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllClassificationsWithFeedbacksAndExtrasByUserId } from "@/server/services/classification";
import type { EnrichedClassificationWithExtras } from "@/server/zod-schemas";

// Use the Zod type directly with additional processing fields
export interface ClassificationWithFeedback
  extends EnrichedClassificationWithExtras {
  predicted_class_id?: number;
  original_confidence?: number;
  isReviewed?: boolean;
}

type UsePredictionsWithFeedbackReturn = {
  predictions: ClassificationWithFeedback[];
  isLoading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
};

export function usePredictionsWithFeedback(): UsePredictionsWithFeedbackReturn {
  const { user, accessToken } = useAuth();
  const [predictions, setPredictions] = useState<ClassificationWithFeedback[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPredictions = useCallback(
    (data: EnrichedClassificationWithExtras[]) => {
      return data.map((classification) => {
        // Find the main feedback (where isMainData is true)
        const mainFeedback = classification.feedbacks?.find(
          (fb) => fb.isMainData,
        );

        const processed: ClassificationWithFeedback = {
          ...classification,
        };

        if (mainFeedback) {
          processed.class_id = mainFeedback.classId;
          processed.confidence = mainFeedback.confidence;
          processed.predicted_class_id = classification.class_id;
          processed.original_confidence = classification.confidence;
          processed.isReviewed = true;
        }

        return processed;
      });
    },
    [],
  );

  const fetchPredictions = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllClassificationsWithFeedbacksAndExtrasByUserId(
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
