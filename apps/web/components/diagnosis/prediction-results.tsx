import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionResponse } from "@/types/prediction";
import { usePredictionResults } from "@/hooks/use-prediction-results";
import { FixedParameters } from "./prediction-results/fixed-parameters";
import { MetadataTable } from "./prediction-results/metadata-table";
import { PredictionsTable } from "./prediction-results/predictions-table";

interface PredictionResultsProps {
  prediction: PredictionResponse;
}

export function PredictionResults({ prediction }: PredictionResultsProps) {
  const {
    topPrediction,
    sortedPredictions,
    metadataEntries,
    formatKey,
    getConfidenceBadge,
  } = usePredictionResults(prediction);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Detalles de la predicción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FixedParameters
          diseaseId={prediction.result.predictions[0]?.disease_id}
          stageIdx={prediction.result.predictions[0]?.stage_idx}
          topPrediction={topPrediction}
          status={prediction.status}
          predictionId={prediction.db_prediction_id}
          getConfidenceBadge={getConfidenceBadge}
        />

        <MetadataTable entries={metadataEntries} formatKey={formatKey} />

        <PredictionsTable predictions={sortedPredictions} />

        {prediction.error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded">
            <p className="text-sm text-destructive">{prediction.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
