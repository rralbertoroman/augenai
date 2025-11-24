import { useState, useRef, useEffect } from "react";
import { uploadEyeScan } from "@/lib/supabase/storage";
import { translateErrorMessage } from "@/lib/error-translator";
import { useSearchParams } from "next/navigation";

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

export function useDiagnosisForm(onSubmit: (data: ScanData) => void) {
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get("patientId");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ScanData>({
    patientId: patientIdFromUrl || "",
    task: "",
    imageType: "",
    diseases: [],
    eyeSelection: "left",
    includeDetection: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [storagePath, setStoragePath] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleDiseasesChange = (diseases: string[]) => {
    setFormData((prev) => ({ ...prev, diseases }));
    if (errors.diseases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.diseases;
        return newErrors;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous upload state when changing file
    setStoragePath("");
    setUploadProgress(0);
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
    setUploadProgress(10);

    // Simulate gradual progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 150);

    const { path, error } = await uploadEyeScan(file, imageType);

    clearInterval(progressInterval);
    setUploadProgress(100);

    // Small delay to show 100% before hiding
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (error) {
      const userFriendlyError = translateErrorMessage(
        `Error al subir imagen: ${error}`,
      );
      setErrors((prev) => ({ ...prev, file: userFriendlyError }));
      setIsUploading(false);
      setUploadProgress(0);
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
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, includeDetection: checked }));
  };

  const validateStep = (step: number): boolean => {
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
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    const submitData: ScanData = {
      ...formData,
      file: selectedFile || undefined,
    };

    onSubmit(submitData);
  };

  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  return {
    currentStep,
    formData,
    selectedFile,
    errors,
    uploadProgress,
    isUploading,
    storagePath,
    imagePreview,
    fileInputRef,
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
  };
}
