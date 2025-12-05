"use client";

import { useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { usePatientsMap } from "./use-patients-map";
import { isToday, calculateAge } from "@/lib/date-utils";
import type { PredictionGroup } from "@/components/dashboard/start-pane/types";

/**
 * Returns today's predictions grouped by request and enriched with patient data
 */
export function useTodayPredictions() {
  const { predictions } = useDashboard();
  const patientsMap = usePatientsMap();

  const predictionGroups = useMemo(() => {
    // Backend already filters for today's predictions (last 1 day)
    const todayPredictions = predictions.map((prediction) => {
      const patientId = prediction.patient_id as string;
      const patient = patientsMap[patientId];
      const patientName = patient?.name;
      const patientAge = patient ? calculateAge(patient.dateOfBirth) : null;

      const disease_name =
        "disease_name" in prediction ? prediction.disease_name : undefined;
      const stage_content =
        "stage_content" in prediction ? prediction.stage_content : undefined;

      const type =
        "disease_name" in prediction ? "classification" : "detection";

      const mainFeedback = prediction.feedbacks?.find((f) => f.isMainData);

      return {
        ...prediction,
        disease_name,
        stage_content,
        bucket_name: prediction.bucket_name,
        storage_path: prediction.storage_path,
        patient_name: patientName,
        patient_age: patientAge,
        type,
        feedback_status: mainFeedback ? "reviewed" : "pending",
        confidence: mainFeedback
          ? mainFeedback.confidence
          : prediction.confidence,
        class_id: mainFeedback ? mainFeedback.classId : prediction.class_id,
      };
    });

    // Group predictions by request and patient
    const groupedPredictions = todayPredictions.reduce<
      Record<string, typeof todayPredictions>
    >((groups, prediction) => {
      const reqId = prediction.request_id;
      const patId = prediction.patient_id;
      const groupKey = `${reqId}-${patId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(prediction);
      return groups;
    }, {});

    // Convert to array and sort by date (newest first)
    return Object.entries(groupedPredictions)
      .map(([, preds]) => {
        // Process predictions to ensure all required fields are present
        const processedPreds = preds.map((pred) => {
          const processedPred = {
            id: pred.id,
            request_id: pred.request_id,
            patient_id: pred.patient_id,
            patient_name: pred.patient_name,
            disease_name: pred.disease_name,
            stage_content: pred.stage_content,
            confidence: pred.confidence,
            patient_birthdate: pred.patient_birth_date!,
            createdAt:
              typeof pred.created_at === "string"
                ? new Date(pred.created_at)
                : pred.created_at,
            bucket_name: pred.bucket_name,
            storage_path: pred.storage_path,
            patient_age: pred.patient_age,
            feedback_status: pred.feedback_status,
            feedbacks: pred.feedbacks,
            class_id: pred.class_id,
            model_id: pred.model_id,
            bbox: {
              ...("bbox" in pred ? pred.bbox : {}),
              label: "lesion_name" in pred ? pred.lesion_name : undefined,
            },
            type: pred.type,
            isMainData: "isMainData" in pred ? Boolean(pred.isMainData) : false,
          };
          return processedPred;
        });

        const firstPred = processedPreds[0];
        return {
          requestId: firstPred.request_id,
          patientId: firstPred.patient_id,
          patientName: firstPred.patient_name || "Paciente desconocido",
          requestDate: new Date(
            Math.max(
              ...processedPreds.map((p) => new Date(p.createdAt).getTime()),
            ),
          ),
          predictions: processedPreds,
          bucket_name: firstPred.bucket_name,
          storage_path: firstPred.storage_path,
        } as PredictionGroup;
      })
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }, [predictions, patientsMap]);

  return predictionGroups;
}
