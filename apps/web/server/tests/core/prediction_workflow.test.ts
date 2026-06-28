import { describe, it, expect, vi, beforeEach } from "vitest";
import { processPredictionRequest } from "@/server/services/prediction_workflow";
import * as modelService from "@/server/services/model";
import * as predictionRequestService from "@/server/services/prediction_request";
import * as predictionService from "@/server/services/prediction";
import * as classDiseaseService from "@/server/services/prediction_class_disease";
import * as classLesionService from "@/server/services/prediction_class_lesion";
import * as classificationService from "@/server/services/classification";
import * as detectionService from "@/server/services/detection";
import * as segmentationService from "@/server/services/segmentation";
import * as predictionSharingService from "@/server/services/prediction_sharing";
import * as patientService from "@/server/services/patient";
import { supabaseAdmin } from "@/server/supabase/client";
import { PredictionWorkflowInput } from "@/server/zod-schemas/prediction_workflow";
import { AIServiceSegmentationSchema } from "@/server/zod-schemas/ai_service";
import { OptimalModel } from "@/server/zod-schemas/model";
import { PredictionRequestDTO } from "@/server/zod-schemas/prediction_request";
import { PredictionDTO } from "@/server/zod-schemas/prediction";
import { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";
import { PredictionClassLesionWithLesion } from "@/server/zod-schemas/prediction_class_lesion";

// Mocks
vi.mock("@/server/services/model");
vi.mock("@/server/services/prediction_request");
vi.mock("@/server/services/prediction");
vi.mock("@/server/services/prediction_class_disease");
vi.mock("@/server/services/prediction_class_lesion");
vi.mock("@/server/services/classification");
vi.mock("@/server/services/detection");
vi.mock("@/server/services/segmentation");
vi.mock("@/server/services/prediction_sharing");
vi.mock("@/server/services/patient");
vi.mock("@/server/supabase/client", () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        download: vi.fn(),
      })),
    },
  },
}));

// Constants
const MOCK_TOKEN = "test-token";
const MOCK_INPUT: PredictionWorkflowInput = {
  token: MOCK_TOKEN,
  storagePath: "test/image.jpg",
  bucketName: "predictions",
  patientId: "123e4567-e89b-12d3-a456-426614174000",
  task: "classification",
  imageType: "dermoscopy",
  diseases: ["melanoma"],
};

const MOCK_MODEL: OptimalModel = {
  id: "model-123",
  name: "test-model",
};

const MOCK_IMAGE_BLOB = new Blob(["test"], { type: "image/jpeg" });

describe("Prediction Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(modelService.selectOptimalModels).mockResolvedValue([MOCK_MODEL]);

    const mockDownload = vi
      .fn()
      .mockResolvedValue({ data: MOCK_IMAGE_BLOB, error: null });
    // @ts-expect-error - Mocking supabase storage chain
    vi.mocked(supabaseAdmin.storage.from).mockReturnValue({
      download: mockDownload,
    });

    vi.mocked(
      predictionRequestService.createPredictionRequest,
    ).mockResolvedValue({
      id: "req-123",
      ...MOCK_INPUT,
      userId: "user-123",
      modelsUsed: [MOCK_MODEL.id],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PredictionRequestDTO);

    vi.mocked(predictionService.createPrediction).mockResolvedValue({
      id: "pred-123",
      requestId: "req-123",
      modelId: MOCK_MODEL.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PredictionDTO);

    vi.mocked(patientService.getPatientById).mockResolvedValue({
      id: "patient-123",
      name: "Test Patient",
      dateOfBirth: "2000-01-01",
      gender: "male",
      clinicalConditions: [],
      doctorId: "doctor-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    global.fetch = vi.fn();
  });

  it("should process classification workflow successfully", async () => {
    // Setup specific mocks for classification
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        result: {
          predictions: [{ class_id: 0, confidence: 0.95 }],
          metadata: { inference_time_ms: 100, model_version: "v1" },
        },
      }),
    } as Response);

    vi.mocked(
      classDiseaseService.getPredictionClassDiseaseByClassIdAndModelId,
    ).mockResolvedValue({
      id: "map-1",
      classId: 0,
      modelId: MOCK_MODEL.id,
      diseaseId: "disease-1",
      diseaseName: "Melanoma",
      stageIdx: 0,
      diseaseStages: ["Benign", "Malignant"],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PredictionClassDiseaseWithDisease);

    const result = await processPredictionRequest(MOCK_INPUT);

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].prediction_id).toBe("pred-123");
    expect(result.predictions[0].model_id).toBe(MOCK_MODEL.id);
    expect(result.predictions[0].classifications).toHaveLength(1);
    expect(result.predictions[0].classifications[0].disease_name).toBe(
      "Melanoma",
    );

    expect(modelService.selectOptimalModels).toHaveBeenCalledWith(
      MOCK_INPUT.task,
      MOCK_INPUT.imageType,
      MOCK_INPUT.diseases,
    );
    expect(supabaseAdmin.storage.from).toHaveBeenCalledWith(
      MOCK_INPUT.bucketName,
    );
    expect(predictionRequestService.createPredictionRequest).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();
    expect(classificationService.createClassifications).toHaveBeenCalled();
    expect(
      predictionSharingService.sendPredictionToSupervisor,
    ).toHaveBeenCalled();
  });

  it("should process detection workflow successfully", async () => {
    const detectionInput = { ...MOCK_INPUT, task: "detection" };
    const detectionModel = { ...MOCK_MODEL, task: "detection" };

    vi.mocked(modelService.selectOptimalModels).mockResolvedValue([
      detectionModel,
    ]);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        result: {
          predictions: [
            { class_id: 1, confidence: 0.8, box: [10, 10, 50, 50] },
          ],
          metadata: { inference_time_ms: 100, model_version: "v1" },
        },
      }),
    } as Response);

    vi.mocked(
      classLesionService.getPredictionClassLesionByClassIdAndModelId,
    ).mockResolvedValue({
      classId: 1,
      modelId: detectionModel.id,
      lesionId: "lesion-123",
      lesionName: "Nevus",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PredictionClassLesionWithLesion);

    const result = await processPredictionRequest(detectionInput);

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].detections).toHaveLength(1);
    expect(result.predictions[0].detections[0].lesion_name).toBe("Nevus");
    expect(result.predictions[0].detections[0].bbox).toEqual({
      x_left: 10,
      y_top: 10,
      width: 50,
      height: 50,
    });

    expect(detectionService.createDetections).toHaveBeenCalled();
  });

  it("should process segmentation workflow successfully", async () => {
    const segmentationInput = { ...MOCK_INPUT, task: "segmentation" };
    const segmentationModel = { ...MOCK_MODEL, task: "segmentation" };

    vi.mocked(modelService.selectOptimalModels).mockResolvedValue([
      segmentationModel,
    ]);

    const samplePayload = {
      class_id: 1,
      class_name: "class_1",
      polygon: [
        [10, 10],
        [50, 10],
        [50, 50],
        [10, 50],
      ],
      area: 1600,
      confidence: 0.9,
    };

    // zod round-trip: the AI service segmentation schema parses the payload.
    expect(() =>
      AIServiceSegmentationSchema.parse(samplePayload),
    ).not.toThrow();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        result: {
          predictions: [samplePayload],
          metadata: { inference_time_ms: 100, model_version: "v1" },
        },
      }),
    } as Response);

    const result = await processPredictionRequest(segmentationInput);

    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0].segmentations).toHaveLength(1);
    expect(result.predictions[0].segmentations[0].class_id).toBe(1);
    expect(result.predictions[0].segmentations[0].class_name).toBe("class_1");
    expect(result.predictions[0].segmentations[0].polygon).toEqual(
      samplePayload.polygon,
    );
    expect(result.predictions[0].segmentations[0].area).toBe(1600);
    expect(result.predictions[0].segmentations[0].confidence).toBe(0.9);

    expect(segmentationService.createSegmentations).toHaveBeenCalled();
  });

  it("should throw error if no models found", async () => {
    vi.mocked(modelService.selectOptimalModels).mockResolvedValue([]);

    await expect(processPredictionRequest(MOCK_INPUT)).rejects.toThrow(
      "No suitable models found",
    );
  });

  it("should throw error if image download fails", async () => {
    const mockDownload = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Download failed" } });
    // @ts-expect-error - Mocking supabase storage chain
    vi.mocked(supabaseAdmin.storage.from).mockReturnValue({
      download: mockDownload,
    });

    await expect(processPredictionRequest(MOCK_INPUT)).rejects.toThrow(
      "Failed to download image",
    );
  });

  it("should handle AI service error gracefully", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal Server Error" }),
    } as Response);

    // The workflow throws if ALL models fail
    await expect(processPredictionRequest(MOCK_INPUT)).rejects.toThrow(
      "All model predictions failed",
    );
  });
});
