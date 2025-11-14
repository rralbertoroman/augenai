"use client";

import * as React from "react";
import { EyeScanUpload } from "@/components/diagnosis/eye-scan-upload";
import { ModelScorecard } from "@/components/diagnosis/model-scorecard";
import { RecentPredictions } from "@/components/diagnosis/recent-predictions";
import { RecentPatients } from "@/components/diagnosis/recent-patients";
import { mockModelInfo, mockPredictions, mockPatients } from "@/lib/mock-data";

export default function DiagnosisPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleScanSubmit = async (
    data: Parameters<React.ComponentProps<typeof EyeScanUpload>["onSubmit"]>[0],
  ) => {
    setIsLoading(true);

    try {
      if (!data.storagePath || !data.bucketName) {
        setIsLoading(false);
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("storage_path", data.storagePath);
      formData.append("bucket_name", data.bucketName);
      formData.append("model_id", data.modelId);
      formData.append("patient_id", data.patientId);

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

      await response.json();
    } catch (error) {
      // Error handling can be improved with toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="space-y-8">
        {/* Main Grid Section - 60/40 split for desktop, stack on mobile */}
        <section
          aria-labelledby="diagnosis-section"
          className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 lg:gap-8"
        >
          <h2 id="diagnosis-section" className="sr-only">
            Eye Diagnosis Form and Model Information
          </h2>

          {/* Left Column - Eye Scan Upload */}
          <div>
            <EyeScanUpload onSubmit={handleScanSubmit} isLoading={isLoading} />
          </div>

          {/* Right Column - Model Scorecard */}
          <div>
            <ModelScorecard modelData={mockModelInfo} />
          </div>
        </section>

        {/* Full Width Section - Tables */}
        <section aria-labelledby="history-section" className="space-y-8">
          <h2 id="history-section" className="sr-only">
            Recent Predictions and Patients History
          </h2>

          {/* Recent Predictions Table */}
          <div className="overflow-x-auto">
            <RecentPredictions predictions={mockPredictions} />
          </div>

          {/* Recent Patients Table */}
          <div className="overflow-x-auto">
            <RecentPatients patients={mockPatients} />
          </div>
        </section>
      </main>
    </>
  );
}
