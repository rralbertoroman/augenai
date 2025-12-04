import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  createDetectionFeedback,
  hasUserProvidedDetectionFeedback,
  updateIsMainData,
  getDetectionFeedbackWithExtras,
} from "@/server/services/detection_feedback";
import type { DetectionForEditing } from "@/components/detection/detection-bbox-editor";
import type { DetectionWithExtras } from "@/server/zod-schemas/prediction_workflow";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";

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
  viewModalInfo: {
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
  };
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

export const useDetectionFeedback = (
  onFeedbackCreated?: (
    detectionId: string,
    feedback: DetectionFeedbackWithExtras,
  ) => void,
): UseDetectionFeedbackReturn => {
  const { accessToken, user } = useAuth();

  // Editor modal state
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [detections, setDetections] = useState<DetectionForEditing[]>([]);
  const [bucketName, setBucketName] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);

  // View feedbacks modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalFeedbacks, setViewModalFeedbacks] = useState<
    DetectionFeedbackWithExtras[]
  >([]);
  const [localFeedbacks, setLocalFeedbacks] = useState<
    DetectionFeedbackWithExtras[]
  >([]);
  const [viewModalInfo, setViewModalInfo] = useState<{
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
  }>({});
  const [requestUserId, setRequestUserId] = useState<string | undefined>();
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(
    null,
  );

  const isRequestOwner = user?.id === requestUserId;

  useEffect(() => {
    setLocalFeedbacks(viewModalFeedbacks);
  }, [viewModalFeedbacks]);

  const checkUserFeedback = async (
    detectionIds: string[],
  ): Promise<boolean> => {
    if (!accessToken || detectionIds.length === 0) {
      return false;
    }

    setCheckingFeedback(true);
    try {
      const hasFeedback = await hasUserProvidedDetectionFeedback(
        accessToken,
        detectionIds,
      );
      setHasExistingFeedback(hasFeedback);
      return hasFeedback;
    } catch (err) {
      console.error("Error checking user feedback:", err);
      return false;
    } finally {
      setCheckingFeedback(false);
    }
  };

  const handleOpenFeedback = (
    detections: DetectionWithExtras[],
    bucketName: string,
    storagePath: string,
  ) => {
    const detectionsForEditing: DetectionForEditing[] = detections.map(
      (det) => ({
        id: det.id!,
        classId: det.class_id,
        confidence: det.confidence,
        lesion_name: det.lesion_name,
        original: {
          xLeft: det.bbox.x_left,
          yTop: det.bbox.y_top,
          width: det.bbox.width,
          height: det.bbox.height,
        },
        current: {
          xLeft: det.bbox.x_left,
          yTop: det.bbox.y_top,
          width: det.bbox.width,
          height: det.bbox.height,
        },
        status: "active",
      }),
    );

    setDetections(detectionsForEditing);
    setBucketName(bucketName);
    setStoragePath(storagePath);
    setOpenFeedbackModal(true);
  };

  const handleSubmitFeedback = async (
    updatedDetections: DetectionForEditing[],
  ) => {
    if (!accessToken) {
      setError("No hay sesión activa");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const modifiedDetections = updatedDetections.filter((det) => {
        const wasModified =
          det.current.xLeft !== det.original.xLeft ||
          det.current.yTop !== det.original.yTop ||
          det.current.width !== det.original.width ||
          det.current.height !== det.original.height ||
          det.status === "deleted";
        return wasModified;
      });

      // Create feedbacks and get the created feedback DTOs
      const createdFeedbacks = await Promise.all(
        modifiedDetections.map(async (det) => {
          const isDeleted = det.status === "deleted";
          const created = await createDetectionFeedback(accessToken, {
            detectionId: det.id,
            classId: det.classId,
            confidence: isDeleted ? 0 : det.confidence,
            xLeft: isDeleted ? 0 : det.current.xLeft,
            yTop: isDeleted ? 0 : det.current.yTop,
            width: isDeleted ? 0 : det.current.width,
            height: isDeleted ? 0 : det.current.height,
          });
          return { detectionId: det.id, feedbackId: created.id };
        }),
      );

      // If callback provided, fetch feedbacks with extras and notify
      if (onFeedbackCreated) {
        for (const { detectionId, feedbackId } of createdFeedbacks) {
          const feedbacksWithExtras = await getDetectionFeedbackWithExtras(
            accessToken,
            { detectionId },
          );
          const newFeedback = feedbacksWithExtras.find(
            (f) => f.id === feedbackId,
          );
          if (newFeedback) {
            onFeedbackCreated(detectionId, newFeedback);
          }
        }
      }

      setHasExistingFeedback(true);
      setOpenFeedbackModal(false);
    } catch (err) {
      console.error("Error creating detection feedback:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear el feedback de detección",
      );
    } finally {
      setLoading(false);
    }
  };

  // View feedbacks modal functions
  const openViewFeedbacksModal = (
    feedbacks: DetectionFeedbackWithExtras[],
    reqUserId?: string,
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
  ) => {
    setViewModalOpen(true);
    setViewModalFeedbacks(feedbacks);
    setLocalFeedbacks(feedbacks);
    setRequestUserId(reqUserId);
    setViewModalInfo({
      lesionName,
      originalBbox,
      detectionId,
      bucketName,
      storagePath,
    });
  };

  const closeViewFeedbacksModal = () => {
    setViewModalOpen(false);
    setViewModalFeedbacks([]);
    setLocalFeedbacks([]);
    setRequestUserId(undefined);
    setViewModalInfo({});
  };

  const handleSetMainFeedback = async (feedbackId: string) => {
    if (!viewModalInfo.detectionId || !accessToken) {
      return;
    }

    setUpdatingFeedbackId(feedbackId);
    try {
      await updateIsMainData(accessToken, { id: feedbackId, isMainData: true });
      setLocalFeedbacks((prev) =>
        prev.map((fb) => ({ ...fb, isMainData: fb.id === feedbackId })),
      );
    } catch (error) {
      console.error("Error setting main feedback:", error);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  return {
    openFeedbackModal,
    setOpenFeedbackModal,
    detections,
    bucketName,
    storagePath,
    loading,
    checkingFeedback,
    error,
    hasExistingFeedback,
    handleOpenFeedback,
    handleSubmitFeedback,
    checkUserFeedback,
    viewModalOpen,
    viewModalFeedbacks: localFeedbacks,
    viewModalInfo,
    isRequestOwner,
    updatingFeedbackId,
    openViewFeedbacksModal,
    closeViewFeedbacksModal,
    handleSetMainFeedback,
  };
};
