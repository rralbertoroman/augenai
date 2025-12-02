import type {
  ClassificationWithExtras,
  DetectionWithExtras,
  PredictionWithExtras,
} from "../../zod-schemas/prediction_workflow";

/**
 * Groups classifications and detections by prediction_id into PredictionWithExtras objects.
 * This helper is used to reconstruct predictions from flattened classification and detection lists.
 *
 * @param classifications - Array of enriched classifications with extras
 * @param detections - Array of enriched detections with extras
 * @returns Array of predictions grouped by prediction_id
 */
export const groupByPredictionId = (
  classifications: ClassificationWithExtras[],
  detections: DetectionWithExtras[],
): PredictionWithExtras[] => {
  const predictionMap = new Map<string, PredictionWithExtras>();

  // Add classifications to their predictions
  for (const classification of classifications) {
    if (!predictionMap.has(classification.prediction_id)) {
      predictionMap.set(classification.prediction_id, {
        id: classification.request_id,
        patient_id: classification.patient_id,
        prediction_id: classification.prediction_id,
        model_id: classification.model_id,
        created_at: classification.created_at,
        bucket_name: classification.bucket_name,
        storage_path: classification.storage_path,
        classifications: [],
        detections: [],
      });
    }
    predictionMap
      .get(classification.prediction_id)!
      .classifications.push(classification);
  }

  // Add detections to their predictions
  for (const detection of detections) {
    if (!predictionMap.has(detection.prediction_id)) {
      predictionMap.set(detection.prediction_id, {
        id: detection.request_id,
        patient_id: detection.patient_id,
        prediction_id: detection.prediction_id,
        model_id: detection.model_id,
        created_at: detection.created_at,
        bucket_name: detection.bucket_name,
        storage_path: detection.storage_path,
        classifications: [],
        detections: [],
      });
    }
    predictionMap.get(detection.prediction_id)!.detections.push(detection);
  }

  return Array.from(predictionMap.values());
};
