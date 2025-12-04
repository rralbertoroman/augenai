import { Patient } from "@/hooks/use-patients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAgeWithMonths } from "@/lib/date-utils";

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
              {formatAgeWithMonths(patient.dateOfBirth)}
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
