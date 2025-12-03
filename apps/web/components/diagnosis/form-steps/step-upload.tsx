import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DiseaseMultiSelect } from "./disease-multi-select";

interface StepUploadProps {
  eyeSelection: "left" | "right";
  selectedFile: File | null;
  isUploading: boolean;
  storagePath: string;
  imagePreview: string;
  selectedDiseases: string[];
  errors: Record<string, string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onEyeSelection: (eye: "left" | "right") => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileAreaClick: () => void;
  onDiseasesChange: (diseases: string[]) => void;
}

export function StepUpload({
  eyeSelection,
  selectedFile,
  isUploading,
  storagePath,
  imagePreview,
  selectedDiseases,
  errors,
  fileInputRef,
  onEyeSelection,
  onFileChange,
  onFileAreaClick,
  onDiseasesChange,
}: StepUploadProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Selección de ojo</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={eyeSelection === "left" ? "default" : "outline"}
            onClick={() => onEyeSelection("left")}
            className="flex-1"
          >
            Ojo izquierdo
          </Button>
          <Button
            type="button"
            variant={eyeSelection === "right" ? "default" : "outline"}
            onClick={() => onEyeSelection("right")}
            className="flex-1"
          >
            Ojo derecho
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Subir escaneo ocular</Label>
        <div
          onClick={onFileAreaClick}
          className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1A1A1A] transition-colors"
          role="button"
          tabIndex={0}
        >
          <p className="text-sm text-[#666666] mb-2">
            Haz clic para seleccionar archivo
          </p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {selectedFile ? selectedFile.name : "Ningún archivo seleccionado"}
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
            <Progress isUploading={isUploading} />
            <p className="text-xs text-[#666666]">Subiendo...</p>
          </div>
        )}
        {storagePath && !isUploading && (
          <p className="text-xs text-primary">✓ Imagen subida exitosamente</p>
        )}
        {errors.file && (
          <p className="text-sm text-destructive" role="alert">
            {errors.file}
          </p>
        )}
      </div>

      {storagePath && !isUploading && (
        <>
          {/* Image Preview */}
          <div className="space-y-2 animate-fadein">
            <Label className="text-sm font-medium">
              Vista previa de imagen
            </Label>
            <div
              className="border-2 border-gray-200 rounded-lg overflow-hidden bg-muted relative w-full"
              style={{ minHeight: "200px" }}
            >
              <Image
                src={imagePreview}
                alt="Vista previa del escaneo ocular"
                width={800}
                height={600}
                className="w-full h-auto max-h-96 object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Diseases Multi-Select */}
          <DiseaseMultiSelect
            selectedDiseases={selectedDiseases}
            onChange={onDiseasesChange}
            error={errors.diseases}
          />
        </>
      )}
    </div>
  );
}
