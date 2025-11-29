"use client";

import { usePredictionRequestDetail } from "@/hooks/use-prediction-request-detail";
import { formatDate } from "@/hooks/use-prediction-requests";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PredictionCard } from "@/components/predictions/prediction-card";
import Link from "next/link";
import { use } from "react";
import { BatchFeedbackModal } from "@/components/diagnosis/batch-feedback-modal";
import { useClassificationFeedback } from "@/hooks/use-classification-feedback";
import Image from "next/image";

export default function PredictionDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const { request, isLoading, error } = usePredictionRequestDetail(requestId);
  const image_url = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Feyeswidebay.com.au%2Fwp-content%2Fuploads%2F2017%2F01%2Fdiabetic-retinopathy-3-720x480.jpg&f=1&nofb=1&ipt=4c1c919150823fc6b081f544d8d17a4a39cca9df9e956feaae7beda5203e56c2';

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
            <div className="flex flex-row gap-4 w-full">
              {/* Display the eye scan image if available */}
              {image_url && (
                <div className="w-1/4">
                  <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Image
                      src={image_url}
                      alt="Imagen del escaneo ocular para esta predicción"
                      fill
                      className="object-cover"
                      unoptimized // Since the image comes from Supabase
                    />
                  </div>
                </div>
              )}
              {request?.predictions && request.predictions.length > 0 ? (
                <div className="w-3/4 space-y-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Predicciones ({request.predictions.length})
                  </p>
                  {request.predictions.map((diagnosis) => (
                    <PredictionCard key={diagnosis.id} diagnosis={diagnosis} />
                  ))}
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
    </main>
  );
}
