import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  calculateF1ScoreData,
  calculateConfusionMatrices,
  type F1ScoreData,
  type ConfusionMatrixData,
} from "@/lib/stats-utils";

export type { F1ScoreData, ConfusionMatrixData };

export function useModelStats() {
  const { predictions, predictionClasses, isLoading } = useDashboard();

  // Process data
  const stats = useMemo(() => {
    if (isLoading || !predictions.length || !predictionClasses.length) {
      return {
        f1ScoreData: [],
        confusionMatrixData: [],
        hasData: false,
      };
    }

    return {
      f1ScoreData: calculateF1ScoreData(predictions),
      confusionMatrixData: calculateConfusionMatrices(
        predictions,
        predictionClasses,
      ),
      hasData: true,
    };
  }, [predictions, predictionClasses, isLoading]);

  return {
    ...stats,
    isLoading,
  };
}
