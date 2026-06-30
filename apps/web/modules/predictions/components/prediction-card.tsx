import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConfidenceBadge } from "@/modules/predictions/utils";
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
  /** Column 1 header — defaults to "Enfermedad"; set per task type. */
  primaryLabel?: string;
  /** Column 2 header — defaults to "Clasificación"; set per task type. */
  secondaryLabel?: string;
  onViewFeedbacks?: (feedbacks: ClassificationFeedbackWithExtras[]) => void;
  onViewDetectionFeedbacks?: () => void;
}

export function PredictionCard({
  diagnosis,
  primaryLabel = "Enfermedad",
  secondaryLabel = "Clasificación",
  onViewFeedbacks,
  onViewDetectionFeedbacks,
}: PredictionCardProps) {
  const badge = getConfidenceBadge(diagnosis.confidence);
  const feedbackCount = diagnosis.feedbacks?.length ?? 0;
  const detectionFeedbackCount = diagnosis.detectionFeedbacks?.length ?? 0;

  // Find main data feedback if it exists
  const mainDataFeedback = diagnosis.feedbacks?.find(
    (f) => f.isMainData === true,
  );

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {primaryLabel}
            </p>
            <div>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {mainDataFeedback?.disease_name || diagnosis.disease_name}
              </p>
              {mainDataFeedback &&
                mainDataFeedback.disease_name &&
                mainDataFeedback.disease_name !== diagnosis.disease_name && (
                  <p className="text-xs text-muted-foreground line-through">
                    {diagnosis.disease_name}
                  </p>
                )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {secondaryLabel}
            </p>
            <div>
              <p className="mt-1 text-sm text-foreground">
                {mainDataFeedback?.stage_content || diagnosis.stage_content}
              </p>
              {mainDataFeedback && (
                <p className="text-xs text-muted-foreground line-through">
                  {diagnosis.stage_content}
                </p>
              )}
            </div>
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
