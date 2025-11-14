"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadEyeScan } from "@/lib/supabase/storage";

interface ScanData {
  modelId: string;
  patientId: string;
  imageType: string;
  lesionSummary: string;
  eyeSelection: "left" | "right";
  file?: File;
  storagePath?: string;
  bucketName?: string;
}

interface EyeScanUploadProps {
  onSubmit: (data: ScanData) => void;
  isLoading?: boolean;
}

export function EyeScanUpload({
  onSubmit,
  isLoading = false,
}: EyeScanUploadProps) {
  const [formData, setFormData] = React.useState<ScanData>({
    modelId: "",
    patientId: "",
    imageType: "",
    lesionSummary: "",
    eyeSelection: "left",
  });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [storagePath, setStoragePath] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEyeSelection = (eye: "left" | "right") => {
    setFormData((prev) => ({ ...prev, eyeSelection: eye }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (errors.file) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }

    // Validar que imageType esté seleccionado
    if (!formData.imageType) {
      setErrors((prev) => ({
        ...prev,
        imageType: "Selecciona el tipo de imagen antes de subir el archivo",
      }));
      return;
    }

    // Determinar tipo de imagen
    const imageType =
      formData.imageType.toLowerCase() === "fundus" ? "fundus" : "oct";

    // Iniciar upload
    setIsUploading(true);
    setUploadProgress(30);

    const { path, error } = await uploadEyeScan(file, imageType);

    setUploadProgress(100);

    if (error) {
      setErrors((prev) => ({ ...prev, file: `Error al subir: ${error}` }));
      setIsUploading(false);
      setUploadProgress(0);
      return;
    }

    setStoragePath(path);
    setFormData((prev) => ({
      ...prev,
      storagePath: path,
      bucketName: "medical_images",
    }));
    setIsUploading(false);
  };

  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.modelId.trim()) {
      newErrors.modelId = "Este campo es requerido";
    }
    if (!formData.patientId.trim()) {
      newErrors.patientId = "Este campo es requerido";
    }
    if (!formData.imageType.trim()) {
      newErrors.imageType = "Este campo es requerido";
    }
    if (!selectedFile) {
      newErrors.file = "Por favor selecciona un archivo";
    }
    if (!storagePath) {
      newErrors.file = "Esperando que termine la subida del archivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: ScanData = {
      ...formData,
      file: selectedFile || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Eye Diagnosis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Model ID Field */}
          <div className="space-y-2">
            <Label htmlFor="modelId" className="text-sm font-medium">
              Model ID
            </Label>
            <Input
              id="modelId"
              name="modelId"
              value={formData.modelId}
              onChange={handleInputChange}
              aria-invalid={!!errors.modelId}
              aria-describedby={errors.modelId ? "modelId-error" : undefined}
              aria-required="true"
            />
            {errors.modelId && (
              <p
                id="modelId-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.modelId}
              </p>
            )}
          </div>

          {/* Patient ID Field */}
          <div className="space-y-2">
            <Label htmlFor="patientId" className="text-sm font-medium">
              Patient ID
            </Label>
            <Input
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              aria-invalid={!!errors.patientId}
              aria-describedby={
                errors.patientId ? "patientId-error" : undefined
              }
              aria-required="true"
            />
            {errors.patientId && (
              <p
                id="patientId-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.patientId}
              </p>
            )}
          </div>

          {/* Image Type Field */}
          <div className="space-y-2">
            <Label htmlFor="imageType" className="text-sm font-medium">
              Image Type
            </Label>
            <Select
              value={formData.imageType}
              onValueChange={(value) => handleSelectChange("imageType", value)}
            >
              <SelectTrigger
                id="imageType"
                aria-invalid={!!errors.imageType}
                aria-describedby={
                  errors.imageType ? "imageType-error" : undefined
                }
                aria-required="true"
              >
                <SelectValue placeholder="Select image type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundus">Fundus</SelectItem>
                <SelectItem value="oct">OCT</SelectItem>
              </SelectContent>
            </Select>
            {errors.imageType && (
              <p
                id="imageType-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.imageType}
              </p>
            )}
          </div>

          {/* Lesion Summary Field */}
          <div className="space-y-2">
            <Label htmlFor="lesionSummary" className="text-sm font-medium">
              Lesion Summary (Recommendations)
            </Label>
            <Textarea
              id="lesionSummary"
              name="lesionSummary"
              value={formData.lesionSummary}
              onChange={handleInputChange}
              rows={4}
              aria-label="Lesion Summary and Recommendations"
            />
          </div>

          {/* Eye Selection Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" id="eye-selection-label">
              Eye Selection
            </Label>
            <div
              className="flex gap-3"
              role="group"
              aria-labelledby="eye-selection-label"
            >
              <Button
                type="button"
                variant={
                  formData.eyeSelection === "left" ? "default" : "outline"
                }
                onClick={() => handleEyeSelection("left")}
                className="flex-1"
                aria-pressed={formData.eyeSelection === "left"}
              >
                Left Eye
              </Button>
              <Button
                type="button"
                variant={
                  formData.eyeSelection === "right" ? "default" : "outline"
                }
                onClick={() => handleEyeSelection("right")}
                className="flex-1"
                aria-pressed={formData.eyeSelection === "right"}
              >
                Right Eye
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Eye Scan</Label>
            <div
              onClick={handleFileAreaClick}
              className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-28 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1A1A1A] transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFileAreaClick();
                }
              }}
            >
              <p className="text-base text-[#666666] mb-3">
                Seleccionar archivo
              </p>
              <p className="text-base font-medium text-[#1A1A1A]">
                {selectedFile
                  ? selectedFile.name
                  : "Ningún archivo seleccionado"}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload eye scan file"
              aria-describedby={errors.file ? "file-error" : undefined}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-[#666666]">Subiendo imagen...</p>
              </div>
            )}
            {storagePath && !isUploading && (
              <p className="text-xs text-green-600">
                ✓ Imagen subida correctamente
              </p>
            )}
            {errors.file && (
              <p
                id="file-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.file}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isUploading}
          >
            {isLoading
              ? "Submitting..."
              : isUploading
                ? "Uploading..."
                : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
