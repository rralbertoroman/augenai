"use client";

import { EyeScanUpload } from "./eye-scan-upload";
import { useDiagnosisPage } from "@/hooks/use-diagnosis-page";

export function DiagnosisContainer() {
  const {
    isLoading: isSubmitting,
    error: submitError,
    handleScanSubmit,
  } = useDiagnosisPage();

  return (
    <>
      <main className="flex-1 flex-col">
        <div className="flex-1 p-6">
          <section
            aria-labelledby="diagnosis-section"
            className="grid grid-cols-1 gap-6 lg:grid-cols-5"
          >
            <h2 id="diagnosis-section" className="sr-only">
              Eye Diagnosis Form and Latest Prediction
            </h2>

            <div className="lg:col-span-5 rounded-lg border border-border bg-card dark:border-gray-700 dark:bg-gray-900 animate-fadein">
              <EyeScanUpload
                onSubmit={handleScanSubmit}
                isLoading={isSubmitting}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
