"use client";

import {
  calculateAge,
  translateGender,
  usePatients,
} from "@/hooks/use-patients";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Card, CardContent } from "@/components/ui/card";

interface StepPatientProps {
  patientId: string;
  error?: string;
  onChange: (value: string) => void;
}

export function StepPatient({ patientId, error, onChange }: StepPatientProps) {
  const { patients, isLoading } = usePatients();
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
                      <SkeletonLoader width={120} height={20} />
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
                <SkeletonLoader width={180} height={20} />
                <SkeletonLoader width={140} height={20} className="mt-2" />
                <SkeletonLoader width={160} height={20} className="mt-2" />
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
                  {calculateAge(selectedPatient.dateOfBirth)} años
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
