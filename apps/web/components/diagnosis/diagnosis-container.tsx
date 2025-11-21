"use client";

import { EyeScanUpload } from "./eye-scan-upload";
import { PredictionResults } from "./prediction-results";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDiagnosisPage } from "@/hooks/use-diagnosis-page";

export function DiagnosisContainer() {
  const {
    isLoading,
    latestPrediction,
    error,
    showResultsModal,
    setShowResultsModal,
    handleScanSubmit,
  } = useDiagnosisPage();

  return (
    <>
      <main className="space-y-8">
        <section
          aria-labelledby="diagnosis-section"
          className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 lg:gap-8"
        >
          <h2 id="diagnosis-section" className="sr-only">
            Eye Diagnosis Form and Latest Prediction
          </h2>

          <div>
            <EyeScanUpload onSubmit={handleScanSubmit} isLoading={isLoading} />
          </div>

          <div className="space-y-4">
            {latestPrediction && latestPrediction.predictions.length > 0 ? (
              <PredictionResults prediction={latestPrediction.predictions[0]} />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4">🔬</div>
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
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </section>

        <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                🎉 ¡Predicción completada!
              </DialogTitle>
            </DialogHeader>
            {latestPrediction && latestPrediction.predictions.length > 0 && (
              <PredictionResults prediction={latestPrediction.predictions[0]} />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
