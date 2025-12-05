import { useState, useEffect } from "react";
import {
  createClassificationFeedback,
  getClassificationFeedbackWithExtras,
  hasUserProvidedClassificationFeedback,
} from "@/server/services/classification_feedback";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import { getAllDiseases } from "@/server/services/disease";
import { getClassIdByStageDiseaseAndModel } from "@/server/services/prediction_class_disease";
import { useAuth } from "@/contexts/auth-context";
import type {
  ClassificationWithExtras,
  TaskWithExtras,
} from "@/server/zod-schemas/prediction_workflow";

interface FeedbackFormData {
  diagnosisId: string;
  stageIdx: number;
  diseaseId?: string;
}

export function useClassificationFeedback(
  onFeedbackCreated?: (
    classificationId: string,
    feedback: ClassificationFeedbackWithExtras,
  ) => void,
) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [predictions, setPredictions] = useState<ClassificationWithExtras[]>(
    [],
  );
  const [transformedPredictions, setTransformedPredictions] = useState<
    Array<{
      id: string;
      disease_id: string;
      disease_name: string;
      confidence: number;
      stage_idx?: number;
    }>
  >([]);
  const [feedbackForms, setFeedbackForms] = useState<
    Record<string, FeedbackFormData>
  >({});
  const [diseases, setDiseases] = useState<
    Array<{ id: string; name: string; stages: string[] }>
  >([]);

  useEffect(() => {
    if (accessToken) {
      getAllDiseases(accessToken).then(setDiseases);
    }
  }, [accessToken]);

  const checkUserFeedback = async (
    classificationIds: string[],
  ): Promise<boolean> => {
    if (!accessToken || classificationIds.length === 0) {
      return false;
    }

    setCheckingFeedback(true);
    try {
      const hasFeedback = await hasUserProvidedClassificationFeedback(
        accessToken,
        classificationIds,
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

  const handleOpenFeedback = (allPredictions: TaskWithExtras[]) => {
    // Filter only classifications for this feedback workflow
    const classifications = allPredictions.filter(
      (p): p is ClassificationWithExtras => "disease_id" in p && !!p.id,
    );

    // Transform to the format expected by BatchFeedbackModal
    const transformed = classifications.map((pred) => ({
      id: pred.id!,
      disease_id: pred.disease_id,
      disease_name: pred.disease_name,
      confidence: pred.confidence,
      stage_idx: pred.stage_idx,
    }));

    setPredictions(classifications);
    setTransformedPredictions(transformed);

    const initialForms: Record<string, FeedbackFormData> = {};
    classifications.forEach((pred) => {
      if (pred.id) {
        initialForms[pred.id] = {
          diagnosisId: pred.id,
          stageIdx: pred.stage_idx ?? 0,
          diseaseId: pred.disease_id, // Store the current disease_id
        };
      }
    });
    setFeedbackForms(initialForms);
    setOpenFeedbackModal(true);
  };

  const updateFeedbackForm = (
    diagnosisId: string,
    field: keyof FeedbackFormData,
    value: number | string,
  ) => {
    setFeedbackForms((prev) => ({
      ...prev,
      [diagnosisId]: {
        ...prev[diagnosisId],
        [field]: value,
      },
    }));
  };

  const handleCloseFeedback = () => {
    setOpenFeedbackModal(false);
    setPredictions([]);
    setTransformedPredictions([]);
    setFeedbackForms({});
  };

  const handleSubmitFeedback = async () => {
    if (predictions.length === 0 || !accessToken) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      console.log(
        "[Feedback] Processing feedbacks for predictions:",
        predictions.length,
      );

      for (const prediction of predictions) {
        const predictionId = prediction.id!;
        const formData = feedbackForms[predictionId];
        if (!formData) continue;

        console.log("[Feedback] Processing prediction:", predictionId);
        console.log("[Feedback] Form data:", formData);

        const modelId = prediction.model_id;
        // Use diseaseId from form if it was changed (for Unknown disease), otherwise use prediction's disease_id
        const diseaseId = formData.diseaseId || prediction.disease_id;

        if (!modelId) {
          throw new Error(
            `No se encontró modelId para ${prediction.disease_name}`,
          );
        }

        const classId = await getClassIdByStageDiseaseAndModel({
          diseaseId,
          stageIdx: formData.stageIdx,
          modelId,
        });

        if (classId === null || classId === undefined) {
          throw new Error(
            `No se encontró classId válido para ${prediction.disease_name}`,
          );
        }

        const feedbackData = {
          classificationId: prediction.id!,
          classId,
          confidence: 1,
        };
        console.log("[Feedback] Enviando feedback:", feedbackData);

        const createdFeedback = await createClassificationFeedback(
          accessToken,
          feedbackData,
        );

        // Obtener todos los feedbacks con extras y encontrar el recién creado
        if (onFeedbackCreated && createdFeedback) {
          const allFeedbacks = await getClassificationFeedbackWithExtras(
            accessToken,
            { classificationId: prediction.id! },
          );

          // Buscar el feedback recién creado por ID
          const newFeedback = allFeedbacks.find(
            (f) => f.id === createdFeedback.id,
          );

          if (newFeedback) {
            onFeedbackCreated(prediction.id!, newFeedback);
          }
        }
      }

      console.log("[Feedback] Todos los feedbacks enviados exitosamente");
      setSuccess(true);
      setHasExistingFeedback(true);
      handleCloseFeedback();
    } catch (err) {
      setError(
        `Error al enviar retroalimentación: ${err instanceof Error ? err.message : "Error desconocido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkingFeedback,
    hasExistingFeedback,
    error,
    success,
    openFeedbackModal,
    setOpenFeedbackModal,
    predictions: transformedPredictions,
    feedbackForms,
    diseases,
    updateFeedbackForm,
    handleOpenFeedback,
    handleCloseFeedback,
    handleSubmitFeedback,
    checkUserFeedback,
  };
}
