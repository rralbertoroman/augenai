import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StepDetailsProps {
  lesionSummary: string;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDiseasesChange: (value: string) => void;
}

export function StepDetails({
  lesionSummary,
  errors,
  onInputChange,
  onDiseasesChange,
}: StepDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="diseases" className="text-sm font-medium">
          Suspected Diseases
        </Label>
        <Input
          id="diseases"
          name="diseases"
          placeholder="e.g., diabetic_retinopathy, glaucoma"
          onChange={(e) => onDiseasesChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple diseases with commas
        </p>
        {errors.diseases && (
          <p className="text-sm text-destructive" role="alert">
            {errors.diseases}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesionSummary" className="text-sm font-medium">
          Lesion Summary (Optional)
        </Label>
        <Textarea
          id="lesionSummary"
          name="lesionSummary"
          value={lesionSummary}
          onChange={onInputChange}
          rows={4}
          placeholder="Enter any additional notes or observations..."
        />
      </div>
    </div>
  );
}
