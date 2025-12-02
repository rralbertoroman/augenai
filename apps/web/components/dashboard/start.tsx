"use client";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { getPatientsByUserId } from "@/server/services/patient";
import { Loader2, Grid, List } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { GridCard } from "./start-pane/grid-card";
import { ListRow } from "./start-pane/list-row";
import type { PredictionGroup, PatientInfo } from "./start-pane/types";

// Formatting functions using native Date methods
function formatDate(date: Date) {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Color logic will be added later

function getFeedbackVariant(status: string) {
  switch (status) {
    case "reviewed":
      return {
        variant: "default" as const,
        text: "Revisado",
        icon: "check-circle",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        text: "Pendiente",
        icon: "clock",
      };
    default:
      return {
        variant: "outline" as const,
        text: "No enviado",
        icon: "alert-circle",
      };
  }
}

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function Start() {
  const { predictions, isLoading, error } = useDashboard();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [patients, setPatients] = useState<Record<string, PatientInfo>>({});
  const { user, accessToken } = useAuth();

  // Fetch patient information
  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (!accessToken) return;

      try {
        const userPatients = await getPatientsByUserId(accessToken);
        const patientMap = userPatients.reduce(
          (acc, patient) => ({
            ...acc,
            [patient.id]: patient,
          }),
          {},
        );

        console.log(`Fetched patients: ${Object.keys(patientMap).length}`);
        setPatients(patientMap);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    if (predictions.length > 0) {
      fetchPatientInfo();
    }
  }, [predictions, accessToken]);

  // Filter and process today's predictions with patient info
  const todayPredictions = predictions
    .filter((prediction) => {
      const predDate = new Date(prediction.created_at);

      if (!user) return false;

      // Use a fallback user ID if user_id is missing (though it should be there)
      const userId = "user_id" in prediction ? prediction.user_id : user.id;
      return isToday(predDate) && userId === user.id;
    })
    .map((prediction) => {
      const patient = patients[prediction.patient_id || ""];
      const patientName = patient?.name || `Paciente`;
      const patientAge = patient?.age || 0;

      const disease_name =
        "disease_name" in prediction
          ? prediction.disease_name
          : "Enfermedad no especificada";
      const stage_content =
        "stage_content" in prediction
          ? prediction.stage_content
          : "No especificada";

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
    // Ensure request_id and patient_id are strings to be used as keys
    const reqId = prediction.request_id || "unknown-req";
    const patId = prediction.patient_id || "unknown-pat";
    const groupKey = `${reqId}-${patId}`;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(prediction);
    return groups;
  }, {});

  // Convert to array and sort by date (newest first)
  const predictionGroups = Object.entries(groupedPredictions)
    .map(([_, preds]) => {
      // Process predictions to ensure all required fields are present
      const processedPreds = preds.map((pred) => {
        // Create a new object with all required fields
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
          feedbacks: pred.feedbacks || [],
          class_id: pred.class_id,
          model_id: pred.model_id,
          bbox: {
            ...("bbox" in pred ? pred.bbox : {}),
            label: "lesion_name" in pred ? pred.lesion_name : undefined,
          },
          type: pred.type,
          // Handle isMainData safely
          isMainData: "isMainData" in pred ? Boolean(pred.isMainData) : false,
        };
        return processedPred;
      });

      const firstPred = processedPreds[0];
      return {
        requestId: firstPred.request_id,
        patientId: firstPred.patient_id,
        patientName: firstPred.patient_name,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (todayPredictions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No hay predicciones para hoy</h3>
        <p className="text-muted-foreground mt-2">
          Realiza una nueva predicción para ver los resultados aquí.
        </p>
      </div>
    );
  }

  // Render a request group (single item per request+patient)
  const renderRequestGroup = (group: PredictionGroup) => {
    return (
      <Link
        key={`${group.requestId}-${group.patientId}`}
        href={`/diagnosis/${group.requestId}`}
        className="block hover:opacity-90 transition-opacity"
      >
        {viewMode === "grid" ? (
          <GridCard group={group} />
        ) : (
          <ListRow group={group} />
        )}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Predicciones de hoy</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {predictionGroups.length}{" "}
            {predictionGroups.length === 1 ? "predicción" : "predicciones"}
          </span>
          <div className="flex space-x-1 border rounded-lg p-1 bg-muted">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {predictionGroups.map(renderRequestGroup)}
      </div>
    </div>
  );
}
