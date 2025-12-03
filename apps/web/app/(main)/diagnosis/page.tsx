"use client";

import { usePredictionRequests } from "@/hooks/use-prediction-requests";
import { PredictionRequestList } from "@/components/predictions/prediction-request-list";
import { SkeletonLoader } from "@/components/common/skeleton-loader";
import { useState } from "react";
import { SharePredictionModal } from "@/components/predictions/share-prediction-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DiagnosisPage() {
  const { requests, isLoading, error } = usePredictionRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const filteredRequests = requests.filter(
    (request) =>
      request.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.diseaseNames?.some((diseaseName: string) =>
        diseaseName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const handleOpenShareModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedRequestId(null);
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex-col p-6">
        <SkeletonLoader width="100%" height={60} className="mb-6" />
        <SkeletonLoader width="100%" height={400} />
      </main>
    );
  }
  return (
    <main className="flex-1 flex-col animate-fadein">
      <div className="border-b border-border bg-card px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Solicitudes de Predicción
            </h1>
            <div className="relative">
              <input
                className="w-64 rounded-lg border border-border bg-background py-2 pl-3 pr-4 text-sm text-foreground focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Buscar por paciente o enfermedad..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-w-[480px] w-full ml-auto">
            <Link href="/diagnosis/create" className="w-full">
              <Button variant="default" size="lg" className="w-full">
                <span className="text-lg">+</span>
                <span className="truncate">Nueva Predicción</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-border bg-card dark:bg-gray-900 dark:border-gray-700 w-full">
          {error && (
            <div className="p-4 bg-destructive/10 border-b border-destructive rounded-t">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              Cargando solicitudes...
            </p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron solicitudes de predicción
            </p>
          ) : (
            <div className="overflow-x-auto">
              <PredictionRequestList
                requests={filteredRequests}
                onShare={handleOpenShareModal}
              />
            </div>
          )}
        </div>
      </div>
      <SharePredictionModal
        key={shareModalOpen ? "open" : "closed"}
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        predictionId={selectedRequestId!}
      />
    </main>
  );
}
