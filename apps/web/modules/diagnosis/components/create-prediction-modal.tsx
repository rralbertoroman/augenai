"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardDialog } from "@/modules/commons/clipboard/clipboard-dialog";
import { Button } from "@/components/ui/button";
import { EyeScanUpload, ScanData } from "./eye-scan-upload";
import { translateErrorMessage } from "@/lib/error-translator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreatePredictionModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  preselectedPatientId?: string;
}

export function CreatePredictionModal({
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
  preselectedPatientId,
}: CreatePredictionModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ScanData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!data.storagePath || !data.bucketName) {
        throw new Error("Imagen no cargada correctamente");
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No autenticado");
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
        throw new Error(errorData.error || "Error al procesar la predicción");
      }

      const result = await response.json();
      console.log("Prediction response:", result);

      const requestId = result.id;

      if (!requestId) {
        throw new Error("No se recibió el ID de la solicitud");
      }

      // Close modal and redirect to request detail page
      setOpen(false);
      router.push(`/diagnosis/${requestId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      const userFriendlyError = translateErrorMessage(errorMessage);
      setError(userFriendlyError);
      console.error("Error submitting diagnosis:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClipboardDialog
      open={isOpen}
      onOpenChange={setOpen}
      title="Nueva Predicción"
      trigger={
        trigger || (
          <Button variant="default" size="lg" className="w-full">
            <span className="text-lg">+</span>
            <span className="truncate">Nueva Predicción</span>
          </Button>
        )
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <EyeScanUpload
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
        preselectedPatientId={preselectedPatientId}
      />
    </ClipboardDialog>
  );
}
