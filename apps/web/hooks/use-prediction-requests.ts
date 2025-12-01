"use client";

import { useState, useEffect } from "react";
import { getAllPredictionRequestsWithPredictionsByUserId } from "@/server/services/prediction_request";
import { getAllDiseases } from "@/server/services/disease";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import type { EnrichedPredictionDTO } from "@/server/zod-schemas";

export interface EnrichedPredictionRequest {
  id: string;
  createdAt: Date;
  patient: {
    name: string;
    email?: string;
  };
  task: string;
  imageType: string;
  diseases: string[];
  diseaseNames: string[];
  totalPredictions: number;
  predictions: EnrichedPredictionDTO[];
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function usePredictionRequests() {
  const { user, accessToken } = useAuth();
  const [requests, setRequests] = useState<EnrichedPredictionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && accessToken) {
      fetchRequests(user.id, accessToken);
    }
  }, [user?.id, accessToken]);

  const fetchRequests = async (userId: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [predictionRequests, diseasesData] = await Promise.all([
        getAllPredictionRequestsWithPredictionsByUserId(token, userId),
        getAllDiseases(token),
      ]);

      const diseaseMap = new Map(
        diseasesData.map((disease) => [disease.id, disease.name]),
      );

      const enrichedRequests: EnrichedPredictionRequest[] =
        predictionRequests.map((req) => {
          // Collect unique disease IDs from all classifications
          const diseaseIds = new Set<string>();
          req.predictions.forEach((pred) => {
            pred.classifications.forEach((c) => diseaseIds.add(c.disease_id));
          });

          const diseaseIdsArray = Array.from(diseaseIds);
          const diseaseNames = diseaseIdsArray
            .map((id) => diseaseMap.get(id) || id)
            .filter(Boolean);

          // Count total classifications + detections
          const totalPredictions = req.predictions.reduce(
            (sum, pred) =>
              sum + pred.classifications.length + pred.detections.length,
            0,
          );

          return {
            id: req.id,
            createdAt: req.created_at,
            patient: {
              name: req.patient_name || "Patient",
            },
            task: req.task,
            imageType: req.image_type,
            diseases: diseaseIdsArray,
            diseaseNames,
            totalPredictions,
            predictions: req.predictions,
          };
        });

      setRequests(enrichedRequests);
    } catch (err) {
      const errorMessage = translateErrorMessage(
        err instanceof Error ? err : new Error(String(err)),
      );
      setError(errorMessage);
      console.error("Failed to fetch prediction requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiagnosesForRequest = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    return request ? request.predictions : [];
  };

  const getRequestInfo = (requestId: string) => {
    return requests.find((r) => r.id === requestId);
  };

  return {
    requests,
    isLoading,
    error,
    getDiagnosesForRequest,
    getRequestInfo,
    refreshRequests: () =>
      user?.id && accessToken && fetchRequests(user.id, accessToken),
  };
}
