import { useState } from "react";
import { translateErrorMessage } from "@/lib/error-translator";

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

export function useDiagnosisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const handleScanSubmit = async (data: ScanData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!data.storagePath || !data.bucketName) {
        setError(translateErrorMessage("Imagen no cargada correctamente"));
        setIsLoading(false);
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(translateErrorMessage("No autenticado"));
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("storage_path", data.storagePath);
      formData.append("bucket_name", data.bucketName);
      formData.append("patient_id", data.patientId);
      formData.append("task", data.task);
      formData.append("image_type", data.imageType);
      formData.append("diseases", JSON.stringify(data.diseases));

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "Error al procesar la predicción";
        throw new Error(errorMessage);
      }

      // Prediction submitted successfully, show modal
      setShowResultsModal(true);
    } catch (error) {
      const userFriendlyError = translateErrorMessage(
        error instanceof Error ? error.message : "Error desconocido",
      );
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    showResultsModal,
    setShowResultsModal,
    handleScanSubmit,
  };
}
