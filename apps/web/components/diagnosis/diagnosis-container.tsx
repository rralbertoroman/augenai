"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeScanUpload } from "./eye-scan-upload";
import { translateErrorMessage } from "@/lib/error-translator";
import { ScanData } from "./eye-scan-upload";
export function DiagnosisContainer() {
  const router = useRouter();
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

      const requestId = result.request_id || result.requestId;

      if (!requestId) {
        throw new Error("No se recibió el ID de la solicitud");
      }

      // Redirect to the request detail page after prediction completes
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
    <>
      <main className="flex-1 flex-col">
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}
          <section
            aria-labelledby="diagnosis-section"
            className="grid grid-cols-1 gap-6 lg:grid-cols-5"
          >
            <h2 id="diagnosis-section" className="sr-only">
              Formulario de Diagnóstico Ocular y Última Predicción
            </h2>

            <div className="lg:col-span-5 rounded-lg border border-border bg-card dark:border-gray-700 dark:bg-gray-900 animate-fadein">
              <EyeScanUpload
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
