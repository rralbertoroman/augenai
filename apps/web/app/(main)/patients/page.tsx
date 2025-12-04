"use client";

import { usePatients } from "@/hooks/use-patients";
import { PatientList } from "@/components/patients/patient-list";
import { PatientDetail } from "@/components/patients/patient-detail";
import { PatientDialog } from "@/components/patients/add-patient-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/common/pagination-controls";
import { useState } from "react";
import type { ChangeEvent } from "react";

export default function PatientsPage() {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    error,
    createPatient,
    updatePatient,
    pagination,
  } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading && patients.length === 0) {
    return (
      <main className="flex-1 flex-col p-6">
        <Skeleton className="w-full h-[60px] mb-6" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 items-start">
          <Skeleton className="w-full h-[320px] lg:col-span-3 mb-6" />
          <Skeleton className="w-full h-[320px] lg:col-span-2" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col animate-fadein">
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
          <PatientDialog onSave={createPatient} />
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex gap-6">
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
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron pacientes
              </p>
            ) : (
              <>
                <div className="overflow-x-auto flex-1">
                  <PatientList
                    patients={filteredPatients}
                    selectedPatient={selectedPatient}
                    onSelectPatient={setSelectedPatient}
                  />
                </div>
                {!searchQuery && (
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
          <div
            className="relative rounded-lg border border-border bg-card p-6 animate-fadein self-start w-fit max-w-[480px]"
            style={{ alignSelf: "flex-start" }}
          >
            {selectedPatient ? (
              <PatientDetail
                patient={selectedPatient}
                onUpdate={updatePatient}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground min-w-[430px]">
                Selecciona un paciente para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
