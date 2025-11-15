export enum PredictionStatus {
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * Metadata from AI service prediction
 */
export interface PredictionMetadata {
  inference_time_ms: number;
  model_version: string;
}

/**
 * Single classification object
 */
export interface ClassificationObject {
  class_id: number;
  class_name: string;
  confidence: number;
}

/**
 * Classification result from AI service
 */
export interface ClassificationResult {
  predictions: ClassificationObject[];
  metadata: PredictionMetadata;
}

/**
 * Response from FastAPI prediction service
 */
export interface AIServicePredictionResponse {
  status: PredictionStatus;
  error?: string;
  result: ClassificationResult;
}

/**
 * Single prediction response enriched with database info
 */
export interface PredictionResponse extends AIServicePredictionResponse {
  db_prediction_id: string;
  disease_id: string;
  stage_idx: number;
}

/**
 * Final response from Next.js API to frontend
 * Contains multiple predictions (one per model used)
 */
export interface MultiplePredictionsResponse {
  predictions: PredictionResponse[];
  models_used: string[];
}

export interface CreatePredictionRequest {
  storage_path: string;
  bucket_name: string;
  model_id: string;
  patient_id: string;
  user_id: string;
}
