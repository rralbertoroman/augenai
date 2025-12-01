"use client";

import { useState, useEffect } from "react";
import { getAllClassificationsWithExtrasByUserId } from "@/server/services/classification";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type { EnrichedClassificationWithExtras } from "@/server/zod-schemas";

// Use the Zod type directly
export type Prediction = EnrichedClassificationWithExtras;

// Confidence badge constants
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
} as const;

const CONFIDENCE_LABELS = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
} as const;

const CONFIDENCE_VARIANTS = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
} as const;

export function getConfidenceBadge(confidence: number) {
  if (confidence > CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      variant: CONFIDENCE_VARIANTS.HIGH,
      label: CONFIDENCE_LABELS.HIGH,
    };
  }
  if (confidence > CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      variant: CONFIDENCE_VARIANTS.MEDIUM,
      label: CONFIDENCE_LABELS.MEDIUM,
    };
  }
  return {
    variant: CONFIDENCE_VARIANTS.LOW,
    label: CONFIDENCE_LABELS.LOW,
  };
}

// Utility functions for prediction formatting
export function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getSortedPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => b.confidence - a.confidence);
}

export function usePredictions() {
  const { user, accessToken } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] =
    useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && accessToken) {
      fetchPredictions(user.id, accessToken);
    }
  }, [user?.id, accessToken]);

  const fetchPredictions = async (userId: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllClassificationsWithExtrasByUserId(token, userId);
      setPredictions(data);
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error(String(err)),
      );
      setError(errorMessage);
      console.error("Failed to fetch predictions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering function for predictions
  function getFilteredPredictions(query: string): Prediction[] {
    return predictions.filter(
      (prediction) =>
        prediction.id?.toLowerCase().includes(query.toLowerCase()) ||
        prediction.disease_name.toLowerCase().includes(query.toLowerCase()),
    );
  }

  return {
    predictions,
    selectedPrediction,
    setSelectedPrediction,
    isLoading,
    error,
    refreshPredictions: () =>
      user?.id && accessToken && fetchPredictions(user.id, accessToken),
    getFilteredPredictions,
  };
}
