import type { PredictionResponse } from "@/types/prediction";

export function usePredictionResults(prediction: PredictionResponse) {
  const topPrediction = prediction.result?.predictions?.reduce(
    (max, pred) => (pred.confidence > max.confidence ? pred : max),
    prediction.result.predictions[0],
  );

  const sortedPredictions = prediction.result?.predictions
    ? [...prediction.result.predictions].sort(
        (a, b) => b.confidence - a.confidence,
      )
    : [];

  const metadataEntries = prediction.result?.metadata
    ? Object.entries(prediction.result.metadata)
    : [];

  const formatKey = (key: string) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 0.8) return { variant: "default" as const, label: "High" };
    if (confidence > 0.5)
      return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  return {
    topPrediction,
    sortedPredictions,
    metadataEntries,
    formatKey,
    getConfidenceBadge,
  };
}
