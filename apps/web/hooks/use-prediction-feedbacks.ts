"use client";

import { useState, useEffect } from "react";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import { setMainFeedbackForClassification } from "@/server/services/classification_feedback";
import { useAuth } from "@/contexts/auth-context";

interface UsePredictionFeedbacksReturn {
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
  closeFeedbacksModal: (onUpdate?: () => void) => void;
  handleSetMainFeedback: (feedbackId: string) => Promise<void>;
}

export function usePredictionFeedbacks(): UsePredictionFeedbacksReturn {
  const { user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<
    ClassificationFeedbackWithExtras[]
  >([]);
  const [localFeedbacks, setLocalFeedbacks] = useState<
    ClassificationFeedbackWithExtras[]
  >([]);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(
    null,
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [requestUserId, setRequestUserId] = useState<string | undefined>();
  const [classificationId, setClassificationId] = useState<
    string | undefined
  >();

  // Verificar si el usuario actual es el creador de la request
  const isRequestOwner = user?.id === requestUserId;

  // Actualizar feedbacks locales cuando cambien los originales
  useEffect(() => {
    setLocalFeedbacks(feedbacks);
  }, [feedbacks]);

  const openFeedbacksModal = (
    feedbacks: ClassificationFeedbackWithExtras[],
    reqUserId?: string,
    classId?: string,
  ) => {
    setIsOpen(true);
    setFeedbacks(feedbacks);
    setLocalFeedbacks(feedbacks);
    setRequestUserId(reqUserId);
    setClassificationId(classId);
    setHasChanges(false);
  };

  const closeFeedbacksModal = (onUpdate?: () => void) => {
    // Si hubo cambios, refrescar los datos
    if (hasChanges && onUpdate) {
      onUpdate();
    }
    setIsOpen(false);
    setFeedbacks([]);
    setLocalFeedbacks([]);
    setRequestUserId(undefined);
    setClassificationId(undefined);
    setHasChanges(false);
  };

  const handleSetMainFeedback = async (feedbackId: string) => {
    if (!classificationId) {
      console.error("❌ No classificationId available");
      return;
    }

    if (!accessToken) {
      console.error("❌ No accessToken available");
      return;
    }

    console.log("🔄 Setting main feedback:", {
      feedbackId,
      classificationId,
      accessToken: !!accessToken,
    });

    setUpdatingFeedbackId(feedbackId);
    try {
      await setMainFeedbackForClassification(
        accessToken,
        feedbackId,
        classificationId,
      );
      console.log("✅ Main feedback updated successfully");

      // Actualizar estado local inmediatamente
      setLocalFeedbacks((prev) =>
        prev.map((fb) => ({
          ...fb,
          isMainData: fb.id === feedbackId,
        })),
      );

      setHasChanges(true);
    } catch (error) {
      console.error("❌ Error setting main feedback:", error);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  return {
    isOpen,
    feedbacks,
    localFeedbacks,
    updatingFeedbackId,
    isRequestOwner,
    openFeedbacksModal,
    closeFeedbacksModal,
    handleSetMainFeedback,
  };
}
