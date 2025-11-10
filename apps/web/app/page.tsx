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

    // Simulate API call
    console.log("Scan data submitted:", data);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);

    // Show success message (temporary)
    alert("Scan submitted successfully!");
  };

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <main id="main-content" className="space-y-8">
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
