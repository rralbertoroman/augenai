"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { usePredictionRequests } from "@/modules/predictions/contexts";
import { PredictionRequestList } from "../components/prediction-request-list";
import { SharePredictionModal } from "../components/share-prediction-modal";
import { CreatePredictionModal } from "@/modules/diagnosis/components/create-prediction-modal";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/modules/commons/pagination-controls";

/**
 * PredictionRequestsContainer - Main container for the diagnosis/predictions page.
 * Handles search state, share modal state, and orchestrates all prediction-related components.
 * Following SyncLat's container pattern: containers compose components and handle orchestration.
 */
export function PredictionRequestsContainer() {
  const { requests, allRequests, isLoading, error, pagination } =
    usePredictionRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const filteredRequests = allRequests.filter(
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

  // Loading state
  if (isLoading && requests.length === 0) {
    return (
      <main className="flex-1 flex-col p-6 flex items-center justify-center">
        <Spinner className="size-24 text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col animate-fadein">
      {/* Header */}
      <PredictionRequestsHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Content */}
      <div className="flex-1 p-6">
        <PredictionRequestsPanel
          requests={searchQuery ? filteredRequests : requests}
          isLoading={isLoading}
          error={error}
          isEmpty={filteredRequests.length === 0}
          showPagination={!searchQuery}
          pagination={pagination}
          onShare={handleOpenShareModal}
        />
      </div>

      {/* Share Modal */}
      <SharePredictionModal
        key={shareModalOpen ? "open" : "closed"}
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        predictionId={selectedRequestId!}
      />
    </main>
  );
}

/**
 * PredictionRequestsHeader - Header section with title, search, and create prediction button
 */
function PredictionRequestsHeader({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em]">
            Solicitudes de Predicción
          </h1>
          <Input
            className="w-64"
            placeholder="Buscar por paciente o enfermedad..."
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        <div className="max-w-[480px] w-full ml-auto">
          <CreatePredictionModal />
        </div>
      </div>
    </div>
  );
}

/**
 * PredictionRequestsPanel - Main panel containing the prediction requests list and pagination
 */
function PredictionRequestsPanel({
  requests,
  isLoading,
  error,
  isEmpty,
  showPagination,
  pagination,
  onShare,
}: {
  requests: ReturnType<typeof usePredictionRequests>["requests"];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  showPagination: boolean;
  pagination: ReturnType<typeof usePredictionRequests>["pagination"];
  onShare: (requestId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card w-full flex flex-col">
      {error && (
        <Alert
          variant="destructive"
          className="rounded-none border-x-0 border-t-0"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">
          Cargando solicitudes...
        </p>
      ) : isEmpty ? (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron solicitudes de predicción
        </p>
      ) : (
        <>
          <div className="overflow-x-auto flex-1">
            <PredictionRequestList requests={requests} onShare={onShare} />
          </div>
          {showPagination && (
            <div className="border-t border-border px-6 bg-muted/30">
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                canGoNext={pagination.canGoNext}
                canGoPrevious={pagination.canGoPrevious}
                onNextPage={pagination.nextPage}
                onPreviousPage={pagination.previousPage}
                onGoToPage={pagination.goToPage}
                onPageSizeChange={pagination.setPageSize}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
