import { Patient } from "@/hooks/use-patients";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PatientDetailProps {
  patient: Patient;
}

export function PatientDetail({ patient }: PatientDetailProps) {
  return (
    <div className="flex flex-col h-full min-w-[430px] w-full">
      <div>
        <div className="flex items-center gap-4">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-foreground dark:text-white">
            {patient.name}
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Condiciones Clínicas
            </p>
            <p className="mt-1 text-base text-gray-900 dark:text-white">
              {patient.clinicalConditions.join(", ") || "Ninguna"}
            </p>
            <Link
              href={`/diagnosis/create?patientId=${patient.id}`}
              className="block w-full"
            >
              <Button variant="default" className="mt-6 w-full">
                <span>Analizar</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
