import { Patient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { PatientDialog } from "./add-patient-dialog";
import { CreatePredictionModal } from "@/components/diagnosis/create-prediction-modal";

interface PatientDetailProps {
  patient: Patient;
  onUpdate?: (
    patientId: string,
    data: {
      name?: string;
      dateOfBirth?: string;
      gender?: string;
      clinicalConditions?: string[];
    },
  ) => Promise<boolean>;
}

export function PatientDetail({ patient, onUpdate }: PatientDetailProps) {
  return (
    <div className="flex flex-col h-full min-w-[430px] w-full">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {patient.name}
          </h2>
          {onUpdate && (
            <PatientDialog
              patient={{
                ...patient,
                clinicalConditions: patient.clinicalConditions.join(", "),
              }}
              onSave={async (data) => {
                return await onUpdate(patient.id, data);
              }}
            />
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Condiciones Clínicas
            </p>
            <p className="mt-1 text-base text-foreground">
              {patient.clinicalConditions.join(", ") || "Ninguna"}
            </p>
            <CreatePredictionModal
              preselectedPatientId={patient.id}
              trigger={
                <Button variant="default" className="mt-6 w-full">
                  <span>Diagnosticar</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
