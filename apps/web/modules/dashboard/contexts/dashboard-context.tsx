"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getAllPredictionsWithFeedbacksAndExtrasByUserId,
  getAllSystemPredictionsWithFeedbacksAndExtras,
} from "@/server/services/prediction";
import type { TaskWithExtras } from "@/server/zod-schemas/prediction_workflow";
import { flattenPredictions } from "@/lib/prediction-transformer";
import { getAllPredictionClasses } from "@/server/services/prediction_class_disease";
import type { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FilterCriteria = {
  query: string;
  dateRange?: { from: Date; to: Date };
  confidenceThreshold?: number;
};

type DashboardStats = {
  totalPredictions: number;
  todayPredictions: number;
  averageConfidence: number;
  highConfidenceCount: number;
};

interface DashboardContextType {
  // Data
  predictions: TaskWithExtras[];
  systemPredictions: TaskWithExtras[];
  predictionClasses: PredictionClassDiseaseWithDisease[];

  // Selection
  selectedPrediction: TaskWithExtras | null;
  setSelectedPrediction: (prediction: TaskWithExtras | null) => void;

  // Loading & Error states
  isLoading: boolean;
  error: string | null;

  // Filtering
  filters: FilterCriteria;
  setFilters: (filters: Partial<FilterCriteria>) => void;
  filteredPredictions: TaskWithExtras[];
  clearFilters: () => void;

  // Stats
  stats: DashboardStats;
  todayPredictions: TaskWithExtras[];

  // Actions
  refreshData: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD_HIGH = 0.8;
const SYSTEM_PREDICTIONS_DAYS = 30;

const initialFilters: FilterCriteria = {
  query: "",
  confidenceThreshold: undefined,
  dateRange: undefined,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getConfidence(prediction: TaskWithExtras): number {
  if ("confidence" in prediction && typeof prediction.confidence === "number") {
    return prediction.confidence;
  }
  return 0;
}

function calculateStats(predictions: TaskWithExtras[]): DashboardStats {
  const today = predictions.filter((p) =>
    p.created_at ? isToday(new Date(p.created_at)) : false,
  );

  const confidences = predictions.map(getConfidence).filter((c) => c > 0);

  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

  const highConfidence = confidences.filter(
    (c) => c >= CONFIDENCE_THRESHOLD_HIGH,
  ).length;

  return {
    totalPredictions: predictions.length,
    todayPredictions: today.length,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    highConfidenceCount: highConfidence,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();

  // ─────────────────── Data State ───────────────────

  const [predictions, setPredictions] = useState<TaskWithExtras[]>([]);
  const [systemPredictions, setSystemPredictions] = useState<TaskWithExtras[]>(
    [],
  );
  const [predictionClasses, setPredictionClasses] = useState<
    PredictionClassDiseaseWithDisease[]
  >([]);
  const [hasFetched, setHasFetched] = useState(false);

  // ─────────────────── UI State ───────────────────

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] =
    useState<TaskWithExtras | null>(null);
  const [filters, setFiltersState] = useState<FilterCriteria>(initialFilters);

  // ─────────────────── Data Fetching ───────────────────

  const fetchPredictions = useCallback(
    async (force = false) => {
      if (!accessToken || !user?.id) return;
      if (hasFetched && !force) return; // Skip if already fetched

      setIsLoading(true);
      setError(null);

      try {
        const [userPredictionsData, systemPredictionsData, classesData] =
          await Promise.all([
            getAllPredictionsWithFeedbacksAndExtrasByUserId(
              accessToken,
              user.id,
              1, // Today's predictions
            ),
            getAllSystemPredictionsWithFeedbacksAndExtras(
              accessToken,
              SYSTEM_PREDICTIONS_DAYS,
            ),
            getAllPredictionClasses(accessToken),
          ]);

        const processedUserData = flattenPredictions(userPredictionsData);
        const processedSystemData = flattenPredictions(systemPredictionsData);

        setPredictions(processedUserData);
        setSystemPredictions(processedSystemData);
        setPredictionClasses(classesData);
        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(
          "Error al cargar datos del dashboard. Por favor intenta de nuevo.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, user, hasFetched],
  );

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // ─────────────────── Filtering ───────────────────

  const setFilters = useCallback((newFilters: Partial<FilterCriteria>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, []);

  const filteredPredictions = useMemo(() => {
    let result = [...predictions];

    // Text search
    if (filters.query.trim()) {
      const lowerQuery = filters.query.toLowerCase();
      result = result.filter((prediction) => {
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
    }

    // Confidence threshold
    if (filters.confidenceThreshold !== undefined) {
      result = result.filter(
        (p) => getConfidence(p) >= (filters.confidenceThreshold ?? 0),
      );
    }

    // Date range
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const { from, to } = filters.dateRange;
      result = result.filter((p) => {
        if (!p.created_at) return false;
        const date = new Date(p.created_at);
        return date >= from && date <= to;
      });
    }

    return result;
  }, [predictions, filters]);

  // ─────────────────── Derived Data ───────────────────

  const stats = useMemo(() => calculateStats(predictions), [predictions]);

  const todayPredictions = useMemo(
    () =>
      predictions.filter((p) =>
        p.created_at ? isToday(new Date(p.created_at)) : false,
      ),
    [predictions],
  );

  // ─────────────────── Actions ───────────────────

  const refreshData = useCallback(async () => {
    await fetchPredictions(true); // Force refresh
  }, [fetchPredictions]);

  // ─────────────────── Context Value ───────────────────

  const value: DashboardContextType = useMemo(
    () => ({
      // Data
      predictions,
      systemPredictions,
      predictionClasses,

      // Selection
      selectedPrediction,
      setSelectedPrediction,

      // Loading & Error
      isLoading,
      error,

      // Filtering
      filters,
      setFilters,
      filteredPredictions,
      clearFilters,

      // Stats
      stats,
      todayPredictions,

      // Actions
      refreshData,
    }),
    [
      predictions,
      systemPredictions,
      predictionClasses,
      selectedPrediction,
      isLoading,
      error,
      filters,
      setFilters,
      filteredPredictions,
      clearFilters,
      stats,
      todayPredictions,
      refreshData,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Compatibility - getFilteredPredictions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use useDashboard().filteredPredictions with filters.query instead
 */
export function useFilteredPredictions(query: string) {
  const { predictions } = useDashboard();

  return useMemo(() => {
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
  }, [predictions, query]);
}
