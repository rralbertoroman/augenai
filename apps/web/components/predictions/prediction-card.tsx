import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConfidenceBadge } from "@/hooks/use-predictions";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import { MessageSquare } from "lucide-react";

export interface PredictionCardProps {
  diagnosis: {
    id: string;
    disease_name?: string;
    stage_content?: string;
    confidence: number;
    feedbacks?: ClassificationFeedbackWithExtras[];
  };
  onViewFeedbacks?: (feedbacks: ClassificationFeedbackWithExtras[]) => void;
}

export function PredictionCard({
  diagnosis,
  onViewFeedbacks,
}: PredictionCardProps) {
  const badge = getConfidenceBadge(diagnosis.confidence);
  const feedbackCount = diagnosis.feedbacks?.length || 0;

  // DEBUG: Log para ver qué está recibiendo el componente
  console.log(`🎴 PredictionCard ${diagnosis.id}:`, {
    disease: diagnosis.disease_name,
    hasFeedbacks: !!diagnosis.feedbacks,
    feedbackCount,
    hasCallback: !!onViewFeedbacks,
    willShowButton: !!onViewFeedbacks,
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Enfermedad
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {diagnosis.disease_name ?? ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Clasificación
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {diagnosis.stage_content ?? ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Confianza
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {(diagnosis.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {onViewFeedbacks && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewFeedbacks(diagnosis.feedbacks || [])}
            className="shrink-0 bg-emerald-100"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Retroalimentaciones ({feedbackCount})
          </Button>
        )}
      </div>
    </div>
  );
}
