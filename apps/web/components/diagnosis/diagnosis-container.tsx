"use client";

import { EyeScanUpload } from "./eye-scan-upload";
import { LatestPredictionCard } from "./latest-prediction-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDiagnosisPage } from "@/hooks/use-diagnosis-page";
import { usePredictions } from "@/hooks/use-predictions";
import { PredictionDetail } from "@/components/predictions/prediction-detail";

export function DiagnosisContainer() {
  const {
    isLoading: isSubmitting,
    error: submitError,
    showResultsModal,
    setShowResultsModal,
    handleScanSubmit,
  } = useDiagnosisPage();

  const { predictions, error: predictionsError } = usePredictions();
  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

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

            <div className="lg:col-span-3 rounded-lg border border-border bg-card dark:border-gray-700 dark:bg-gray-900 animate-fadein">
              <EyeScanUpload
                onSubmit={handleScanSubmit}
                isLoading={isSubmitting}
              />
            </div>

            <div className="space-y-4 lg:col-span-2">
              {latestPrediction ? (
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <LatestPredictionCard prediction={latestPrediction} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-16 h-16 text-primary"
                      >
                        <path d="M10 2a8 8 0 0 1 6.32 12.906l4.387 4.387a1 1 0 0 1-1.414 1.414l-4.387-4.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Sin predicciones aún
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Completa el formulario de diagnóstico para generar tu
                      primera predicción. Los resultados aparecerán aquí.
                    </p>
                  </CardContent>
                </Card>
              )}
              {submitError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}
              {predictionsError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded">
                  <p className="text-sm text-destructive">{predictionsError}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                🎉 ¡Predicción completada!
              </DialogTitle>
            </DialogHeader>
            {latestPrediction && (
              <PredictionDetail prediction={latestPrediction} />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
