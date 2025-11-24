import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionResponse } from "@/server/zod-schemas/prediction_workflow";

interface PredictionResultsProps {
  prediction: PredictionResponse;
}

export function PredictionResults({ prediction }: PredictionResultsProps) {
  const main = prediction.result.predictions[0];
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Detalles de la predicción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Enfermedad:</span>{" "}
            {main?.disease_name}
          </div>
          <div>
            <span className="font-semibold">Etapa:</span> {main?.stage_content}
          </div>
          <div>
            <span className="font-semibold">Confianza:</span>{" "}
            {(main?.confidence * 100).toFixed(1)}%
          </div>
          <div>
            <span className="font-semibold">ID de predicción:</span>{" "}
            {prediction.db_prediction_id}
          </div>
        </div>
        {prediction.error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded">
            <p className="text-sm text-destructive">{prediction.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
