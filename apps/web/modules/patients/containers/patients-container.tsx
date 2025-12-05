"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { usePatients } from "@/modules/patients/contexts";
import { PatientList } from "../components/patient-list";
import { PatientDetail } from "../components/patient-detail";
import { PatientDialog } from "../components/add-patient-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/modules/commons/pagination-controls";

type CreatePatientData = {
  name: string;
  dateOfBirth: string;
  gender: string;
  clinicalConditions: string[];
};

/**
 * PatientsContainer - Main container for the patients page.
 * Handles search state, filtering, and orchestrates all patient-related components.
 * Following SyncLat's container pattern: containers compose components and handle orchestration.
 */
export function PatientsContainer() {
  const {
    patients,
    allPatients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    pagination,
  } = usePatients();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = allPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading state
  if (isLoading && patients.length === 0) {
    return (
      <main className="flex-1 flex-col p-6 flex items-center justify-center">
        <Spinner className="size-24 text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col animate-fadein">
      {/* Header */}
      <PatientsHeader
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onCreatePatient={createPatient}
      />

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex gap-6">
          {/* Patient List Panel */}
          <PatientListPanel
            patients={searchQuery ? filteredPatients : patients}
            isLoading={isLoading}
            error={error}
            isEmpty={filteredPatients.length === 0}
            showPagination={!searchQuery}
            pagination={pagination}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />

          {/* Patient Detail Panel */}
          <PatientDetailPanel
            selectedPatient={selectedPatient}
            onUpdate={updatePatient}
          />
        </div>
      </div>
    </main>
  );
}

/**
 * PatientsHeader - Header section with title, search, and add patient button
 */
function PatientsHeader({
  searchQuery,
  onSearchChange,
  onCreatePatient,
}: {
  searchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCreatePatient: (data: CreatePatientData) => Promise<boolean>;
}) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em]">
            Pacientes
          </h1>
          <Input
            className="w-64"
            placeholder="Buscar pacientes..."
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        <PatientDialog onSave={onCreatePatient} />
      </div>
    </div>
  );
}

/**
 * PatientListPanel - Left panel containing the patient list and pagination
 */
function PatientListPanel({
  patients,
  isLoading,
  error,
  isEmpty,
  showPagination,
  pagination,
  selectedPatient,
  onSelectPatient,
}: {
  patients: ReturnType<typeof usePatients>["patients"];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  showPagination: boolean;
  pagination: ReturnType<typeof usePatients>["pagination"];
  selectedPatient: ReturnType<typeof usePatients>["selectedPatient"];
  onSelectPatient: ReturnType<typeof usePatients>["setSelectedPatient"];
}) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card animate-fadein overflow-hidden flex flex-col">
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
          Cargando pacientes...
        </p>
      ) : isEmpty ? (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron pacientes
        </p>
      ) : (
        <>
          <div className="overflow-x-auto flex-1">
            <PatientList
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={onSelectPatient}
            />
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

/**
 * PatientDetailPanel - Right panel showing selected patient details
 */
function PatientDetailPanel({
  selectedPatient,
  onUpdate,
}: {
  selectedPatient: ReturnType<typeof usePatients>["selectedPatient"];
  onUpdate: ReturnType<typeof usePatients>["updatePatient"];
}) {
  return (
    <div
      className="relative rounded-lg border border-border bg-card p-6 animate-fadein self-start w-fit max-w-[480px]"
      style={{ alignSelf: "flex-start" }}
    >
      {selectedPatient ? (
        <PatientDetail patient={selectedPatient} onUpdate={onUpdate} />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground min-w-[430px]">
          Selecciona un paciente para ver los detalles
        </div>
      )}
    </div>
  );
}
