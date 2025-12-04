import { Patient } from "@/hooks/use-patients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Nombre</TableHead>
          <TableHead>Edad</TableHead>
          <TableHead>Género</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className={`cursor-pointer ${
              selectedPatient?.id === patient.id
                ? "bg-primary/20 hover:bg-primary/30"
                : ""
            }`}
          >
            <TableCell className="font-medium text-foreground p-4">
              {patient.name}
            </TableCell>
            <TableCell
              className={
                selectedPatient?.id === patient.id
                  ? "font-medium text-foreground"
                  : ""
              }
            >
              {calculateAge(patient.dateOfBirth)}
            </TableCell>
            <TableCell
              className={
                selectedPatient?.id === patient.id
                  ? "font-medium text-foreground"
                  : ""
              }
            >
              {patient.gender === "male" ? "Masculino" : "Femenino"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
