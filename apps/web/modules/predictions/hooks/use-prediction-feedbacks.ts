"use client";

import { useState, useEffect } from "react";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import { setMainFeedbackForClassification } from "@/server/services/classification_feedback";
import { useAuth } from "@/contexts/auth-context";
import type { UsePredictionFeedbacksReturn } from "../types";

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

  // Check if the current user is the request creator
  const isRequestOwner = user?.id === requestUserId;

  // Update local feedbacks when originals change
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

  const closeFeedbacksModal = (
    onUpdate?: (feedbacks: ClassificationFeedbackWithExtras[]) => void,
  ) => {
    // If there were changes, pass the updated feedbacks
    if (hasChanges && onUpdate) {
      onUpdate(localFeedbacks);
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
      throw new Error("No classificationId available");
    }

    if (!accessToken) {
      throw new Error("No accessToken available");
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

      // Update local state immediately
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
