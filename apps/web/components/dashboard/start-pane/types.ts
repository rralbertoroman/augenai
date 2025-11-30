export type Prediction = {
  id: string;
  request_id: string;
  patient_id: string;
  patient_name: string;
  disease_name: string;
  stage_content: string;
  confidence: number;
  createdAt: string | Date;
  bucket_name: string;
  storage_path: string;
  patient_birthdate: string;
  feedback_status: string;
  feedbacks?: Array<{ isMainData: boolean }>;
  isMainData: boolean;
  class_id: number;
  model_id: string;
  bbox: {
    label?: string;
    x_left: number;
    y_top: number;
    width: number;
    height: number;
  };
  type: string;
};

export type PredictionGroup = {
  requestId: string;
  patientId: string;
  requestDate: Date;
  patientName: string;
  predictions: Prediction[];
  bucket_name: string;
  storage_path: string;
};

export type PatientInfo = {
  id: string;
  name: string;
  age: number;
  // Add other patient fields as needed
};
