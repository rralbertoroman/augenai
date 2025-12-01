// Disease schemas
export { type DiseaseDTO } from "./disease";

// Model schemas
export {
  SelectOptimalModelsSchema,
  OptimalModelSchema,
  SelectOptimalModelsResponseSchema,
  type SelectOptimalModelsInput,
  type OptimalModel,
  type SelectOptimalModelsResponse,
} from "./model";

// Patient schemas
export {
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientDTOSchema,
  type CreatePatientInput,
  type UpdatePatientInput,
  type PatientDTO,
} from "./patient";

// Prediction Class Disease schemas
export {
  PredictionClassDiseaseDTOSchema,
  GetByClassIdAndModelIdSchema,
  type PredictionClassDiseaseDTO,
  type GetByClassIdAndModelIdInput,
} from "./prediction_class_disease";

// Prediction Class Lesion schemas
export {
  PredictionClassLesionDTOSchema,
  GetByClassIdAndModelIdSchema as GetByClassIdAndModelIdLesionSchema,
  GetByLesionAndModelSchema,
  type PredictionClassLesionDTO,
  type GetByClassIdAndModelIdInput as GetByClassIdAndModelIdLesionInput,
  type GetByLesionAndModelInput,
  type PredictionClassLesionWithLesion,
} from "./prediction_class_lesion";

// User Profile schemas
export {
  CreateUserProfileSchema,
  UpdateUserProfileSchema,
  DeleteUserProfileSchema,
  UserProfileDTOSchema,
  GetUserProfileByEmailSchema,
  type CreateUserProfileInput,
  type UpdateUserProfileInput,
  type DeleteUserProfileInput,
  type UserProfileDTO,
  type GetUserProfileByEmailInput,
} from "./user_profile";

// Feedback schemas
export {
  CreateClassificationFeedbackSchema,
  ClassificationFeedbackDTOSchema,
  type CreateClassificationFeedbackInput,
  type ClassificationFeedbackDTO,
} from "./classification_feedback";

// Classification schemas
export {
  CreateClassificationSchema,
  ClassificationSchema,
  type CreateClassificationInput,
  type ClassificationDTO,
} from "./classification";

// Detection schemas
export {
  CreateDetectionSchema,
  DetectionSchema,
  type CreateDetectionInput,
  type DetectionDTO,
} from "./detection";

// Detection Feedback schemas
export {
  CreateDetectionFeedbackSchema,
  DetectionFeedbackDTOSchema,
  type CreateDetectionFeedbackInput,
  type DetectionFeedbackDTO,
} from "./detection_feedback";

// Prediction Workflow schemas
export {
  PredictionWorkflowInputSchema,
  EnrichedClassificationSchema,
  EnrichedClassificationWithExtrasSchema,
  EnrichedDetectionSchema,
  EnrichedDetectionWithExtrasSchema,
  EnrichedPredictionDTOSchema,
  EnrichedPredictionRequestDTOSchema,
  type PredictionWorkflowInput,
  type EnrichedClassification,
  type EnrichedClassificationWithExtras,
  type EnrichedDetection,
  type EnrichedDetectionWithExtras,
  type EnrichedPredictionDTO,
  type EnrichedPredictionRequestDTO,
  type EnrichedTask,
  type EnrichedTaskWithExtras,
} from "./prediction_workflow";

// AI Service schemas
export {
  AIServiceClassificationSchema,
  AIServiceDetectionSchema,
  AIServicePredictionResponseSchema,
  type AIServiceClassification,
  type AIServiceDetection,
  type AIServicePredictionResponse,
} from "./ai_service";

// Prediction Request schemas
export {
  CreatePredictionRequestSchema,
  PredictionRequestDTOSchema,
  type CreatePredictionRequestInput,
  type PredictionRequestDTO,
} from "./prediction_request";

// Prediction Sharing schemas
export {
  CreatePredictionSharingSchema,
  PredictionSharingDTOSchema,
  type CreatePredictionSharingInput,
  type PredictionSharingDTO,
} from "./prediction_sharing";

// Prediction schemas
export { CreatePredictionSchema, PredictionDTOSchema } from "./prediction";
