"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiagnosisForm } from "@/hooks/use-diagnosis-form";
import { StepIndicator } from "./form-steps/step-indicator";
import { StepPatient } from "./form-steps/step-patient";
import { StepImage } from "./form-steps/step-image";
import { StepDetails } from "./form-steps/step-details";
import { StepReview } from "./form-steps/step-review";

interface ScanData {
  patientId: string;
  task: string;
  imageType: string;
  diseases: string[];
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

const STEPS = [
  { number: 1, title: "Patient" },
  { number: 2, title: "Image" },
  { number: 3, title: "Details" },
  { number: 4, title: "Review" },
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
    fileInputRef,
    handleInputChange,
    handleSelectChange,
    handleEyeSelection,
    handleDiseasesChange,
    handleFileChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleFileAreaClick,
  } = useDiagnosisForm(onSubmit);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Eye Diagnosis</CardTitle>
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
              onChange={handleInputChange}
            />
          )}

          {currentStep === 2 && (
            <StepImage
              imageType={formData.imageType}
              task={formData.task}
              eyeSelection={formData.eyeSelection}
              selectedFile={selectedFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              storagePath={storagePath}
              errors={errors}
              fileInputRef={fileInputRef}
              onSelectChange={handleSelectChange}
              onEyeSelection={handleEyeSelection}
              onFileChange={handleFileChange}
              onFileAreaClick={handleFileAreaClick}
            />
          )}

          {currentStep === 3 && (
            <StepDetails
              lesionSummary={formData.lesionSummary}
              errors={errors}
              onInputChange={handleInputChange}
              onDiseasesChange={handleDiseasesChange}
            />
          )}

          {currentStep === 4 && (
            <StepReview
              patientId={formData.patientId}
              imageType={formData.imageType}
              task={formData.task}
              eyeSelection={formData.eyeSelection}
              fileName={selectedFile?.name}
              diseases={formData.diseases}
              lesionSummary={formData.lesionSummary}
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
                Back
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
                disabled={isUploading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || isUploading}
              >
                {isLoading ? "Submitting..." : "Submit Diagnosis"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
