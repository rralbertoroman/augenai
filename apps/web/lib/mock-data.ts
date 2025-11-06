/**
 * Mock data for development and testing
 */

import type { ModelInfo, Prediction, Patient } from "@/types/diagnosis";

// Mock Model Information
export const mockModelInfo: ModelInfo = {
  name: "DiabeticRetinopathyClassifier",
  tasks: ["image-classification"],
  diseases: [
    {
      name: "Diabetic Retinopathy",
      stages: ["DR", "No DR", "Mild", "Moderate", "Severe", "Proliferative DR"],
    },
    {
      name: "Age-Related Macular Degeneration",
      stages: ["AMD", "No AMD"],
    },
  ],
  acceptedImageTypes: ["OCT", "fundus"],
  latestTraining: new Date("2024-03-15"),
  accuracy: 87.5,
  description:
    "Advanced AI model for detecting diabetic retinopathy and age-related macular degeneration",
};

// Mock Recent Predictions
export const mockPredictions: Prediction[] = [
  {
    id: "1",
    diagnosis: "Moderate Diabetic Retinopathy",
    model: "DiabeticRetinopathyClassifier",
    consultationDate: new Date("2024-11-01"),
  },
  {
    id: "2",
    diagnosis: "No DR",
    model: "DiabeticRetinopathyClassifier",
    consultationDate: new Date("2024-10-28"),
  },
  {
    id: "3",
    diagnosis: "Mild AMD",
    model: "DiabeticRetinopathyClassifier",
    consultationDate: new Date("2024-10-25"),
  },
];

// Mock Recent Patients
export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    age: 65,
    gender: "Male",
    disease: "Diabetic Retinopathy",
    stage: "Moderate",
    clinicalConditions: "Type 2 Diabetes, Hypertension",
  },
  {
    id: "2",
    name: "Jane Doe",
    age: 58,
    gender: "Female",
    disease: "Age-Related Macular Degeneration",
    stage: "Early",
    clinicalConditions: "Hypertension, High Cholesterol",
  },
  {
    id: "3",
    name: "Robert Smith",
    age: 72,
    gender: "Male",
    disease: "Diabetic Retinopathy",
    stage: "Severe",
    clinicalConditions: "Type 1 Diabetes, Cardiovascular Disease",
  },
];
