"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import {
  calculateStageTotals,
  calculateCohortData,
  type StageTotalConfig,
  type CohortDataConfigItem,
  type CohortData,
} from "@/lib/stats-utils";

// Re-export types for backward compatibility
export type { StageTotalConfig, CohortDataConfigItem, CohortData };

export function useMedicalStats() {
  const { predictions, isLoading, error, refreshData } = useDashboard();

  const { stageTotalData, cohortData, hasData } = useMemo(() => {
    if (isLoading || !predictions || predictions.length === 0) {
      return {
        stageTotalData: [],
        cohortData: [],
        hasData: false,
      };
    }

    return {
      stageTotalData: calculateStageTotals(predictions),
      cohortData: calculateCohortData(predictions),
      hasData: true,
    };
  }, [predictions, isLoading]);

  return {
    stageTotalData,
    cohortData,
    isLoading,
    error,
    hasData,
    refreshStats: refreshData,
  };
}
