import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface StepPatientProps {
  patientId: string;
  error?: string;
  onChange: (value: string) => void;
}

// Mock patients - Replace with real data from API
const mockPatients: Patient[] = [
  { id: "P001", name: "John Doe", age: 45, gender: "Male" },
  { id: "P002", name: "Jane Smith", age: 52, gender: "Female" },
  { id: "P003", name: "Robert Johnson", age: 38, gender: "Male" },
];

export function StepPatient({ patientId, error, onChange }: StepPatientProps) {
  const selectedPatient = mockPatients.find((p) => p.id === patientId);

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="patientId" className="text-sm font-medium">
          Select Patient
        </Label>
        <Select value={patientId} onValueChange={onChange}>
          <SelectTrigger id="patientId" className="w-full">
            <SelectValue placeholder="Choose a patient" />
          </SelectTrigger>
          <SelectContent>
            {mockPatients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name} ({patient.id})
              </SelectItem>
            ))}
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
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="font-medium">{selectedPatient.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium">{selectedPatient.age} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium">{selectedPatient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
