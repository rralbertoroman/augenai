"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";
import { useAuth } from "@/contexts/auth-context";
import { getPatientsByUserId } from "@/server/services/patient";
import { Loader2, Grid, List } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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

// Group predictions by request and patient
type Prediction = {
  id: string;
  request_id: string;
  patient_id: string;
  patient_name: string;
  disease_name: string;
  stage_content: string;
  confidence: number;
  createdAt: string | Date;
  storage_path?: string;
  image_url: string;
  patient_age: number;
  feedback_status: string;
  feedbacks?: Array<{ isMainData: boolean }>;
  isMainData: boolean;
  class_id: number;
  model_id: string;
};

type PredictionGroup = {
  requestId: string;
  patientId: string;
  requestDate: Date;
  patientName: string;
  predictions: Prediction[];
  thumbnailUrl: string;
};

type PatientInfo = {
  id: string;
  name: string;
  age: number;
  // Add other patient fields as needed
};

export default function Start() {
  const { predictions, isLoading, error } = useDashboard();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [patients, setPatients] = useState<Record<string, PatientInfo>>({});
  const { accessToken } = useAuth();

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

        console.log("Fetched patients:", patientMap);
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
      const predDate = new Date(prediction.createdAt);
      return isToday(predDate);
    })
    .map((prediction) => {
      const patient = patients[prediction.patient_id || ""];
      console.log(patients, patient);
      const patientName = patient?.name || `Paciente`;
      const patientAge = patient?.age || 0;

      return {
        ...prediction,
        disease_name: prediction.disease_name || "Enfermedad no especificada",
        stage_content: prediction.stage_content || "No especificada",
        image_url: prediction.storage_path
          ? `/api/storage/${prediction.storage_path}`
          : "/placeholder.svg",
        patient_name: patientName,
        patient_age: patientAge,
        feedback_status: prediction.feedbacks?.[0]?.isMainData
          ? "reviewed"
          : "pending",
      };
    });

  // Group predictions by request and patient
  const groupedPredictions = todayPredictions.reduce<
    Record<string, typeof todayPredictions>
  >((groups, prediction) => {
    const groupKey = `${prediction.request_id}-${prediction.patient_id}`;
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
          createdAt:
            typeof pred.createdAt === "string"
              ? new Date(pred.createdAt)
              : pred.createdAt,
          storage_path: pred.storage_path,
          image_url: pred.image_url,
          patient_age: pred.patient_age,
          feedback_status: pred.feedback_status,
          feedbacks: pred.feedbacks || [],
          class_id: pred.class_id,
          model_id: pred.model_id,
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
        thumbnailUrl: firstPred.image_url,
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

  // Render a prediction card for grid view (3x3 layout)
  const renderGridCard = (group: PredictionGroup) => {
    const mainPrediction = group.predictions[0];
    const feedbackVariant = getFeedbackVariant(mainPrediction.feedback_status);

    return (
      <div
        key={`${group.requestId}-${group.patientId}`}
        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow"
      >
        <div className="relative aspect-square bg-muted shrink-0">
          <img
            src={group.thumbnailUrl}
            alt={`Imagen de ${group.patientName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary">
              {Math.round(mainPrediction.confidence * 100)}%
            </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col grow">
          <div className="grow">
            <div className="flex justify-between items-start gap-2">
              <Badge variant={feedbackVariant.variant} className="shrink-0">
                {feedbackVariant.text}
              </Badge>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-medium text-foreground/90 truncate">
                {mainPrediction.disease_name} - {mainPrediction.stage_content}
              </h4>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {formatTime(group.requestDate)}
            </span>
            <span className="text-muted-foreground">
              {formatDate(group.requestDate)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render a list row for list view
  const renderListRow = (group: PredictionGroup) => {
    const mainPrediction = group.predictions[0];
    const feedbackVariant = getFeedbackVariant(mainPrediction.feedback_status);

    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-colors">
        <div className="flex">
          <div className="w-24 h-24 bg-muted shrink-0">
            <img
              src={group.thumbnailUrl}
              alt={`Imagen de ${group.patientName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 grow">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-medium">{group.patientName}</h3>
                <p className="text-xs text-muted-foreground">
                  ID: {group.requestId.split("-")[0]} •{" "}
                  {mainPrediction.patient_age} años
                </p>
              </div>
              <Badge variant={feedbackVariant.variant} className="shrink-0">
                {feedbackVariant.text}
              </Badge>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-foreground/90">
                {mainPrediction.disease_name}
              </h4>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  {mainPrediction.stage_content}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                {formatTime(group.requestDate)}
              </span>
              <span className="text-muted-foreground">
                {formatDate(group.requestDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a request group (single item per request+patient)
  const renderRequestGroup = (group: PredictionGroup) => {
    console.log("PredictionGroup:", group);
    return (
      <Link
        key={`${group.requestId}-${group.patientId}`}
        href={`/diagnosis/${group.requestId}`}
        className="block hover:opacity-90 transition-opacity"
      >
        {viewMode === "grid" ? renderGridCard(group) : renderListRow(group)}
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
            {predictionGroups.length === 1 ? "paciente" : "pacientes"}
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
