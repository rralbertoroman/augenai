import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepPatientProps {
  patientId: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepPatient({ patientId, error, onChange }: StepPatientProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientId" className="text-sm font-medium">
          Patient ID
        </Label>
        <Input
          id="patientId"
          name="patientId"
          value={patientId}
          onChange={onChange}
          placeholder="Enter patient ID"
          aria-invalid={!!error}
          aria-required="true"
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
