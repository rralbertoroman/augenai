"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSearchParams } from "next/navigation";
import { getAllDiseases } from "@/server/services/disease";
import { uploadEyeScan } from "@/lib/supabase/storage";
import { translateErrorMessage } from "@/lib/error-translator";
import type {
  Disease,
  ScanData,
  DiagnosisContextType,
  EyeSelection,
} from "../types";

// Re-export types for external use
export type { Disease, ScanData, EyeSelection };

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(
  undefined,
);

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const getInitialFormData = (patientId: string = ""): ScanData => ({
  patientId,
  task: "",
  imageType: "",
  diseases: [],
  eyeSelection: "left",
  includeDetection: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function DiagnosisProvider({
  children,
  preselectedPatientId,
}: {
  children: ReactNode;
  preselectedPatientId?: string;
}) {
  const { accessToken } = useAuth();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams?.get("patientId");

  // ─────────────────── Diseases State ───────────────────

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  const [diseasesError, setDiseasesError] = useState<string | null>(null);

  const fetchDiseases = useCallback(async (token: string) => {
    setDiseasesLoading(true);
    setDiseasesError(null);
    try {
      const data = await getAllDiseases(token);
      setDiseases(data);
    } catch (error) {
      setDiseasesError(
        `Error al cargar enfermedades: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setDiseasesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchDiseases(accessToken);
    }
  }, [accessToken, fetchDiseases]);

  const refreshDiseases = useCallback(async () => {
    if (accessToken) {
      await fetchDiseases(accessToken);
    }
  }, [accessToken, fetchDiseases]);

  // ─────────────────── Form State ───────────────────

  const initialPatientId = preselectedPatientId || patientIdFromUrl || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ScanData>(
    getInitialFormData(initialPatientId),
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [storagePath, setStoragePath] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────── Form Handlers ───────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleEyeSelection = useCallback((eye: "left" | "right") => {
    setFormData((prev) => ({ ...prev, eyeSelection: eye }));
  }, []);

  const handleDiseasesChange = useCallback(
    (newDiseases: string[]) => {
      setFormData((prev) => ({ ...prev, diseases: newDiseases }));
      if (errors.diseases) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.diseases;
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset previous upload state when changing file
      setStoragePath("");
      setIsUploading(false);

      // Revoke previous preview URL if it exists
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview("");

      setSelectedFile(file);
      if (errors.file) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }

      if (!formData.imageType) {
        setErrors((prev) => ({
          ...prev,
          file: "Selecciona el tipo de imagen primero",
        }));
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const imageType =
        formData.imageType.toLowerCase() === "fundus" ? "fundus" : "oct";

      setIsUploading(true);

      const { path, error } = await uploadEyeScan(file, imageType);

      if (error) {
        const userFriendlyError = translateErrorMessage(
          `Error al subir imagen: ${error}`,
        );
        setErrors((prev) => ({ ...prev, file: userFriendlyError }));
        setIsUploading(false);
        URL.revokeObjectURL(previewUrl);
        setImagePreview("");
        setStoragePath("");
        setFormData((prev) => ({
          ...prev,
          storagePath: "",
          bucketName: "",
        }));
        return;
      }

      setStoragePath(path);
      setFormData((prev) => ({
        ...prev,
        storagePath: path,
        bucketName: "medical_images",
      }));
      setIsUploading(false);
    },
    [errors, formData.imageType, imagePreview],
  );

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, includeDetection: checked }));
  }, []);

  // ─────────────────── Validation ───────────────────

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        if (!formData.patientId.trim()) {
          newErrors.patientId = "El paciente es requerido";
        }
      } else if (step === 2) {
        if (!formData.task.trim()) {
          newErrors.task = "La tarea es requerida";
        }
        if (!formData.imageType.trim()) {
          newErrors.imageType = "El tipo de imagen es requerido";
        }
      } else if (step === 3) {
        if (!selectedFile) {
          newErrors.file = "Por favor selecciona un archivo";
        }
        if (!storagePath) {
          newErrors.file = "Esperando a que se complete la carga";
        }
        if (formData.diseases.length === 0) {
          newErrors.diseases = "Selecciona al menos una enfermedad";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData, selectedFile, storagePath],
  );

  // ─────────────────── Navigation ───────────────────

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent, onSubmit: (data: ScanData) => void) => {
      e.preventDefault();

      if (!validateStep(3)) {
        return;
      }

      const submitData: ScanData = {
        ...formData,
        file: selectedFile || undefined,
      };

      onSubmit(submitData);
    },
    [formData, selectedFile, validateStep],
  );

  const handleFileAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ─────────────────── Reset ───────────────────

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormData(getInitialFormData(initialPatientId));
    setSelectedFile(null);
    setErrors({});
    setIsUploading(false);
    setStoragePath("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
  }, [initialPatientId, imagePreview]);

  const setPatientId = useCallback((patientId: string) => {
    setFormData((prev) => ({ ...prev, patientId }));
  }, []);

  // ─────────────────── Context Value ───────────────────

  const value: DiagnosisContextType = useMemo(
    () => ({
      // Diseases
      diseases,
      diseasesLoading,
      diseasesError,
      refreshDiseases,

      // Form state
      currentStep,
      formData,
      selectedFile,
      errors,
      isUploading,
      storagePath,
      imagePreview,
      fileInputRef,

      // Form actions
      handleInputChange,
      handleSelectChange,
      handleEyeSelection,
      handleDiseasesChange,
      handleFileChange,
      handleCheckboxChange,
      handleNext,
      handleBack,
      handleSubmit,
      handleFileAreaClick,
      resetForm,
      setPatientId,
    }),
    [
      diseases,
      diseasesLoading,
      diseasesError,
      refreshDiseases,
      currentStep,
      formData,
      selectedFile,
      errors,
      isUploading,
      storagePath,
      imagePreview,
      handleInputChange,
      handleSelectChange,
      handleEyeSelection,
      handleDiseasesChange,
      handleFileChange,
      handleCheckboxChange,
      handleNext,
      handleBack,
      handleSubmit,
      handleFileAreaClick,
      resetForm,
      setPatientId,
    ],
  );

  return (
    <DiagnosisContext.Provider value={value}>
      {children}
    </DiagnosisContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDiagnosis() {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error("useDiagnosis must be used within a DiagnosisProvider");
  }
  return context;
}
