// Disease schemas
export {
  CreateDiseaseSchema,
  UpdateDiseaseSchema,
  DeleteDiseaseSchema,
  DiseaseDTOSchema,
  type CreateDiseaseInput,
  type UpdateDiseaseInput,
  type DeleteDiseaseInput,
  type DiseaseDTO,
} from "./disease";

// Diagnosis schemas
export {
  CreateDiagnosisSchema,
  UpdateDiagnosisSchema,
  DeleteDiagnosisSchema,
  DiagnosisDTOSchema,
  type CreateDiagnosisInput,
  type UpdateDiagnosisInput,
  type DeleteDiagnosisInput,
  type DiagnosisDTO,
} from "./diagnosis";

// Model schemas
export {
  CreateModelSchema,
  UpdateModelSchema,
  DeleteModelSchema,
  ModelDTOSchema,
  type CreateModelInput,
  type UpdateModelInput,
  type DeleteModelInput,
  type ModelDTO,
} from "./model";

// Patient schemas
export {
  CreatePatientSchema,
  UpdatePatientSchema,
  DeletePatientSchema,
  PatientDTOSchema,
  type CreatePatientInput,
  type UpdatePatientInput,
  type DeletePatientInput,
  type PatientDTO,
} from "./patient";

// Prediction schemas
export {
  CreatePredictionSchema,
  UpdatePredictionSchema,
  DeletePredictionSchema,
  PredictionDTOSchema,
  GetPredictionsByPatientSchema,
  GetPredictionsByModelSchema,
  type CreatePredictionInput,
  type UpdatePredictionInput,
  type DeletePredictionInput,
  type PredictionDTO,
  type GetPredictionsByPatientInput,
  type GetPredictionsByModelInput,
} from "./prediction";
