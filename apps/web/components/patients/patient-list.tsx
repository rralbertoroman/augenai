import { Patient } from "@/hooks/use-patients";

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientList({
  patients,
  selectedPatient,
  onSelectPatient,
}: PatientListProps) {
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
    <div className="space-y-2">
      {patients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => onSelectPatient(patient)}
          className={`w-full text-left p-4 rounded-lg border transition-colors ${
            selectedPatient?.id === patient.id
              ? "border-primary bg-accent"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{patient.name}</p>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span>{calculateAge(patient.dateOfBirth)} años</span>
                <span>{patient.gender === "male" ? "M" : "F"}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
