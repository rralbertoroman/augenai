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

interface ListRowProps {
  group: PredictionGroup;
}

export function ListRow({ group }: ListRowProps) {
  const mainPrediction = group.predictions[0];
  const feedbackVariant = getFeedbackVariant(mainPrediction.feedback_status);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-colors">
      <div className="flex">
        <div className="bg-muted w-fit h-fit">
          <SupabaseImage
            bucketName={group.bucket_name}
            path={group.storage_path}
            width={200}
            height={200}
            alt={`Imagen de ${group.patientName}`}
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
}
