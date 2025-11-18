import { useState, useRef } from "react";
import { uploadEyeScan } from "@/lib/supabase/storage";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ScanData>({
    patientId: "",
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
    setUploadProgress(30);

    const { path, error } = await uploadEyeScan(file, imageType);

    setUploadProgress(100);

    if (error) {
      setErrors((prev) => ({ ...prev, file: `Error al subir: ${error}` }));
      setIsUploading(false);
      setUploadProgress(0);
      URL.revokeObjectURL(previewUrl);
      setImagePreview("");
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
        newErrors.patientId = "Patient is required";
      }
    } else if (step === 2) {
      if (!formData.task.trim()) {
        newErrors.task = "Task is required";
      }
      if (!formData.imageType.trim()) {
        newErrors.imageType = "Image type is required";
      }
    } else if (step === 3) {
      if (!selectedFile) {
        newErrors.file = "Please select a file";
      }
      if (!storagePath) {
        newErrors.file = "Waiting for upload to complete";
      }
      if (formData.diseases.length === 0) {
        newErrors.diseases = "Select at least one disease";
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
