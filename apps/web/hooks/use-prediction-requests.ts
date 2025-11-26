"use client";

import { useState, useEffect } from "react";
import { getAllPredictionRequestsWithPredictionsByUserId } from "@/server/services/prediction_request";
import { getAllDiseases } from "@/server/services/disease";
import { useAuth } from "@/contexts/auth-context";
import { translateErrorMessage } from "@/lib/error-translator";
import { EnrichedPredictionDTO } from "@/server/zod-schemas";

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
      // Fetch both enriched predictions and diseases in parallel
      const [enrichedPredictions, diseasesData] = await Promise.all([
        getAllPredictionRequestsWithPredictionsByUserId(token, userId),
        getAllDiseases(token),
      ]);

      // Create a map of disease ID to disease name
      const diseaseMap = new Map(
        diseasesData.map((disease) => [disease.id, disease.name]),
      );

      const requestsMap = new Map();

      for (const enrichedDiagnosis of enrichedPredictions) {
        const requestId = enrichedDiagnosis.request_id;
        if (!requestsMap.has(requestId)) {
          requestsMap.set(requestId, {
            id: requestId,
            diagnoses: [],
            patient_id: enrichedDiagnosis.patient_id,
            createdAt: enrichedDiagnosis.createdAt,
            diseases: new Set<string>(),
          });
        }
        const request = requestsMap.get(requestId);
        request.diseases.add(enrichedDiagnosis.disease_id);
        request.diagnoses.push({
          id: enrichedDiagnosis.id,
          classId: enrichedDiagnosis.class_id,
          confidence: enrichedDiagnosis.confidence,
          disease_id: enrichedDiagnosis.disease_id,
          disease_name: enrichedDiagnosis.disease_name,
          stage_idx: enrichedDiagnosis.stage_idx,
          stage_content: enrichedDiagnosis.stage_content,
          type: enrichedDiagnosis.type,
          bbox: enrichedDiagnosis.bbox,
        });
      }

      const enrichedRequests: EnrichedPredictionRequest[] = Array.from(
        requestsMap.values(),
      ).map((group) => {
        const diseaseIds = Array.from(group.diseases) as string[];
        const diseaseNames = diseaseIds
          .map((diseaseId: string) => diseaseMap.get(diseaseId) || diseaseId)
          .filter(Boolean) as string[];

        return {
          id: group.id,
          createdAt: group.createdAt,
          patient: {
            name: "Patient",
            email: "",
          },
          task: "classification",
          imageType: "fundus",
          diseases: diseaseIds,
          diseaseNames,
          totalPredictions: group.diagnoses.length,
          predictions: group.diagnoses,
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
