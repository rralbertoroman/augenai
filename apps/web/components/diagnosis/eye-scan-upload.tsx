"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiagnosisForm } from "@/hooks/use-diagnosis-form";
import { StepIndicator } from "./form-steps/step-indicator";
import { StepPatient } from "./form-steps/step-patient";
import { StepTask } from "./form-steps/step-task";
import { StepUpload } from "./form-steps/step-upload";

interface ScanData {
  patientId: string;
  task: string;
  imageType: string;
  diseases: string[];
  eyeSelection: "left" | "right";
  includeDetection: boolean;
  file?: File;
  storagePath?: string;
  bucketName?: string;
}

interface EyeScanUploadProps {
  onSubmit: (data: ScanData) => void;
  isLoading?: boolean;
}

const STEPS = [
  { number: 1, title: "Paciente" },
  { number: 2, title: "Tarea" },
  { number: 3, title: "Subir" },
];

export function EyeScanUpload({
  onSubmit,
  isLoading = false,
}: EyeScanUploadProps) {
  const {
    currentStep,
    formData,
    selectedFile,
    errors,
    uploadProgress,
    isUploading,
    storagePath,
    imagePreview,
    fileInputRef,
    handleSelectChange,
    handleEyeSelection,
    handleDiseasesChange,
    handleFileChange,
    handleCheckboxChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleFileAreaClick,
  } = useDiagnosisForm(onSubmit);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Diagnóstico ocular</CardTitle>
        <div className="mt-4">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {currentStep === 1 && (
            <StepPatient
              patientId={formData.patientId}
              error={errors.patientId}
              onChange={(value) => handleSelectChange("patientId", value)}
            />
          )}

          {currentStep === 2 && (
            <StepTask
              imageType={formData.imageType}
              task={formData.task}
              includeDetection={formData.includeDetection}
              errors={errors}
              onSelectChange={handleSelectChange}
              onCheckboxChange={handleCheckboxChange}
            />
          )}

          {currentStep === 3 && (
            <StepUpload
              eyeSelection={formData.eyeSelection}
              selectedFile={selectedFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              storagePath={storagePath}
              imagePreview={imagePreview}
              selectedDiseases={formData.diseases}
              errors={errors}
              fileInputRef={fileInputRef}
              onEyeSelection={handleEyeSelection}
              onFileChange={handleFileChange}
              onFileAreaClick={handleFileAreaClick}
              onDiseasesChange={handleDiseasesChange}
            />
          )}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
                disabled={isUploading}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isLoading ||
                  isUploading ||
                  !storagePath ||
                  formData.diseases.length === 0
                }
              >
                {isLoading ? "Enviando..." : "Enviar diagnóstico"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
