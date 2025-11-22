import { Patient } from "@/hooks/use-patients";
import Link from "next/link";

interface PatientDetailProps {
  patient: Patient;
}

export function PatientDetail({ patient }: PatientDetailProps) {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Link
        href="/diagnosis/create"
        className="absolute right-6 top-6 flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-5 py-3 text-center text-sm font-bold leading-tight tracking-[0.015em] text-primary-foreground hover:bg-primary/90"
      >
        <span className="text-lg">🔍</span>
        <span>Analizar</span>
      </Link>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-foreground dark:text-white">
            {patient.name}
          </h2>
          <p className="text-muted-foreground dark:text-gray-400">
            ID: #{patient.id.slice(0, 6)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Edad
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {calculateAge(patient.dateOfBirth)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Género
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {patient.gender === "male" ? "Masculino" : "Femenino"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Contacto
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {patient.id.slice(0, 10)}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Condiciones Clínicas
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-white">
            {patient.clinicalConditions.join(", ") || "Ninguna"}
          </p>
        </div>
      </div>
    </>
  );
}
