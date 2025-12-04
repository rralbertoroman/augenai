"use client";

import * as React from "react";
import { usePredictionRequestDetail } from "@/hooks/use-prediction-request-detail";
import { formatDate } from "@/hooks/use-prediction-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PredictionCard } from "@/components/predictions/prediction-card";
import { PredictionFeedbacksModal } from "@/components/predictions/prediction-feedbacks-modal";
import { usePredictionFeedbacks } from "@/hooks/use-prediction-feedbacks";
import Link from "next/link";
import { use } from "react";
import { BatchFeedbackModal } from "@/components/diagnosis/batch-feedback-modal";
import { useClassificationFeedback } from "@/hooks/use-classification-feedback";
import { ImageBoundingBoxes } from "@/components/d3/image-bounding-boxes";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import type { ClassificationWithExtras } from "@/server/zod-schemas/prediction_workflow";
import {
  translateImageType,
  translateTaskType,
  translateStageContent,
  translateLesionName,
} from "@/lib/translations";

export default function PredictionDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const {
    request,
    isLoading,
    error,
    addFeedbacksToClassification,
    updateFeedbacksForClassification,
  } = usePredictionRequestDetail(requestId);

  // Feedback hook with callback to update local state
  const feedback = useClassificationFeedback(addFeedbacksToClassification);

  // Feedbacks modal hook
  const feedbacksModal = usePredictionFeedbacks();

  // State to store disease/stage info for the modal
  const [currentPredictionInfo, setCurrentPredictionInfo] = React.useState<{
    diseaseName?: string;
    stageContent?: string;
    classificationId?: string;
  }>({});

  const handleViewFeedbacks = (
    feedbacks: ClassificationFeedbackWithExtras[],
    diseaseName?: string,
    stageContent?: string,
    classificationId?: string,
  ) => {
    setCurrentPredictionInfo({ diseaseName, stageContent, classificationId });
    feedbacksModal.openFeedbacksModal(
      feedbacks,
      request?.user_id,
      classificationId,
    );
  };

  // Convert detection predictions to bounding boxes
  const detectionBoxes = request?.predictionsWithExtras
    ?.flatMap((pred) => pred.detections)
    .map((detection) => ({
      id: detection.id!,
      x: detection.bbox.x_left,
      y: detection.bbox.y_top,
      width: detection.bbox.width,
      height: detection.bbox.height,
      label: detection.lesion_name,
      confidence: detection.confidence,
    }));

  // Get image storage info from the request
  const bucketName = request?.bucket_name;
  const storagePath = request?.storage_path;

  // DEBUG: Log del request completo
  React.useEffect(() => {
    if (request) {
      console.log("📦 DEBUG - Full request data:", request);
      console.log(
        "📦 DEBUG - Predictions with extras:",
        request.predictionsWithExtras,
      );
    }
  }, [request]);

  if (isLoading) {
    return (
      <main className="flex-1 flex-col p-6">
        <Skeleton className="w-full h-[60px] mb-6" />
        <Skeleton className="w-full h-[400px]" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex-col p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col animate-fadein">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/diagnosis">
              <Button variant="outline" size="sm">
                ← Volver
              </Button>
            </Link>
            <h1 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em]">
              Detalles de Solicitud
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Request Info */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
            Información de la Solicitud
          </h2>
          <div className="grid grid-cols-5 gap-x-6 gap-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="mt-1 text-base text-foreground font-semibold">
                {request ? formatDate(request.created_at) : ""}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Paciente
              </p>
              <p className="mt-1 text-base text-foreground font-semibold">
                {request?.patient_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Tarea
              </p>
              <p className="mt-1">
                <Badge variant="outline">
                  {request?.task ? translateTaskType(request.task) : ""}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Imagen
              </p>
              <p className="mt-1 text-base text-foreground">
                {request?.image_type
                  ? translateImageType(request.image_type)
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Enfermedades Sospechadas
              </p>
              <div className="flex flex-wrap gap-2">
                {request?.diseaseNames?.map(
                  (diseaseName: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {diseaseName}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row w-full space-x-3">
          {/* Display the eye scan image if available */}
          {bucketName && storagePath && (
            <div className="w-1/2">
              <div className="w-full max-w-full mx-auto">
                <ImageBoundingBoxes
                  bucketName={bucketName}
                  path={storagePath}
                  boxes={detectionBoxes}
                />
              </div>
            </div>
          )}

          {/* Diagnósticos */}
          <div className="w-1/2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between px-6 pb-3 pt-5">
              <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Resultados de Diagnóstico
              </h2>
              {request?.task !== "detection" &&
                request?.predictionsWithExtras &&
                request.predictionsWithExtras.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      // Flatten all tasks from predictionsWithExtras
                      const allTasks = request.predictionsWithExtras?.flatMap(
                        (pred) => [...pred.classifications, ...pred.detections],
                      );
                      feedback.handleOpenFeedback(allTasks!);
                    }}
                    className="text-md"
                  >
                    Brindar retroalimentación
                  </Button>
                )}
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-row gap-4 w-full">
                {request?.predictionsWithExtras &&
                request.predictionsWithExtras.length > 0 ? (
                  <div className="w-full space-y-4">
                    {(() => {
                      // Flatten all classifications and detections
                      const allTasks = request.predictionsWithExtras.flatMap(
                        (pred) => [...pred.classifications, ...pred.detections],
                      );

                      // DEBUG: Log para ver qué datos tenemos
                      console.log("🔍 DEBUG - All tasks:", allTasks);
                      console.log(
                        "🔍 DEBUG - Classifications with feedbacks:",
                        allTasks
                          .filter(
                            (t): t is ClassificationWithExtras =>
                              "disease_name" in t,
                          )
                          .map((t) => ({
                            id: t.id,
                            disease: t.disease_name,
                            feedbacks: t.feedbacks,
                            hasFeedbacks:
                              !!t.feedbacks && t.feedbacks.length > 0,
                          })),
                      );

                      return (
                        <>
                          <p className="text-sm font-medium text-muted-foreground">
                            Predicciones ({allTasks.length})
                          </p>
                          {allTasks.map((task) => {
                            // Adapt task for PredictionCard
                            const isClassification = "disease_name" in task;

                            // For detections, use the disease names from the request
                            const diseaseName = isClassification
                              ? task.disease_name
                              : request?.diseaseNames?.join(", ") ||
                                "Detección";

                            const cardProps = {
                              id: task.id!,
                              disease_name: diseaseName,
                              stage_content: isClassification
                                ? translateStageContent(task.stage_content)
                                : translateLesionName(task.lesion_name),
                              confidence: task.confidence,
                              feedbacks: isClassification
                                ? (task.feedbacks as
                                    | ClassificationFeedbackWithExtras[]
                                    | undefined)
                                : undefined,
                            };

                            // DEBUG: Log para cada card
                            if (isClassification) {
                              console.log(`🎯 Card ${task.id}:`, {
                                disease: cardProps.disease_name,
                                feedbacks: cardProps.feedbacks,
                                feedbackCount: cardProps.feedbacks?.length,
                                willShowButton:
                                  isClassification &&
                                  cardProps.feedbacks &&
                                  cardProps.feedbacks.length > 0,
                              });
                            }

                            return (
                              <PredictionCard
                                key={task.id}
                                diagnosis={cardProps}
                                onViewFeedbacks={
                                  request?.task !== "detection" &&
                                  isClassification &&
                                  cardProps.feedbacks
                                    ? (feedbacks) =>
                                        handleViewFeedbacks(
                                          feedbacks,
                                          cardProps.disease_name,
                                          cardProps.stage_content,
                                          task.id,
                                        )
                                    : undefined
                                }
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay diagnósticos disponibles para esta solicitud
                  </p>
                )}
              </div>
            </div>

            <BatchFeedbackModal
              open={feedback.openFeedbackModal}
              onOpenChange={feedback.setOpenFeedbackModal}
              predictions={feedback.predictions}
              feedbackForms={feedback.feedbackForms}
              diseases={feedback.diseases}
              onUpdateForm={feedback.updateFeedbackForm}
              loading={feedback.loading}
              error={feedback.error}
              onSubmit={feedback.handleSubmitFeedback}
            />
          </div>
        </div>

        {/* Feedbacks Modal */}
        <PredictionFeedbacksModal
          open={feedbacksModal.isOpen}
          onClose={() =>
            feedbacksModal.closeFeedbacksModal((updatedFeedbacks) => {
              if (currentPredictionInfo.classificationId) {
                updateFeedbacksForClassification(
                  currentPredictionInfo.classificationId,
                  updatedFeedbacks,
                );
              }
            })
          }
          feedbacks={feedbacksModal.localFeedbacks}
          isRequestOwner={feedbacksModal.isRequestOwner}
          updatingFeedbackId={feedbacksModal.updatingFeedbackId}
          onSetMainFeedback={feedbacksModal.handleSetMainFeedback}
          diseaseName={currentPredictionInfo.diseaseName}
          stageContent={currentPredictionInfo.stageContent}
        />
      </div>
    </main>
  );
}
