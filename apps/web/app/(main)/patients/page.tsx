"use client";

import { usePatients } from "@/hooks/use-patients";
import { PatientList } from "@/components/patients/patient-list";
import { PatientDetail } from "@/components/patients/patient-detail";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Panel - Patient List */}
      <div className="lg:col-span-2 space-y-4 overflow-hidden flex flex-col">
        <div className="flex gap-2">
          <div className="relative flex-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1">
            <AddPatientDialog onAddPatient={createPatient} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading patients...
            </p>
          ) : filteredPatients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No patients found
            </p>
          ) : (
            <PatientList
              patients={filteredPatients}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Patient Detail */}
      <div className="border rounded-lg p-6 bg-card">
        {selectedPatient ? (
          <PatientDetail patient={selectedPatient} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a patient to view details
          </div>
        )}
      </div>
    </div>
  );
}
