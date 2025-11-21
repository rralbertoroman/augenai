import { Patient } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{patient.name}</h2>
        <p className="text-sm text-muted-foreground">
          {patient.gender === "male" ? "M" : "F"}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Edad</p>
          <p className="font-medium">{calculateAge(patient.dateOfBirth)}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Clinical Conditions</p>
          <p className="text-sm mt-1">
            {patient.clinicalConditions.join(", ") || "None"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Enfermedades</p>
          <div className="flex flex-wrap gap-2">
            {patient.clinicalConditions.map((condition, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button className="w-full" variant="default">
          Analizar
        </Button>
      </div>
    </div>
  );
}
