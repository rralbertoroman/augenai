"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllPredictionRequestsWithFeedbacksByUserId } from "@/server/services/prediction_request";
import type { EnrichedPredictionDTO } from "@/server/zod-schemas/prediction";

type UsePredictionsWithFeedbackReturn = {
  predictions: EnrichedPredictionDTO[];
  isLoading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
};

export function usePredictionsWithFeedback(): UsePredictionsWithFeedbackReturn {
  const { user, accessToken } = useAuth();
  const [predictions, setPredictions] = useState<EnrichedPredictionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPredictions = useCallback((data: EnrichedPredictionDTO[]) => {
    return data.map((prediction) => {
      // Find the main feedback (where isMainData is true)
      const mainFeedback = prediction.feedbacks?.find((fb) => fb.isMainData);

      if (!mainFeedback) return prediction;

      // For now, we can only update the class_id from feedback
      // since that's the only feedback data we have
      return {
        ...prediction,
        // Update class_id from feedback
        class_id: mainFeedback.classId,
        // Update confidence from feedback
        confidence: mainFeedback.confidence,
        // Mark as reviewed if there's a main feedback
        isReviewed: true,
      };
    });
  }, []);

  const fetchPredictions = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllPredictionRequestsWithFeedbacksByUserId(
        accessToken,
        user.id,
      );
      const processedData = processPredictions(data);
      setPredictions(processedData);
    } catch (err) {
      console.error("Failed to fetch predictions with feedback:", err);
      setError("Failed to load predictions. Please try again.");
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
