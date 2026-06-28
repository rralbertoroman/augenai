import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";
import type { DetectionWithExtras } from "@/server/zod-schemas/prediction_workflow";
import type { usePagination } from "@/hooks/use-pagination";
import type { DetectionForEditing } from "../components/detection-bbox-editor";

// Re-export component types for convenience
export type { DetectionForEditing };

// Re-export segmentation types for convenience
export type {
  Segmentation,
  SegmentationWithExtras,
} from "@/server/zod-schemas/prediction_workflow";

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PredictionRequestsContextType {
  // Data
  requests: PredictionRequest[];
  allRequests: PredictionRequest[];
  requestsMap: Map<string, PredictionRequest>;

  // Selection
  selectedRequest: PredictionRequest | null;
  setSelectedRequest: (request: PredictionRequest | null) => void;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshRequests: () => Promise<void>;
  getRequestById: (id: string) => PredictionRequest | undefined;
  getDiagnosesForRequest: (
    requestId: string,
  ) => PredictionRequest["predictions"] | undefined;

  // Pagination
  pagination: ReturnType<typeof usePagination>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackFormData {
  diagnosisId: string;
  stageIdx: number;
  diseaseId?: string;
}

export interface UsePredictionFeedbacksReturn {
  isOpen: boolean;
  feedbacks: ClassificationFeedbackWithExtras[];
  localFeedbacks: ClassificationFeedbackWithExtras[];
  updatingFeedbackId: string | null;
  isRequestOwner: boolean;
  openFeedbacksModal: (
    feedbacks: ClassificationFeedbackWithExtras[],
    requestUserId?: string,
    classificationId?: string,
  ) => void;
  closeFeedbacksModal: (
    onUpdate?: (feedbacks: ClassificationFeedbackWithExtras[]) => void,
  ) => void;
  handleSetMainFeedback: (feedbackId: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Detection Feedback Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DetectionViewModalInfo {
  lesionName?: string;
  originalBbox?: {
    xLeft: number;
    yTop: number;
    width: number;
    height: number;
  };
  detectionId?: string;
  bucketName?: string;
  storagePath?: string;
}

export interface UseDetectionFeedbackReturn {
  // Editor modal state
  openFeedbackModal: boolean;
  setOpenFeedbackModal: (open: boolean) => void;
  detections: DetectionForEditing[];
  bucketName: string;
  storagePath: string;
  loading: boolean;
  checkingFeedback: boolean;
  error: string | null;
  hasExistingFeedback: boolean;
  handleOpenFeedback: (
    detections: DetectionWithExtras[],
    bucketName: string,
    storagePath: string,
  ) => void;
  handleSubmitFeedback: (
    updatedDetections: DetectionForEditing[],
  ) => Promise<void>;
  checkUserFeedback: (detectionIds: string[]) => Promise<boolean>;

  // View feedbacks modal state
  viewModalOpen: boolean;
  viewModalFeedbacks: DetectionFeedbackWithExtras[];
  viewModalInfo: DetectionViewModalInfo;
  isRequestOwner: boolean;
  updatingFeedbackId: string | null;
  openViewFeedbacksModal: (
    feedbacks: DetectionFeedbackWithExtras[],
    requestUserId?: string,
    detectionId?: string,
    lesionName?: string,
    originalBbox?: {
      xLeft: number;
      yTop: number;
      width: number;
      height: number;
    },
    bucketName?: string,
    storagePath?: string,
  ) => void;
  closeViewFeedbacksModal: () => void;
  handleSetMainFeedback: (feedbackId: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_PAGE_SIZE = 10;
