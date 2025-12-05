import type { RefObject, ChangeEvent, FormEvent } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Entity Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Disease {
  id: string;
  name: string;
  stages: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Data Types
// ─────────────────────────────────────────────────────────────────────────────

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

export type EyeSelection = "left" | "right";

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosisContextType {
  // Diseases
  diseases: Disease[];
  diseasesLoading: boolean;
  diseasesError: string | null;
  refreshDiseases: () => Promise<void>;

  // Form state
  currentStep: number;
  formData: ScanData;
  selectedFile: File | null;
  errors: Record<string, string>;
  isUploading: boolean;
  storagePath: string;
  imagePreview: string;
  fileInputRef: RefObject<HTMLInputElement | null>;

  // Form actions
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleEyeSelection: (eye: EyeSelection) => void;
  handleDiseasesChange: (diseases: string[]) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCheckboxChange: (checked: boolean) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: (e: FormEvent, onSubmit: (data: ScanData) => void) => void;
  handleFileAreaClick: () => void;
  resetForm: () => void;
  setPatientId: (patientId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosisStep {
  id: number;
  title: string;
  description: string;
}

export const DIAGNOSIS_STEPS: DiagnosisStep[] = [
  { id: 1, title: "Paciente", description: "Seleccionar paciente" },
  { id: 2, title: "Configuración", description: "Tipo de análisis" },
  { id: 3, title: "Imagen", description: "Subir imagen" },
  { id: 4, title: "Confirmación", description: "Revisar y enviar" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Image Type Options
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageTypeOption {
  value: string;
  label: string;
  description?: string;
}

export const IMAGE_TYPE_OPTIONS: ImageTypeOption[] = [
  { value: "fundus", label: "Fondo de ojo", description: "Imagen de retina" },
  {
    value: "oct",
    label: "OCT",
    description: "Tomografía de coherencia óptica",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Task Type Options
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskTypeOption {
  value: string;
  label: string;
  description?: string;
}

export const TASK_TYPE_OPTIONS: TaskTypeOption[] = [
  {
    value: "classification",
    label: "Clasificación",
    description: "Clasificar la imagen",
  },
  { value: "detection", label: "Detección", description: "Detectar lesiones" },
];
