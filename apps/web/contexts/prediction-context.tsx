"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { MultiplePredictionsResponse } from "@/types/prediction";

interface PredictionContextType {
  latestPrediction: MultiplePredictionsResponse | null;
  setLatestPrediction: (prediction: MultiplePredictionsResponse | null) => void;
  showResultsModal: boolean;
  setShowResultsModal: (show: boolean) => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(
  undefined,
);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const [latestPrediction, setLatestPrediction] =
    useState<MultiplePredictionsResponse | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  return (
    <PredictionContext.Provider
      value={{
        latestPrediction,
        setLatestPrediction,
        showResultsModal,
        setShowResultsModal,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
}

export function usePrediction() {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error("usePrediction must be used within a PredictionProvider");
  }
  return context;
}
