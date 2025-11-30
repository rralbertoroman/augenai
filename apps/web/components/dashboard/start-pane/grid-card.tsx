"use client";

import { Badge } from "@/components/ui/badge";
import SupabaseImage from "@/components/ui/supabase-image";
import type { PredictionGroup } from "./types";

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

interface GridCardProps {
  group: PredictionGroup;
}

export function GridCard({ group }: GridCardProps) {
  const mainPrediction = group.predictions[0];
  const feedbackVariant = getFeedbackVariant(mainPrediction.feedback_status);

  return (
    <div
      key={`${group.requestId}-${group.patientId}`}
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-row hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col relative bg-muted w-fit">
        <SupabaseImage
          bucketName={group.bucket_name}
          path={group.storage_path}
          width={200}
          height={200}
          alt={`Imagen de ${group.patientName}`}
        />
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary">
            {Math.round(mainPrediction.confidence * 100)}%
          </Badge>
        </div>
      </div>
      <div className="p-4 flex flex-col grow w-1/2">
        <div className="grow">
          <div className="flex justify-between items-start gap-2">
            <Badge variant={feedbackVariant.variant} className="shrink-0">
              {feedbackVariant.text}
            </Badge>
          </div>

          <div className="mt-3">
            <div className="flex flex-row">
              <h4 className="flex flex-row text-sm font-medium text-foreground/90 truncate">
                {mainPrediction.patient_name}
              </h4>
              <h3 className="text-muted-foreground text-sm ml-2">
                {" "}
                {mainPrediction.patient_age}
              </h3>
            </div>
            <h4 className="text-sm truncate">
              {mainPrediction.type == "classification" ? (
                <>
                  {mainPrediction.disease_name}
                  <br />
                  {mainPrediction.stage_content}
                </>
              ) : (
                `${group.predictions.length} lesiones detectadas`
              )}
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
}
