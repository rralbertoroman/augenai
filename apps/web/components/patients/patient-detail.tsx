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
    <div className="flex flex-col h-full">
      <div>
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
      </div>
      <Link
        href="/diagnosis/create"
        className="mt-6 flex cursor-pointer items-center justify-center gap-2 w-full rounded-lg bg-primary/25 px-5 py-3 text-center text-sm font-bold leading-tight tracking-[0.015em] text-foreground hover:bg-primary/35 dark:bg-primary/35 dark:hover:bg-primary/45 dark:text-foreground"
      >
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 2C8.44772 2 8 2.44772 8 3V4H7C5.89543 4 5 4.89543 5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6C19 4.89543 18.1046 4 17 4H16V3C16 2.44772 15.5523 2 15 2C14.4477 2 14 2.44772 14 3V4H10V3C10 2.44772 9.55228 2 9 2ZM7 6H17V20H7V6Z" />
        </svg>
        <span>Analizar</span>
      </Link>
    </div>
  );
}
