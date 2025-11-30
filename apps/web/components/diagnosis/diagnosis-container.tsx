"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeScanUpload } from "./eye-scan-upload";
import { translateErrorMessage } from "@/lib/error-translator";
import { ScanData } from "./eye-scan-upload";
export function DiagnosisContainer() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: ScanData) => {
    setIsSubmitting(true);

    try {
      if (!data.storagePath || !data.bucketName) {
        throw new Error(
          translateErrorMessage("Imagen no cargada correctamente"),
        );
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(translateErrorMessage("No autenticado"));
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
      const requestId = result.request_id || result.requestId;

      if (requestId) {
        // Redirect to the request detail page after prediction completes
        router.push(`/diagnosis/${requestId}`);
      }
    } catch (err) {
      // Keep UX simple: console + toast could be added later
      console.error("Error submitting diagnosis:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1 flex-col">
        <div className="flex-1 p-6">
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
