"use client";

import { usePredictionRequestDetail } from "@/hooks/use-prediction-request-detail";
import { formatDate } from "@/hooks/use-prediction-requests";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getConfidenceBadge } from "@/hooks/use-predictions";
import Link from "next/link";
import { use } from "react";
import { BatchFeedbackModal } from "@/components/diagnosis/batch-feedback-modal";
import { useClassificationFeedback } from "@/hooks/use-classification-feedback";

export default function PredictionDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const { request, isLoading, error } = usePredictionRequestDetail(requestId);

  // Feedback hook
  const feedback = useClassificationFeedback();

  if (isLoading) {
    return (
      <main className="flex-1 flex-col p-6">
        <SkeletonLoader width="100%" height={60} className="mb-6" />
        <SkeletonLoader width="100%" height={400} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex-col p-6">
        <div className="p-4 bg-destructive/10 border border-destructive rounded">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col animate-fadein">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/diagnosis">
              <Button variant="outline" size="sm">
                ← Volver
              </Button>
            </Link>
            <h1 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Detalles de Solicitud
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Request Info */}
        <div className="rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 mb-6">
          <h2 className="text-foreground dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
            Información de la Solicitud
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Fecha
              </p>
              <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">
                {request ? formatDate(request.createdAt) : ""}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Paciente
              </p>
              <p className="mt-1 text-base text-gray-900 dark:text-white font-semibold">
                {request?.patient?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tipo de Tarea
              </p>
              <p className="mt-1">
                <Badge variant="outline">{request?.task}</Badge>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tipo de Imagen
              </p>
              <p className="mt-1 text-base text-gray-900 dark:text-white">
                {request?.imageType}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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

        {/* Diagnósticos */}
        <div className="rounded-lg border border-border bg-card dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h2 className="text-foreground dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
              Resultados de Diagnóstico
            </h2>
            {request?.predictions && request.predictions.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => feedback.handleOpenFeedback(request.predictions)}
                className="text-md"
              >
                Brindar retroalimentación
              </Button>
            )}
          </div>
          <div className="p-6 space-y-6">
            {request?.predictions && request.predictions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Predicciones ({request.predictions.length})
                </p>
                {request.predictions.map((diagnosis) => {
                  const badge = getConfidenceBadge(diagnosis.confidence);
                  return (
                    <div
                      key={diagnosis.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Enfermedad
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {diagnosis.disease_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Clasificación
                          </p>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {diagnosis.stage_content}
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
                    </div>
                  );
                })}
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
    </main>
  );
}
