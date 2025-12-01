import { useState, useEffect } from "react";
import { createClassificationFeedback } from "@/server/services/classification_feedback";
import { getAllDiseases } from "@/server/services/disease";
import { getClassIdByStageDiseaseAndModel } from "@/server/services/prediction_class_disease";
import { useAuth } from "@/contexts/auth-context";
import type { EnrichedClassificationWithExtras } from "@/server/zod-schemas";

interface FeedbackFormData {
  diagnosisId: string;
  stageIdx: number;
}

export function useClassificationFeedback() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [predictions, setPredictions] = useState<
    Array<{
      id: string;
      disease_id: string;
      disease_name: string;
      confidence: number;
      stage_idx?: number;
      model_id?: string;
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

  const handleOpenFeedback = (
    allPredictions: EnrichedClassificationWithExtras[],
  ) => {
    setPredictions(
      allPredictions.map((pred) => ({
        id: pred.id || pred.prediction_id || "",
        disease_id: pred.disease_id ?? "",
        disease_name: pred.disease_name ?? "",
        confidence: pred.confidence,
        stage_idx: pred.stage_idx,
        model_id: pred.model_id,
      })),
    );
    const initialForms: Record<string, FeedbackFormData> = {};
    allPredictions.forEach((pred) => {
      const id = pred.id || pred.prediction_id || "";
      initialForms[id] = {
        diagnosisId: id,
        stageIdx: pred.stage_idx ?? 0,
      };
    });
    setFeedbackForms(initialForms);
    setOpenFeedbackModal(true);
  };

  const updateFeedbackForm = (
    diagnosisId: string,
    field: keyof FeedbackFormData,
    value: number,
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
        const formData = feedbackForms[prediction.id];
        if (!formData) continue;

        console.log("[Feedback] Processing prediction:", prediction.id);
        console.log("[Feedback] Form data:", formData);

        const modelId = prediction.model_id;
        const diseaseId = prediction.disease_id;

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
          classificationId: prediction.id,
          classId,
          confidence: 1,
        };
        console.log("[Feedback] Enviando feedback:", feedbackData);

        await createClassificationFeedback(accessToken, feedbackData);
      }

      console.log("[Feedback] Todos los feedbacks enviados exitosamente");
      setSuccess(true);
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
    error,
    success,
    openFeedbackModal,
    setOpenFeedbackModal,
    predictions,
    feedbackForms,
    diseases,
    updateFeedbackForm,
    handleOpenFeedback,
    handleCloseFeedback,
    handleSubmitFeedback,
  };
}
