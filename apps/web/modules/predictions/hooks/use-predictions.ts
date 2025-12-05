"use client";

import { useState, useEffect } from "react";
import { getAllPredictionsWithExtrasByUserId } from "@/server/services/prediction";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type {
  TaskWithExtras,
  ClassificationWithExtras,
  DetectionWithExtras,
  PredictionWithExtras,
} from "@/server/zod-schemas/prediction_workflow";

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

export function getSortedPredictions(
  predictions: TaskWithExtras[],
): TaskWithExtras[] {
  return [...predictions].sort((a, b) => b.confidence - a.confidence);
}

export function usePredictions() {
  const { user, accessToken } = useAuth();
  const [predictions, setPredictions] = useState<TaskWithExtras[]>([]);
  const [selectedPrediction, setSelectedPrediction] =
    useState<TaskWithExtras | null>(null);
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
      // Fetch hierarchical data
      const data = await getAllPredictionsWithExtrasByUserId(token, userId);

      // Flatten to match UI expectations (TaskWithExtras[])
      const flattenedPredictions: TaskWithExtras[] = data.flatMap(
        (pred: PredictionWithExtras) => {
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
        },
      );

      setPredictions(flattenedPredictions);
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
  function getFilteredPredictions(query: string): TaskWithExtras[] {
    return predictions.filter((prediction) => {
      // Access properties safely based on type guard or common properties
      // Both have id, patient_id, etc.
      const idMatch = prediction.id
        ?.toLowerCase()
        .includes(query.toLowerCase());
      const patientMatch = prediction.patient_name
        ?.toLowerCase()
        .includes(query.toLowerCase());

      // Specific checks
      let specificMatch = false;
      if ("disease_name" in prediction) {
        specificMatch = prediction.disease_name
          .toLowerCase()
          .includes(query.toLowerCase());
      } else if ("lesion_name" in prediction) {
        specificMatch = prediction.lesion_name
          .toLowerCase()
          .includes(query.toLowerCase());
      }

      return idMatch || patientMatch || specificMatch;
    });
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
