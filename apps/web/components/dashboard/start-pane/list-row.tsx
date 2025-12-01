"use client";

import { Badge } from "@/components/ui/badge";
import SupabaseImage from "@/components/common/supabase-image";
import type { PredictionGroup } from "./types";
import { useMedicalStats } from "@/hooks/use-medical-stats";

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
  const { calculateAge } = useMedicalStats();
  const mainPrediction = group.predictions[0];
  const feedbackVariant = getFeedbackVariant(mainPrediction.feedback_status);

  // Group lesions by class and calculate average confidence for each
  const lesionStats = group.predictions.reduce(
    (acc, prediction) => {
      const className = prediction.bbox.label || "Lesión";
      if (!acc[className]) {
        acc[className] = { count: 0, totalConfidence: 0 };
      }
      acc[className].count += 1;
      acc[className].totalConfidence += prediction.confidence;
      return acc;
    },
    {} as Record<string, { count: number; totalConfidence: number }>,
  );

  // Sort by count in descending order and calculate average confidence
  const sortedLesions = Object.entries(lesionStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([className, stats]) => ({
      className,
      count: stats.count,
      avgConfidence: Math.round((stats.totalConfidence / stats.count) * 100),
    }));

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
          <div className="grid grid-cols-2 gap-4">
            {/* First Column: Patient Info */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium">{group.patientName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {calculateAge(mainPrediction.patient_birthdate)} años
                    </p>
                  </div>
                </div>
              </div>
              <Badge
                variant={feedbackVariant.variant}
                className="shrink-0 w-fit"
              >
                {feedbackVariant.text}
              </Badge>
            </div>

            {/* Second Column: Prediction Data */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground/90">
                  {mainPrediction.type == "classification" ? (
                    <div className="flex flex-col">
                      <div>{mainPrediction.disease_name}</div>

                      <div className="flex flex-row justify-between">
                        {mainPrediction.stage_content}
                        <Badge variant="secondary" className="h-fit">
                          {Math.round(mainPrediction.confidence * 100)}%
                          confianza
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row justify-between">
                        <span>
                          {group.predictions.length} lesiones detectadas
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {sortedLesions.map(
                          ({ className, count, avgConfidence }) => (
                            <div key={className}>
                              - {className}: {count} ({avgConfidence}%
                              confianza)
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </h4>
              </div>
            </div>
          </div>

          {/* Footer with timestamps spanning both columns */}
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
