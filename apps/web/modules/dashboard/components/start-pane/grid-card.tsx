"use client";

import { Badge } from "@/components/ui/badge";
import type { PredictionGroup } from "./types";
import { formatAgeWithMonths, formatDate, formatTime } from "@/lib/date-utils";
import { translateStageContent } from "@/lib/translations";
import { getFeedbackVariant } from "@/modules/dashboard/utils";

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
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-4 flex flex-col">
        {/* Header: Badge + Confidence */}
        <div className="flex justify-between items-center gap-2">
          <Badge variant={feedbackVariant.variant} className="shrink-0">
            {feedbackVariant.text}
          </Badge>
          <Badge variant="secondary" className="shrink-0">
            {mainPrediction.type === "classification"
              ? `${Math.round(mainPrediction.confidence * 100)}% confianza`
              : `${Math.round(averageConfidence * 100)}% confianza promedio`}
          </Badge>
        </div>

        {/* Patient Info */}
        <div className="mt-3 flex justify-between items-baseline gap-2">
          <h4 className="text-sm font-medium text-foreground/90 truncate">
            {mainPrediction.patient_name}
          </h4>
          <span className="text-muted-foreground text-sm shrink-0">
            {formatAgeWithMonths(mainPrediction.patient_birthdate)}
          </span>
        </div>

        {/* Prediction Info */}
        <div className="mt-2 text-sm text-muted-foreground">
          {mainPrediction.type === "classification" ? (
            <div className="flex justify-between items-center gap-2">
              <span className="truncate">{mainPrediction.disease_name}</span>
              {mainPrediction.stage_content && (
                <span className="text-foreground/70 shrink-0">
                  {translateStageContent(mainPrediction.stage_content)}
                </span>
              )}
            </div>
          ) : (
            <span>{group.predictions.length} lesiones detectadas</span>
          )}
        </div>

        {/* Footer: Time + Date */}
        <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
          <span>{formatTime(group.requestDate)}</span>
          <span>{formatDate(group.requestDate)}</span>
        </div>
      </div>
    </div>
  );
}
