export interface Disease {
  name: string;
  stages: string[];
}

export interface Diagnosis {
  disease: Disease;
  currentStage: string;
}

export interface Model {
  modelName: string;
  modelTasks: string[];
  diseases: Disease[];
  acceptedImageTypes: string[];
  latestTraining: string;
  accuracy: number;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  diagnosis: Diagnosis;
  clinicalConditions: string[];
}

export interface Prediction {
  id: string;
  model: Model;
  patient: Patient;
  predictedDiagnosis: Diagnosis;
  consultationDate: string;
}