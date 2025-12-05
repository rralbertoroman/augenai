import { useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/contexts/dashboard-context";
import {
  calculateF1ScoreData,
  calculateConfusionMatrices,
  type F1ScoreData,
  type ConfusionMatrixData,
} from "@/lib/stats-utils";

export type { F1ScoreData, ConfusionMatrixData };

export function useModelStats() {
  const { systemPredictions, predictionClasses, isLoading } = useDashboard();

  // Process data
  const stats = useMemo(() => {
    if (isLoading || !systemPredictions.length || !predictionClasses.length) {
      return {
        f1ScoreData: [],
        confusionMatrixData: [],
        hasData: false,
      };
    }

    return {
      f1ScoreData: calculateF1ScoreData(systemPredictions),
      confusionMatrixData: calculateConfusionMatrices(
        systemPredictions,
        predictionClasses,
      ),
      hasData: true,
    };
  }, [systemPredictions, predictionClasses, isLoading]);

  return {
    ...stats,
    isLoading,
  };
}
