"use client";

import { usePatients } from "@/hooks/use-patients";
import { PatientList } from "@/components/patients/patient-list";
import { PatientDetail } from "@/components/patients/patient-detail";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import { useState } from "react";

export default function PatientsPage() {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    isLoading,
    createPatient,
  } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="flex-1 flex-col">
      <div className="border-b border-border bg-card px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Pacientes
            </h1>
            <div className="relative">
              <input
                className="w-64 rounded-lg border border-border bg-background py-2 pl-3 pr-4 text-sm text-foreground focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Buscar pacientes..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <AddPatientDialog onAddPatient={createPatient} />
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card dark:bg-gray-900 dark:border-gray-700 lg:col-span-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">
                Cargando pacientes...
              </p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron pacientes
              </p>
            ) : (
              <div className="overflow-x-auto">
                <PatientList
                  patients={filteredPatients}
                  selectedPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                />
              </div>
            )}
          </div>
          <div className="relative rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 lg:col-span-2">
            {selectedPatient ? (
              <PatientDetail patient={selectedPatient} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Selecciona un paciente para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
