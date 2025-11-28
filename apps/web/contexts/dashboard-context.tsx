"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { usePredictionsWithFeedback } from "@/hooks/use-predictions-with-feedback";
import type { EnrichedPredictionDTO } from "@/server/zod-schemas/prediction";

type DashboardContextType = {
  predictions: EnrichedPredictionDTO[];
  selectedPrediction: EnrichedPredictionDTO | null;
  setSelectedPrediction: (prediction: EnrichedPredictionDTO | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getFilteredPredictions: (query: string) => EnrichedPredictionDTO[];
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { predictions, isLoading, error, refreshPredictions } =
    usePredictionsWithFeedback();

  const [selectedPrediction, setSelectedPrediction] =
    useState<EnrichedPredictionDTO | null>(null);

  // Filter predictions based on search query
  const getFilteredPredictions = useCallback(
    (query: string): EnrichedPredictionDTO[] => {
      if (!query.trim()) return predictions;

      const lowerQuery = query.toLowerCase();
      return predictions.filter(
        (prediction) =>
          prediction.patient_id?.toLowerCase().includes(lowerQuery) ||
          prediction.disease_name?.toLowerCase().includes(lowerQuery) ||
          prediction.stage_content?.toLowerCase().includes(lowerQuery),
      );
    },
    [predictions],
  );

  const refreshData = useCallback(async () => {
    if (refreshPredictions) {
      await refreshPredictions();
    }
  }, [refreshPredictions]);

  return (
    <DashboardContext.Provider
      value={{
        predictions,
        selectedPrediction,
        setSelectedPrediction,
        isLoading,
        error,
        refreshData,
        getFilteredPredictions,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
