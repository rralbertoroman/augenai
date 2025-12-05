import type { TaskWithExtras } from "@/server/zod-schemas/prediction_workflow";
import type { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";

// ─────────────────────────────────────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterCriteria {
  query: string;
  dateRange?: { from: Date; to: Date };
  confidenceThreshold?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPredictions: number;
  todayPredictions: number;
  averageConfidence: number;
  highConfidenceCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardContextType {
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
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIDENCE_THRESHOLD_HIGH = 0.8;
export const SYSTEM_PREDICTIONS_DAYS = 30;

export const initialFilters: FilterCriteria = {
  query: "",
  confidenceThreshold: undefined,
  dateRange: undefined,
};
