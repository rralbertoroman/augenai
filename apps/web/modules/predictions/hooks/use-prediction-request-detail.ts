import { useState, useEffect } from "react";
import { getPredictionRequestById } from "@/server/services/prediction_request";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";

export function usePredictionRequestDetail(requestId: string) {
  const { accessToken } = useAuth();
  const [request, setRequest] = useState<PredictionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId && accessToken) {
      fetchRequest(requestId, accessToken);
    }
  }, [requestId, accessToken]);

  const fetchRequest = async (id: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Load request with feedbacks included
      const result = await getPredictionRequestById(token, id, true);

      if (!result) {
        throw new Error("No se encontró la solicitud de predicción");
      }

      setRequest(result);
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error(String(err)),
      );
      setError(errorMessage);
      setRequest(null);
      console.error("Failed to fetch prediction request detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addFeedbacksToClassification = (
    classificationId: string,
    newFeedback: ClassificationFeedbackWithExtras,
  ) => {
    if (!request) return;

    setRequest((prevRequest) => {
      if (!prevRequest) return prevRequest;

      const updatedPredictions = prevRequest.predictionsWithExtras?.map(
        (pred) => ({
          ...pred,
          classifications: pred.classifications.map((classification) => {
            if (classification.id === classificationId) {
              return {
                ...classification,
                feedbacks: [...(classification.feedbacks || []), newFeedback],
              };
            }
            return classification;
          }),
        }),
      );

      return {
        ...prevRequest,
        predictionsWithExtras: updatedPredictions,
      };
    });
  };

  const updateFeedbacksForClassification = (
    classificationId: string,
    updatedFeedbacks: ClassificationFeedbackWithExtras[],
  ) => {
    if (!request) return;

    setRequest((prevRequest) => {
      if (!prevRequest) return prevRequest;

      const updatedPredictions = prevRequest.predictionsWithExtras?.map(
        (pred) => ({
          ...pred,
          classifications: pred.classifications.map((classification) => {
            if (classification.id === classificationId) {
              return {
                ...classification,
                feedbacks: updatedFeedbacks,
              };
            }
            return classification;
          }),
        }),
      );

      return {
        ...prevRequest,
        predictionsWithExtras: updatedPredictions,
      };
    });
  };

  const addFeedbacksToDetection = (
    detectionId: string,
    newFeedback: DetectionFeedbackWithExtras,
  ) => {
    if (!request) return;

    setRequest((prevRequest) => {
      if (!prevRequest) return prevRequest;

      const updatedPredictions = prevRequest.predictionsWithExtras?.map(
        (pred) => ({
          ...pred,
          detections: pred.detections.map((detection) => {
            if (detection.id === detectionId) {
              return {
                ...detection,
                feedbacks: [...(detection.feedbacks || []), newFeedback],
              };
            }
            return detection;
          }),
        }),
      );

      return {
        ...prevRequest,
        predictionsWithExtras: updatedPredictions,
      };
    });
  };

  const addFeedbacksToMultipleDetections = (
    feedbacksByDetection: Map<string, DetectionFeedbackWithExtras>,
  ) => {
    if (!request) return;

    setRequest((prevRequest) => {
      if (!prevRequest) return prevRequest;

      const updatedPredictions = prevRequest.predictionsWithExtras?.map(
        (pred) => ({
          ...pred,
          detections: pred.detections.map((detection) => {
            const newFeedback = feedbacksByDetection.get(detection.id!);
            if (newFeedback) {
              return {
                ...detection,
                feedbacks: [...(detection.feedbacks || []), newFeedback],
              };
            }
            return detection;
          }),
        }),
      );

      return {
        ...prevRequest,
        predictionsWithExtras: updatedPredictions,
      };
    });
  };

  return {
    request,
    isLoading,
    error,
    refreshRequest: () =>
      requestId && accessToken && fetchRequest(requestId, accessToken),
    addFeedbacksToClassification,
    updateFeedbacksForClassification,
    addFeedbacksToDetection,
    addFeedbacksToMultipleDetections,
  };
}
