"use client";

import { useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/contexts/dashboard-context";
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
  const { systemPredictions, isLoading, error, refreshData } = useDashboard();

  const { stageTotalData, cohortData, hasData } = useMemo(() => {
    if (isLoading || !systemPredictions || systemPredictions.length === 0) {
      return {
        stageTotalData: [],
        cohortData: [],
        hasData: false,
      };
    }

    return {
      stageTotalData: calculateStageTotals(systemPredictions),
      cohortData: calculateCohortData(systemPredictions),
      hasData: true,
    };
  }, [systemPredictions, isLoading]);

  return {
    stageTotalData,
    cohortData,
    isLoading,
    error,
    hasData,
    refreshStats: refreshData,
  };
}
