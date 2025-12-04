import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConfidenceBadge } from "@/hooks/use-predictions";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";
import { MessageSquare } from "lucide-react";

export interface PredictionCardProps {
  diagnosis: {
    id: string;
    disease_name?: string;
    stage_content?: string;
    confidence: number;
    feedbacks?: ClassificationFeedbackWithExtras[];
    detectionFeedbacks?: DetectionFeedbackWithExtras[];
  };
  onViewFeedbacks?: (feedbacks: ClassificationFeedbackWithExtras[]) => void;
  onViewDetectionFeedbacks?: () => void;
}

export function PredictionCard({
  diagnosis,
  onViewFeedbacks,
  onViewDetectionFeedbacks,
}: PredictionCardProps) {
  const badge = getConfidenceBadge(diagnosis.confidence);
  const feedbackCount = diagnosis.feedbacks?.length ?? 0;
  const detectionFeedbackCount = diagnosis.detectionFeedbacks?.length ?? 0;

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Enfermedad
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {diagnosis.disease_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Clasificación
            </p>
            <p className="mt-1 text-sm text-foreground">
              {diagnosis.stage_content}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Confianza
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              <span className="text-sm font-semibold text-foreground">
                {(diagnosis.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {onViewFeedbacks && diagnosis.feedbacks && feedbackCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewFeedbacks(diagnosis.feedbacks!)}
              className="bg-secondary dark:bg-secondary text-accent-foreground dark:hover:bg-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Retroalimentaciones ({feedbackCount})
            </Button>
          )}
          {onViewDetectionFeedbacks && detectionFeedbackCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetectionFeedbacks}
              className="bg-secondary dark:bg-secondary text-accent-foreground dark:hover:bg-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Retroalimentaciones ({detectionFeedbackCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
