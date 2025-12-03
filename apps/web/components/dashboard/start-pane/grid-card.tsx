"use client";

import { Badge } from "@/components/ui/badge";
import type { PredictionGroup } from "./types";
import { calculateAge } from "@/lib/date-utils";
import Image from "next/image";
import { translateStageContent } from "@/lib/translations";

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

  const averageConfidence =
    group.predictions.reduce(
      (acc, prediction) => acc + prediction.confidence,
      0,
    ) / group.predictions.length;

  return (
    <div
      key={`${group.requestId}-${group.patientId}`}
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-row hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col bg-muted w-32 min-h-[8rem] items-center justify-center shrink-0">
        <div className="relative w-12 h-12 opacity-50">
          <Image
            src="/file.svg"
            alt="File icon"
            fill
            className="object-contain"
          />
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
            <div className="flex flex-col">
              <h4 className="text-sm font-medium text-foreground/90 truncate">
                {mainPrediction.patient_name}
              </h4>
              <h3 className="text-muted-foreground text-sm">
                {calculateAge(mainPrediction.patient_birthdate)} años
              </h3>
            </div>
            <h4 className="text-sm truncate">
              {mainPrediction.type == "classification" ? (
                <div className="flex flex-col">
                  <div>{mainPrediction.disease_name}</div>

                  <div className="flex flex-row justify-between">
                    {mainPrediction.stage_content
                      ? translateStageContent(mainPrediction.stage_content)
                      : ""}
                    <Badge variant="secondary" className="h-fit">
                      {Math.round(mainPrediction.confidence * 100)}% confianza
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row justify-between ">
                  {group.predictions.length} lesiones detectadas
                  <Badge variant="secondary">
                    {Math.round(averageConfidence * 100)}% confianza promedio
                  </Badge>
                </div>
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
