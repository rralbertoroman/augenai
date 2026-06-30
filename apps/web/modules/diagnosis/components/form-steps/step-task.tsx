import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepTaskProps {
  imageType: string;
  task: string;
  includeDetection: boolean;
  errors: Record<string, string>;
  onSelectChange: (name: string, value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
}

export function StepTask({
  imageType,
  task,
  errors,
  onSelectChange,
}: StepTaskProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="imageType" className="text-sm font-medium">
          Tipo de imagen
        </Label>
        <Select
          value={imageType}
          onValueChange={(value) => onSelectChange("imageType", value)}
        >
          <SelectTrigger id="imageType" className="w-full">
            <SelectValue placeholder="Selecciona tipo de imagen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fundus">Fundus</SelectItem>
            <SelectItem value="oct">OCT</SelectItem>
            <SelectItem value="oct-a">OCT-A</SelectItem>
          </SelectContent>
        </Select>
        {errors.imageType && (
          <p className="text-sm text-destructive" role="alert">
            {errors.imageType}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task" className="text-sm font-medium">
          Tarea
        </Label>
        <Select
          value={task}
          onValueChange={(value) => onSelectChange("task", value)}
        >
          <SelectTrigger id="task" className="w-full">
            <SelectValue placeholder="Selecciona tarea" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classification">Clasificación</SelectItem>
            <SelectItem value="detection">Detección</SelectItem>
            <SelectItem value="segmentation">Segmentación</SelectItem>
          </SelectContent>
        </Select>
        {errors.task && (
          <p className="text-sm text-destructive" role="alert">
            {errors.task}
          </p>
        )}
      </div>
    </div>
  );
}
