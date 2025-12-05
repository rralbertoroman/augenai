"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDiagnosisForm } from "@/modules/diagnosis/hooks/use-diagnosis-form";
import { StepIndicator } from "./form-steps/step-indicator";
import { StepPatient } from "./form-steps/step-patient";
import { StepTask } from "./form-steps/step-task";
import { StepUpload } from "./form-steps/step-upload";

export interface ScanData {
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
  preselectedPatientId?: string;
}

const STEPS = [
  { number: 1, title: "Paciente" },
  { number: 2, title: "Tarea" },
  { number: 3, title: "Subir" },
];

export function EyeScanUpload({
  onSubmit,
  isLoading = false,
  preselectedPatientId,
}: EyeScanUploadProps) {
  const {
    currentStep,
    formData,
    selectedFile,
    errors,
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
  } = useDiagnosisForm(onSubmit, preselectedPatientId);

  // Show loading screen when submitting
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Spinner className="size-26 text-primary" />
        <p className="text-muted-foreground text-sm">Generando predicción...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>
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
    </div>
  );
}
