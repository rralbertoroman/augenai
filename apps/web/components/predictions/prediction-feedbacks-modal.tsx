"use client";

import { ClipboardDialog } from "@/components/common/clipboard-dialog";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/hooks/use-prediction-requests";
import { Star } from "lucide-react";

interface PredictionFeedbacksModalProps {
  open: boolean;
  onClose: (onUpdate?: () => void) => void;
  feedbacks: ClassificationFeedbackWithExtras[];
  diseaseName?: string;
  stageContent?: string;
  isRequestOwner: boolean;
  updatingFeedbackId: string | null;
  onSetMainFeedback: (feedbackId: string) => Promise<void>;
}

export function PredictionFeedbacksModal({
  open,
  onClose,
  feedbacks,
  diseaseName,
  stageContent,
  isRequestOwner,
  updatingFeedbackId,
  onSetMainFeedback,
}: PredictionFeedbacksModalProps) {
  return (
    <ClipboardDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Feedbacks de ${diseaseName || "Predicción"}`}
    >
      <div className="space-y-4">
        {diseaseName && stageContent && (
          <div className="sticky z-10 -top-4 bg-accent rounded-lg p-4 mb-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Enfermedad Original
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {diseaseName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Clasificación Original
                </p>
                <p className="mt-1 text-sm text-foreground">{stageContent}</p>
              </div>
            </div>
          </div>
        )}

        {feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No hay retroalimentaciones para esta predicción
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Total : {feedbacks.length}
            </p>
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="relative bg-card border border-border rounded-lg p-4"
              >
                {/* Badge o botón en la esquina superior derecha */}
                {feedback.isMainData ? (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Dato Principal
                  </Badge>
                ) : isRequestOwner ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-4 right-4 text-xs"
                    onClick={() => onSetMainFeedback(feedback.id)}
                    disabled={updatingFeedbackId === feedback.id}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {updatingFeedbackId === feedback.id
                      ? "Actualizando..."
                      : "Hacer Principal"}
                  </Button>
                ) : null}

                {feedback.isMainUser && (
                  <Badge className="absolute top-14 right-4 bg-secondary text-secondary-foreground text-xs">
                    Usuario Principal
                  </Badge>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pr-32">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Etapa
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {feedback.stage_content}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Usuario
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {feedback.user_name}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Creado:</span>
                    <span className="ml-2 text-foreground">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClipboardDialog>
  );
}
