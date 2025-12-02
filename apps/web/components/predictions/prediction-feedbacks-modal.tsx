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
          <div className="sticky z-10 -top-4 bg-emerald-100 dark:bg-gray-800 rounded-lg p-4 mb-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Enfermedad Original
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {diseaseName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Clasificación Original
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {stageContent}
                </p>
              </div>
            </div>
          </div>
        )}

        {feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay retroalimentaciones para esta predicción
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total : {feedbacks.length}
            </p>
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                {/* Badge o botón en la esquina superior derecha */}
                {feedback.isMainData ? (
                  <Badge className="absolute top-4 right-4 bg-emerald-300 text-emerald-900 text-sm">
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
                  <Badge className="absolute top-14 right-4 bg-blue-200 text-blue-900 text-xs">
                    Usuario Principal
                  </Badge>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pr-32">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Etapa
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {feedback.stage_content}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Usuario
                    </p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {feedback.user_name}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Creado:
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
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
