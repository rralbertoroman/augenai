"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAllPredictionsWithFeedbacksAndExtrasByUserId } from "@/server/services/prediction";
import type { TaskWithExtras } from "@/server/zod-schemas/prediction_workflow";
import { flattenPredictions } from "@/lib/prediction-transformer";

import { getAllPredictionClasses } from "@/server/services/prediction_class_disease";
import type { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";

type DashboardContextType = {
  predictions: TaskWithExtras[];
  predictionClasses: PredictionClassDiseaseWithDisease[];
  selectedPrediction: TaskWithExtras | null;
  setSelectedPrediction: (prediction: TaskWithExtras | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getFilteredPredictions: (query: string) => TaskWithExtras[];
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, user } = useAuth();
  const [predictions, setPredictions] = useState<TaskWithExtras[]>([]);
  const [predictionClasses, setPredictionClasses] = useState<
    PredictionClassDiseaseWithDisease[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] =
    useState<TaskWithExtras | null>(null);

  const fetchPredictions = useCallback(async () => {
    if (!accessToken || !user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [predictionsData, classesData] = await Promise.all([
        getAllPredictionsWithFeedbacksAndExtrasByUserId(accessToken, user.id),
        getAllPredictionClasses(accessToken),
      ]);

      // Flatten predictions using utility function
      const processedData = flattenPredictions(predictionsData);

      setPredictions(processedData);
      setPredictionClasses(classesData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        "Error al cargar datos del dashboard. Por favor intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Filter predictions based on search query
  const getFilteredPredictions = useCallback(
    (query: string): TaskWithExtras[] => {
      if (!query.trim()) return predictions;

      const lowerQuery = query.toLowerCase();
      return predictions.filter((prediction) => {
        const idMatch = prediction.id?.toLowerCase().includes(lowerQuery);
        const patientMatch = prediction.patient_name
          ?.toLowerCase()
          .includes(lowerQuery);

        let specificMatch = false;
        if ("disease_name" in prediction) {
          specificMatch = prediction.disease_name
            .toLowerCase()
            .includes(lowerQuery);
        } else if ("lesion_name" in prediction) {
          specificMatch = prediction.lesion_name
            .toLowerCase()
            .includes(lowerQuery);
        }

        return idMatch || patientMatch || specificMatch;
      });
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
        predictionClasses,
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
