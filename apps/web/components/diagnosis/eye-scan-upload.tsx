"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { EyeScanUploadProps, ScanData } from "@/types/diagnosis";

export function EyeScanUpload({
  onSubmit,
  isLoading = false,
}: EyeScanUploadProps) {
  const [formData, setFormData] = React.useState<ScanData>({
    diagnostic: "",
    stage: "",
    imageType: "",
    lesionSummary: "",
    eyeSelection: "left",
  });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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

  const handleEyeSelection = (eye: "left" | "right") => {
    setFormData((prev) => ({ ...prev, eyeSelection: eye }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (errors.file) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.diagnostic.trim()) {
      newErrors.diagnostic = "Este campo es requerido";
    }
    if (!formData.stage.trim()) {
      newErrors.stage = "Este campo es requerido";
    }
    if (!formData.imageType.trim()) {
      newErrors.imageType = "Este campo es requerido";
    }
    if (!selectedFile) {
      newErrors.file = "Por favor selecciona un archivo";
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
          {/* Diagnostic Field */}
          <div className="space-y-2">
            <Label htmlFor="diagnostic" className="text-sm font-medium">
              Diagnostic
            </Label>
            <Input
              id="diagnostic"
              name="diagnostic"
              value={formData.diagnostic}
              onChange={handleInputChange}
              aria-invalid={!!errors.diagnostic}
              aria-describedby={
                errors.diagnostic ? "diagnostic-error" : undefined
              }
              aria-required="true"
            />
            {errors.diagnostic && (
              <p
                id="diagnostic-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.diagnostic}
              </p>
            )}
          </div>

          {/* Stage Field */}
          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium">
              Stage
            </Label>
            <Input
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              aria-invalid={!!errors.stage}
              aria-describedby={errors.stage ? "stage-error" : undefined}
              aria-required="true"
            />
            {errors.stage && (
              <p
                id="stage-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.stage}
              </p>
            )}
          </div>

          {/* Image Type Field */}
          <div className="space-y-2">
            <Label htmlFor="imageType" className="text-sm font-medium">
              Image Type
            </Label>
            <Input
              id="imageType"
              name="imageType"
              value={formData.imageType}
              onChange={handleInputChange}
              aria-invalid={!!errors.imageType}
              aria-describedby={
                errors.imageType ? "imageType-error" : undefined
              }
              aria-required="true"
            />
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
              className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-8 text-center cursor-pointer hover:border-[#1A1A1A] transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFileAreaClick();
                }
              }}
            >
              <p className="text-sm text-[#666666] mb-2">Seleccionar archivo</p>
              <p className="text-sm font-medium text-[#1A1A1A]">
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
            />
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
