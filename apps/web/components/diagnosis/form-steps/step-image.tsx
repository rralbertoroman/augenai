import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepImageProps {
  imageType: string;
  task: string;
  eyeSelection: "left" | "right";
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  storagePath: string;
  errors: Record<string, string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectChange: (name: string, value: string) => void;
  onEyeSelection: (eye: "left" | "right") => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileAreaClick: () => void;
}

export function StepImage({
  imageType,
  task,
  eyeSelection,
  selectedFile,
  isUploading,
  uploadProgress,
  storagePath,
  errors,
  fileInputRef,
  onSelectChange,
  onEyeSelection,
  onFileChange,
  onFileAreaClick,
}: StepImageProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageType" className="text-sm font-medium">
          Image Type
        </Label>
        <Select
          value={imageType}
          onValueChange={(value) => onSelectChange("imageType", value)}
        >
          <SelectTrigger id="imageType">
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
          <SelectTrigger id="task">
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

      <div className="space-y-2">
        <Label className="text-sm font-medium">Eye Selection</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={eyeSelection === "left" ? "default" : "outline"}
            onClick={() => onEyeSelection("left")}
            className="flex-1"
          >
            Left Eye
          </Button>
          <Button
            type="button"
            variant={eyeSelection === "right" ? "default" : "outline"}
            onClick={() => onEyeSelection("right")}
            className="flex-1"
          >
            Right Eye
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Upload Eye Scan</Label>
        <div
          onClick={onFileAreaClick}
          className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1A1A1A] transition-colors"
          role="button"
          tabIndex={0}
        >
          <p className="text-sm text-[#666666] mb-2">Click to select file</p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {selectedFile ? selectedFile.name : "No file selected"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} />
            <p className="text-xs text-[#666666]">Uploading...</p>
          </div>
        )}
        {storagePath && !isUploading && (
          <p className="text-xs text-green-600">
            ✓ Image uploaded successfully
          </p>
        )}
        {errors.file && (
          <p className="text-sm text-destructive" role="alert">
            {errors.file}
          </p>
        )}
      </div>
    </div>
  );
}
