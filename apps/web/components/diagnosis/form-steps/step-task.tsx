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
  includeDetection,
  errors,
  onSelectChange,
  onCheckboxChange,
}: StepTaskProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="imageType" className="text-sm font-medium">
          Image Type
        </Label>
        <Select
          value={imageType}
          onValueChange={(value) => onSelectChange("imageType", value)}
        >
          <SelectTrigger id="imageType" className="w-full">
            <SelectValue placeholder="Select image type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fundus">Fundus</SelectItem>
            <SelectItem value="oct">OCT</SelectItem>
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
          Task
        </Label>
        <Select
          value={task}
          onValueChange={(value) => onSelectChange("task", value)}
        >
          <SelectTrigger id="task" className="w-full">
            <SelectValue placeholder="Select task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classification">Classification</SelectItem>
            <SelectItem value="detection">Detection</SelectItem>
          </SelectContent>
        </Select>
        {errors.task && (
          <p className="text-sm text-destructive" role="alert">
            {errors.task}
          </p>
        )}
      </div>

      {task && task !== "detection" && (
        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
          <input
            type="checkbox"
            id="includeDetection"
            checked={includeDetection}
            onChange={(e) => onCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label
            htmlFor="includeDetection"
            className="text-sm font-medium cursor-pointer"
          >
            Also perform detection
          </Label>
        </div>
      )}
    </div>
  );
}
