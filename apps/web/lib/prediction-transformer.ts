import type {
  PredictionWithExtras,
  TaskWithExtras,
  ClassificationWithExtras,
  DetectionWithExtras,
} from "@/server/zod-schemas/prediction_workflow";

/**
 * Flattens hierarchical prediction data into a flat array of tasks
 * @param predictions - Array of predictions with nested classifications and detections
 * @returns Flattened array of TaskWithExtras
 */
export function flattenPredictions(
  predictions: PredictionWithExtras[],
): TaskWithExtras[] {
  return predictions.flatMap((pred) => {
    const results: TaskWithExtras[] = [];

    // Process Classifications
    pred.classifications.forEach((c: ClassificationWithExtras) => {
      results.push({
        ...c,
        created_at: pred.created_at,
        request_id: pred.id!,
        patient_id: pred.patient_id!,
        bucket_name: pred.bucket_name,
        storage_path: pred.storage_path,
      });
    });

    // Process Detections
    pred.detections.forEach((d: DetectionWithExtras) => {
      results.push({
        ...d,
        created_at: pred.created_at,
        request_id: pred.id!,
        patient_id: pred.patient_id!,
        bucket_name: pred.bucket_name,
        storage_path: pred.storage_path,
      });
    });

    return results;
  });
}

/**
 * Type guard to check if a task is a classification
 */
export function isClassification(
  task: TaskWithExtras,
): task is ClassificationWithExtras {
  return "disease_name" in task && "disease_id" in task;
}

/**
 * Type guard to check if a task is a detection
 */
export function isDetection(task: TaskWithExtras): task is DetectionWithExtras {
  return "lesion_name" in task && "bbox" in task;
}
