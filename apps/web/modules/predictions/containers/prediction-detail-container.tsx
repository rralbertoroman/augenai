"use client";

import * as React from "react";
import { usePredictionRequestDetail } from "@/modules/predictions/hooks/use-prediction-request-detail";
import { formatDate } from "@/lib/date-utils";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PredictionCard } from "../components/prediction-card";
import { PredictionFeedbacksModal } from "../components/prediction-feedbacks-modal";
import { usePredictionFeedbacks } from "../hooks/use-prediction-feedbacks";
import Link from "next/link";
import { BatchFeedbackModal } from "@/modules/diagnosis/components/batch-feedback-modal";
import { useClassificationFeedback } from "../hooks/use-classification-feedback";
import { useDetectionFeedback } from "../hooks/use-detection-feedback";
import { DetectionFeedbackModal } from "../components/detection-feedback-modal";
import { DetectionFeedbacksModal } from "../components/detection-feedbacks-modal";
import { ImageBoundingBoxes } from "@/modules/commons/image-viewer/image-bounding-boxes";
import type { ClassificationFeedbackWithExtras } from "@/server/zod-schemas/classification_feedback";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";
import type {
  DetectionWithExtras,
  SegmentationWithExtras,
} from "@/server/zod-schemas/prediction_workflow";
import {
  translateImageType,
  translateTaskType,
  translateStageContent,
  translateLesionName,
  translateSegmentationClassName,
} from "@/lib/translations";

interface PredictionDetailContainerProps {
  requestId: string;
}

/**
 * PredictionDetailContainer - Main container for the prediction detail page.
 * Handles all the complex state management for feedbacks, modals, and data display.
 * Following SyncLat's container pattern: containers compose components and handle orchestration.
 */
export function PredictionDetailContainer({
  requestId,
}: PredictionDetailContainerProps) {
  const {
    request,
    isLoading,
    error,
    addFeedbacksToClassification,
    updateFeedbacksForClassification,
    addFeedbacksToDetection,
  } = usePredictionRequestDetail(requestId);

  // Feedback hooks
  const classificationFeedback = useClassificationFeedback(
    addFeedbacksToClassification,
  );
  const detectionFeedback = useDetectionFeedback(addFeedbacksToDetection);
  const feedbacksModal = usePredictionFeedbacks();

  // State for classification feedbacks modal
  const [currentPredictionInfo, setCurrentPredictionInfo] = React.useState<{
    diseaseName?: string;
    stageContent?: string;
    classificationId?: string;
  }>({});

  // Get all classifications and detections
  const allClassifications = React.useMemo(
    () =>
      request?.predictionsWithExtras?.flatMap((pred) => pred.classifications) ||
      [],
    [request?.predictionsWithExtras],
  );

  const allDetections = React.useMemo(
    () =>
      request?.predictionsWithExtras?.flatMap((pred) => pred.detections) || [],
    [request?.predictionsWithExtras],
  );

  const allSegmentations = React.useMemo(
    () =>
      request?.predictionsWithExtras?.flatMap((pred) => pred.segmentations) ||
      [],
    [request?.predictionsWithExtras],
  );

  // Check if user has already provided feedback
  const [hasCheckedDetectionFeedback, setHasCheckedDetectionFeedback] =
    React.useState(false);
  const [
    hasCheckedClassificationFeedback,
    setHasCheckedClassificationFeedback,
  ] = React.useState(false);

  React.useEffect(() => {
    if (allDetections.length > 0 && !hasCheckedDetectionFeedback) {
      const detectionIds = allDetections.map((d) => d.id!).filter(Boolean);
      detectionFeedback.checkUserFeedback(detectionIds);
      setHasCheckedDetectionFeedback(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDetections.length, hasCheckedDetectionFeedback]);

  React.useEffect(() => {
    if (allClassifications.length > 0 && !hasCheckedClassificationFeedback) {
      const classificationIds = allClassifications
        .map((c) => c.id!)
        .filter(Boolean);
      classificationFeedback.checkUserFeedback(classificationIds);
      setHasCheckedClassificationFeedback(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClassifications.length, hasCheckedClassificationFeedback]);

  // Get image storage info
  const bucketName = request?.bucket_name;
  const storagePath = request?.storage_path;

  // Convert detections to bounding boxes for display
  const detectionBoxes = allDetections.map((detection) => ({
    id: detection.id!,
    x: detection.bbox.x_left,
    y: detection.bbox.y_top,
    width: detection.bbox.width,
    height: detection.bbox.height,
    label: detection.lesion_name,
    confidence: detection.confidence,
  }));

  // Convert segmentations to polygons for display
  const segmentationPolygons = allSegmentations.map((segmentation) => ({
    points: segmentation.polygon,
    label: translateSegmentationClassName(segmentation.class_name),
  }));

  // Handlers
  const handleViewClassificationFeedbacks = (
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

  const handleViewDetectionFeedbacks = (
    feedbacks: DetectionFeedbackWithExtras[],
    detection: DetectionWithExtras,
  ) => {
    detectionFeedback.openViewFeedbacksModal(
      feedbacks,
      request?.user_id,
      detection.id,
      detection.lesion_name,
      {
        xLeft: detection.bbox.x_left,
        yTop: detection.bbox.y_top,
        width: detection.bbox.width,
        height: detection.bbox.height,
      },
      bucketName,
      storagePath,
    );
  };

  const handleOpenDetectionFeedback = () => {
    if (allDetections.length > 0 && bucketName && storagePath) {
      detectionFeedback.handleOpenFeedback(
        allDetections,
        bucketName,
        storagePath,
      );
    }
  };

  const handleOpenClassificationFeedback = () => {
    const allTasks = request?.predictionsWithExtras?.flatMap((pred) => [
      ...pred.classifications,
      ...pred.detections,
    ]);
    if (allTasks) {
      classificationFeedback.handleOpenFeedback(allTasks);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="flex-1 flex-col p-6 flex items-center justify-center">
        <Spinner className="size-24 text-primary" />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex-1 flex-col p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const isDetectionFeedbackDisabled =
    detectionFeedback.hasExistingFeedback || detectionFeedback.checkingFeedback;
  const isClassificationFeedbackDisabled =
    classificationFeedback.hasExistingFeedback ||
    classificationFeedback.checkingFeedback;
  const hasClassifications = allClassifications.length > 0;
  const hasDetections = allDetections.length > 0;

  return (
    <main className="flex-1 flex-col animate-fadein">
      {/* Header */}
      <PredictionDetailHeader />

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Request Info */}
        <RequestInfoCard request={request} />

        <div className="flex flex-row w-full space-x-3">
          {/* Image Section */}
          {bucketName && storagePath && (
            <ImageSection
              bucketName={bucketName}
              storagePath={storagePath}
              detectionBoxes={detectionBoxes}
              segmentationPolygons={segmentationPolygons}
              hasDetections={hasDetections}
              hasClassifications={hasClassifications}
              taskType={request?.task}
              isDetectionFeedbackDisabled={isDetectionFeedbackDisabled}
              isClassificationFeedbackDisabled={
                isClassificationFeedbackDisabled
              }
              detectionFeedback={detectionFeedback}
              classificationFeedback={classificationFeedback}
              onOpenDetectionFeedback={handleOpenDetectionFeedback}
              onOpenClassificationFeedback={handleOpenClassificationFeedback}
            />
          )}

          {/* Diagnosis Results */}
          <DiagnosisResultsSection
            request={request}
            hasImage={!!(bucketName && storagePath)}
            onViewClassificationFeedbacks={handleViewClassificationFeedbacks}
            onViewDetectionFeedbacks={handleViewDetectionFeedbacks}
          />
        </div>

        {/* Modals */}
        <PredictionDetailModals
          request={request}
          classificationFeedback={classificationFeedback}
          detectionFeedback={detectionFeedback}
          feedbacksModal={feedbacksModal}
          currentPredictionInfo={currentPredictionInfo}
          updateFeedbacksForClassification={updateFeedbacksForClassification}
          bucketName={bucketName}
          storagePath={storagePath}
        />
      </div>
    </main>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function PredictionDetailHeader() {
  return (
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
  );
}

function RequestInfoCard({
  request,
}: {
  request: ReturnType<typeof usePredictionRequestDetail>["request"];
}) {
  return (
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
          <p className="text-sm font-medium text-muted-foreground">Paciente</p>
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
            {request?.image_type ? translateImageType(request.image_type) : ""}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Enfermedades Sospechadas
          </p>
          <div className="flex flex-wrap gap-2">
            {request?.diseaseNames?.map((diseaseName: string, i: number) => (
              <Badge key={i} variant="secondary">
                {diseaseName}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageSection({
  bucketName,
  storagePath,
  detectionBoxes,
  segmentationPolygons,
  hasDetections,
  hasClassifications,
  taskType,
  isDetectionFeedbackDisabled,
  isClassificationFeedbackDisabled,
  detectionFeedback,
  classificationFeedback,
  onOpenDetectionFeedback,
  onOpenClassificationFeedback,
}: {
  bucketName: string;
  storagePath: string;
  detectionBoxes: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }>;
  segmentationPolygons: Array<{
    points: number[][];
    label: string;
  }>;
  hasDetections: boolean;
  hasClassifications: boolean;
  taskType?: string;
  isDetectionFeedbackDisabled: boolean;
  isClassificationFeedbackDisabled: boolean;
  detectionFeedback: ReturnType<typeof useDetectionFeedback>;
  classificationFeedback: ReturnType<typeof useClassificationFeedback>;
  onOpenDetectionFeedback: () => void;
  onOpenClassificationFeedback: () => void;
}) {
  return (
    <div className="w-1/2 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Imagen de Análisis
        </h2>
        <div className="flex gap-2">
          {/* Detection feedback button */}
          {hasDetections && (
            <Button
              onClick={onOpenDetectionFeedback}
              disabled={isDetectionFeedbackDisabled}
              size="sm"
              className="gap-2"
              title={
                detectionFeedback.hasExistingFeedback
                  ? "Ya has brindado retroalimentación"
                  : "Brindar retroalimentación"
              }
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {detectionFeedback.checkingFeedback
                ? "Verificando..."
                : detectionFeedback.hasExistingFeedback
                  ? "Retroalimentación Enviada"
                  : "Brindar retroalimentación"}
            </Button>
          )}
          {/* Classification feedback button */}
          {hasClassifications && taskType !== "detection" && (
            <Button
              onClick={onOpenClassificationFeedback}
              disabled={isClassificationFeedbackDisabled}
              size="sm"
              className="gap-2"
              title={
                classificationFeedback.hasExistingFeedback
                  ? "Ya has brindado retroalimentación"
                  : "Brindar retroalimentación"
              }
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              {classificationFeedback.checkingFeedback
                ? "Verificando..."
                : classificationFeedback.hasExistingFeedback
                  ? "Retroalimentación Enviada"
                  : "Brindar retroalimentación"}
            </Button>
          )}
        </div>
      </div>
      <div className="p-6 pt-0">
        <ImageBoundingBoxes
          bucketName={bucketName}
          path={storagePath}
          boxes={detectionBoxes}
          polygons={segmentationPolygons}
        />
      </div>
    </div>
  );
}

function DiagnosisResultsSection({
  request,
  hasImage,
  onViewClassificationFeedbacks,
  onViewDetectionFeedbacks,
}: {
  request: ReturnType<typeof usePredictionRequestDetail>["request"];
  hasImage: boolean;
  onViewClassificationFeedbacks: (
    feedbacks: ClassificationFeedbackWithExtras[],
    diseaseName?: string,
    stageContent?: string,
    classificationId?: string,
  ) => void;
  onViewDetectionFeedbacks: (
    feedbacks: DetectionFeedbackWithExtras[],
    detection: DetectionWithExtras,
  ) => void;
}) {
  return (
    <div className={hasImage ? "w-1/2" : "w-full"}>
      <div className="rounded-lg border border-border bg-card h-full">
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Resultados de Diagnóstico
          </h2>
        </div>
        <div className="p-6 pt-0 space-y-6 max-h-[65vh] overflow-y-auto">
          <div className="flex flex-row gap-4 w-full">
            {request?.predictionsWithExtras &&
            request.predictionsWithExtras.length > 0 ? (
              <div className="w-full space-y-4">
                {(() => {
                  const allTasks = request.predictionsWithExtras.flatMap(
                    (pred) => [
                      ...pred.classifications,
                      ...pred.detections,
                      ...pred.segmentations,
                    ],
                  );

                  return (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">
                        Predicciones ({allTasks.length})
                      </p>
                      {allTasks.map((task) => {
                        const isSegmentation = "polygon" in task;
                        const isClassification = "disease_name" in task;
                        const isDetection = "lesion_name" in task;

                        // Segmentation regions: read-only card with
                        // class name + confidence + area (no feedback).
                        if (isSegmentation) {
                          const segmentation = task as SegmentationWithExtras;
                          return (
                            <PredictionCard
                              key={segmentation.id}
                              primaryLabel="Biomarcador"
                              secondaryLabel="Área"
                              diagnosis={{
                                id: segmentation.id!,
                                disease_name: translateSegmentationClassName(
                                  segmentation.class_name,
                                ),
                                stage_content: `${Math.round(
                                  segmentation.area,
                                )} px²`,
                                confidence: segmentation.confidence,
                              }}
                            />
                          );
                        }

                        const diseaseName = isClassification
                          ? task.disease_name
                          : request?.diseaseNames?.join(", ") || "Detección";

                        const cardProps = {
                          id: task.id!,
                          disease_name: diseaseName,
                          stage_content: isClassification
                            ? translateStageContent(task.stage_content)
                            : translateLesionName(
                                (task as DetectionWithExtras).lesion_name,
                              ),
                          confidence: task.confidence,
                          feedbacks: isClassification
                            ? (task.feedbacks as
                                | ClassificationFeedbackWithExtras[]
                                | undefined)
                            : undefined,
                          detectionFeedbacks: isDetection
                            ? ((task as DetectionWithExtras).feedbacks as
                                | DetectionFeedbackWithExtras[]
                                | undefined)
                            : undefined,
                        };

                        return (
                          <PredictionCard
                            key={task.id}
                            diagnosis={cardProps}
                            onViewFeedbacks={
                              isClassification && cardProps.feedbacks
                                ? (feedbacks) =>
                                    onViewClassificationFeedbacks(
                                      feedbacks,
                                      cardProps.disease_name,
                                      cardProps.stage_content,
                                      task.id,
                                    )
                                : undefined
                            }
                            onViewDetectionFeedbacks={
                              isDetection &&
                              cardProps.detectionFeedbacks &&
                              cardProps.detectionFeedbacks.length > 0
                                ? () =>
                                    onViewDetectionFeedbacks(
                                      cardProps.detectionFeedbacks!,
                                      task as DetectionWithExtras,
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
      </div>
    </div>
  );
}

function PredictionDetailModals({
  request,
  classificationFeedback,
  detectionFeedback,
  feedbacksModal,
  currentPredictionInfo,
  updateFeedbacksForClassification,
  bucketName,
  storagePath,
}: {
  request: ReturnType<typeof usePredictionRequestDetail>["request"];
  classificationFeedback: ReturnType<typeof useClassificationFeedback>;
  detectionFeedback: ReturnType<typeof useDetectionFeedback>;
  feedbacksModal: ReturnType<typeof usePredictionFeedbacks>;
  currentPredictionInfo: {
    diseaseName?: string;
    stageContent?: string;
    classificationId?: string;
  };
  updateFeedbacksForClassification: (
    classificationId: string,
    feedbacks: ClassificationFeedbackWithExtras[],
  ) => void;
  bucketName?: string;
  storagePath?: string;
}) {
  return (
    <>
      <BatchFeedbackModal
        open={classificationFeedback.openFeedbackModal}
        onOpenChange={classificationFeedback.setOpenFeedbackModal}
        predictions={classificationFeedback.predictions}
        feedbackForms={classificationFeedback.feedbackForms}
        diseases={classificationFeedback.diseases}
        onUpdateForm={classificationFeedback.updateFeedbackForm}
        loading={classificationFeedback.loading}
        error={classificationFeedback.error}
        onSubmit={classificationFeedback.handleSubmitFeedback}
      />

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

      {bucketName && storagePath && (
        <DetectionFeedbackModal
          open={detectionFeedback.openFeedbackModal}
          onOpenChange={detectionFeedback.setOpenFeedbackModal}
          bucketName={bucketName}
          storagePath={storagePath}
          detections={detectionFeedback.detections}
          onSave={detectionFeedback.handleSubmitFeedback}
        />
      )}

      <DetectionFeedbacksModal
        open={detectionFeedback.viewModalOpen}
        onClose={detectionFeedback.closeViewFeedbacksModal}
        feedbacks={detectionFeedback.viewModalFeedbacks}
        lesionName={detectionFeedback.viewModalInfo.lesionName}
        originalBbox={detectionFeedback.viewModalInfo.originalBbox}
        isRequestOwner={detectionFeedback.isRequestOwner}
        updatingFeedbackId={detectionFeedback.updatingFeedbackId}
        onSetMainFeedback={detectionFeedback.handleSetMainFeedback}
        bucketName={detectionFeedback.viewModalInfo.bucketName}
        storagePath={detectionFeedback.viewModalInfo.storagePath}
      />
    </>
  );
}
