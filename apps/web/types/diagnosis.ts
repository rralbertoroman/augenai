/**
 * Type definitions for the Eye Diagnosis feature
 */

// Scan Data Types
export interface ScanData {
  diagnostic: string;
  stage: string;
  imageType: string;
  lesionSummary: string;
  eyeSelection: "left" | "right";
  file?: File;
}

export interface ScanSubmission {
  id: string;
  patientId?: string;
  diagnostic: string;
  stage: string;
  imageType: string;
  lesionSummary: string;
  eyeSelection: "left" | "right";
  imageUrl: string;
  createdAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

// Model Information Types
export interface Disease {
  name: string;
  stages: string[];
}

export interface ModelInfo {
  name: string;
  tasks: string[];
  diseases: Disease[];
  acceptedImageTypes: string[];
  latestTraining: Date;
  accuracy: number;
  description?: string;
}

export interface ModelConfiguration {
  id: string;
  name: string;
  version: string;
  tasks: string[];
  diseases: Disease[];
  acceptedImageTypes: string[];
  latestTraining: Date;
  accuracy: number;
  description?: string;
}

// Prediction Types
export interface Prediction {
  id: string;
  diagnosis: string;
  model: string;
  consultationDate: Date;
}

// Patient Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  disease: string;
  stage: string;
  clinicalConditions: string;
}

// Form Error Types
export interface FormErrors {
  diagnostic?: string;
  stage?: string;
  imageType?: string;
  file?: string;
  general?: string;
}

// Component Props Types
export interface EyeScanUploadProps {
  onSubmit: (data: ScanData) => void;
  isLoading?: boolean;
}

export interface ModelScorecardProps {
  modelData: ModelInfo;
}

export interface RecentPredictionsProps {
  predictions: Prediction[];
}

export interface RecentPatientsProps {
  patients: Patient[];
}

export interface NavbarProps {
  currentPath?: string;
}
