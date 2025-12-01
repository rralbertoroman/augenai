"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllSystemClassificationsWithFeedbacksAndExtras } from "@/server/services/classification";
import type { EnrichedClassificationWithExtras } from "@/server/zod-schemas";

// Use the Zod type directly with additional processing fields
export interface DashboardPrediction extends EnrichedClassificationWithExtras {
  predicted_class_id?: number;
  original_confidence?: number;
  isReviewed?: boolean;
}

type DashboardContextType = {
  predictions: DashboardPrediction[];
  selectedPrediction: DashboardPrediction | null;
  setSelectedPrediction: (prediction: DashboardPrediction | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getFilteredPredictions: (query: string) => DashboardPrediction[];
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken } = useAuth();
  const [predictions, setPredictions] = useState<DashboardPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] =
    useState<DashboardPrediction | null>(null);

  const processPredictions = useCallback(
    (data: EnrichedClassificationWithExtras[]) => {
      return data.map((classification) => {
        // Find the main feedback (where isMainData is true)
        const mainFeedback = classification.feedbacks?.find(
          (fb) => fb.isMainData,
        );

        const processed: DashboardPrediction = {
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
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const data =
        await getAllSystemClassificationsWithFeedbacksAndExtras(accessToken);
      const processedData = processPredictions(data);
      setPredictions(processedData);
      console.log(`Fetched ${processedData.length} predictions`);
    } catch (err) {
      console.error("Failed to fetch predictions with feedback:", err);
      setError("Error al cargar predicciones. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, processPredictions]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Filter predictions based on search query
  const getFilteredPredictions = useCallback(
    (query: string): DashboardPrediction[] => {
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
    await fetchPredictions();
  }, [fetchPredictions]);

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
};

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
