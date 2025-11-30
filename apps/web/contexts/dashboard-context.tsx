"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getAllPredictionRequestsWithFeedbacksByUserId,
  getAllSystemPredictionRequests,
} from "@/server/services/prediction_request";
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

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken } = useAuth();
  const [predictions, setPredictions] = useState<EnrichedPredictionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] =
    useState<EnrichedPredictionDTO | null>(null);

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
        // Store original values
        predicted_class_id: prediction.class_id,
        original_confidence: prediction.confidence,
        // Mark as reviewed if there's a main feedback
        isReviewed: true,
      };
    });
  }, []);

  const fetchPredictions = useCallback(async () => {
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllSystemPredictionRequests(accessToken);
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
