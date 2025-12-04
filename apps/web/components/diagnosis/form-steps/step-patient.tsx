"use client";

import { useEffect, useState } from "react";
import {
  translateGender,
  type Patient,
} from "@/hooks/use-patients";
import { formatAgeWithMonths } from "@/lib/date-utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { getPatientsByUserId } from "@/server/services/patient";
import { useAuth } from "@/contexts/auth-context";

interface StepPatientProps {
  patientId: string;
  error?: string;
  onChange: (value: string) => void;
}

export function StepPatient({ patientId, error, onChange }: StepPatientProps) {
  const { accessToken } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all patients without pagination
  useEffect(() => {
    const loadAllPatients = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        // Load all patients by using a very high limit
        const { patients: allPatients } = await getPatientsByUserId(
          accessToken,
          1000, // High limit to get all patients
          0,
        );
        setPatients(allPatients);
      } catch (err) {
        console.error("Error loading patients:", err);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllPatients();
  }, [accessToken]);

  // Find selected patient
  const selectedPatient = patients.find((p) => p.id === patientId);

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="patientId" className="text-sm font-medium">
          Selecciona paciente
        </Label>
        <Select value={patientId} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger id="patientId" className="w-full">
            <SelectValue
              placeholder={
                isLoading ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="sr-only">Cargando pacientes...</span>
                      <Skeleton className="w-[120px] h-5" />
                    </div>
                  </>
                ) : (
                  "Elige un paciente"
                )
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="p-2">
                <Skeleton className="w-[180px] h-5" />
                <Skeleton className="w-[140px] h-5 mt-2" />
                <Skeleton className="w-[160px] h-5 mt-2" />
              </div>
            ) : patients.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No hay pacientes disponibles
              </div>
            ) : (
              patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      {selectedPatient && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Edad</p>
                <p className="font-medium">
                  {formatAgeWithMonths(selectedPatient.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Género</p>
                <p className="font-medium">
                  {translateGender(selectedPatient.gender)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condiciones</p>
                <p className="font-medium">
                  {selectedPatient.clinicalConditions?.length > 0
                    ? selectedPatient.clinicalConditions.join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
