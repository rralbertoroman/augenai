export enum PredictionStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface AIServicePredictionResponse {
  status: PredictionStatus;
  result?: Record<string, unknown>;
  error?: string;
  request_id: string;
}

export interface PredictionResponse extends AIServicePredictionResponse {
  db_prediction_id: string;
  disease_id: string;
  stage_idx: number;
}

export interface CreatePredictionRequest {
  image: File | Blob;
  model_id: string;
  patient_id: string;
  user_id: string;
}
