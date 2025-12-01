import { describe, it, expect, vi, beforeEach } from "vitest";
import { processPredictionRequest } from "@/server/services/prediction_workflow";
import * as modelService from "@/server/services/model";
import * as predictionRequestService from "@/server/services/prediction_request";
import * as predictionService from "@/server/services/prediction";
import * as classDiseaseService from "@/server/services/prediction_class_disease";
import * as classLesionService from "@/server/services/prediction_class_lesion";
import * as classificationService from "@/server/services/classification";
import * as detectionService from "@/server/services/detection";
import * as predictionSharingService from "@/server/services/prediction_sharing";
import { supabaseAdmin } from "@/server/supabase/client";
import { PredictionWorkflowInput } from "@/server/zod-schemas/prediction_workflow";
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
vi.mock("@/server/services/prediction_sharing");
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
    expect(result.predictions[0].status).toBe("success");
    expect(result.predictions[0].result.classifications).toBeDefined();
    expect(result.predictions[0].result.classifications?.[0].disease_name).toBe(
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
    expect(result.predictions[0].result.detections).toBeDefined();
    expect(result.predictions[0].result.detections?.[0].lesion_name).toBe(
      "Nevus",
    );
    expect(result.predictions[0].result.detections?.[0].bbox).toEqual({
      x_left: 10,
      y_top: 10,
      width: 50,
      height: 50,
    });

    expect(detectionService.createDetections).toHaveBeenCalled();
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
