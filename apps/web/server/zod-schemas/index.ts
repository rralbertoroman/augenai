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

// Prediction Class Disease schemas
export {
  CreatePredictionClassDiseaseSchema,
  UpdatePredictionClassDiseaseSchema,
  DeletePredictionClassDiseaseSchema,
  PredictionClassDiseaseDTOSchema,
  GetByClassIdAndModelIdSchema,
  type CreatePredictionClassDiseaseInput,
  type UpdatePredictionClassDiseaseInput,
  type DeletePredictionClassDiseaseInput,
  type PredictionClassDiseaseDTO,
  type GetByClassIdAndModelIdInput,
} from "./prediction_class_disease";

// User Profile schemas
export {
  CreateUserProfileSchema,
  UpdateUserProfileSchema,
  DeleteUserProfileSchema,
  UserProfileDTOSchema,
  GetUserProfileByEmailSchema,
  GetUserProfilesByRoleSchema,
  type CreateUserProfileInput,
  type UpdateUserProfileInput,
  type DeleteUserProfileInput,
  type UserProfileDTO,
  type GetUserProfileByEmailInput,
  type GetUserProfilesByRoleInput,
} from "./user_profile";
