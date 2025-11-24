import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/predictions/route";
import { NextRequest } from "next/server";
import * as auth from "@/server/auth";
import * as supabaseClient from "@/server/supabase/client";
import * as modelService from "@/server/services/model";
import * as predictionRequestService from "@/server/services/prediction_request";
import * as predictionService from "@/server/services/prediction";
import * as classDiseaseService from "@/server/services/prediction_class_disease";
import type { PredictionRequestDTO } from "@/server/zod-schemas/prediction_request";

import type { PredictionDTO } from "@/server/zod-schemas/prediction";

// --- Mocks Configuration ---
// --- Mocks Configuration ---
vi.mock("@/server/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/auth")>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    getTokenFromHeaders: vi.fn(),
  };
});
vi.mock("@/server/supabase/client");
vi.mock("@/server/services/model");
vi.mock("@/server/services/prediction_request");
vi.mock("@/server/services/prediction");
vi.mock("@/server/services/prediction_class_disease");

// --- Test Constants & Fixtures ---

// Auth Fixtures
const MOCK_USER: auth.AuthenticatedUser = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  role: "authenticated",
  aud: "authenticated",
  exp: 1234567890,
  iat: 1234567890,
};
const MOCK_TOKEN = "valid-token";

// Request Fixtures
const MOCK_BUCKET_NAME = "predictions";
const MOCK_PATIENT_ID = "123e4567-e89b-12d3-a456-426614174001";
const MOCK_TASK = "classification";
const MOCK_IMAGE_TYPE = "dermoscopy";
const MOCK_DISEASES = ["melanoma"];
const MOCK_STORAGE_PATH = "path/to/image.png";

// Model Service Fixtures
const MOCK_MODEL_ID = "123e4567-e89b-12d3-a456-426614174002";
const MOCK_MODEL_NAME = "diabetic-retinopathy-224-procnorm-vit";
const MOCK_SELECTED_MODELS = [{ id: MOCK_MODEL_ID, name: MOCK_MODEL_NAME }];

// Prediction Request Service Fixtures
const MOCK_PREDICTION_REQUEST: PredictionRequestDTO = {
  id: "123e4567-e89b-12d3-a456-426614174003",
  userId: MOCK_USER.userId,
  patientId: MOCK_PATIENT_ID,
  task: MOCK_TASK,
  imageType: MOCK_IMAGE_TYPE,
  diseases: MOCK_DISEASES,
  storagePath: MOCK_STORAGE_PATH,
  bucketName: MOCK_BUCKET_NAME,
  modelsUsed: [MOCK_MODEL_ID],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Prediction Service Fixtures
const MOCK_SAVED_PREDICTION: PredictionDTO = {
  id: "123e4567-e89b-12d3-a456-426614174004",
  requestId: MOCK_PREDICTION_REQUEST.id,
  modelId: MOCK_MODEL_ID,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Image Fixtures
const createMockImageBlob = () => {
  const base64Data =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: "image/png" });
};

describe("POST /api/predictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.getTokenFromHeaders).mockResolvedValue(MOCK_TOKEN);
  });

  it("should return 401 if authorization header is missing", async () => {
    vi.mocked(auth.getTokenFromHeaders).mockRejectedValue(
      new auth.AuthError("Missing or invalid authorization header", 401),
    );

    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Missing or invalid authorization header");
  });

  it("should return 400 if storage_path is missing", async () => {
    // Setup Auth Mock
    vi.mocked(auth.getCurrentUser).mockResolvedValue(MOCK_USER);

    const formData = new FormData();
    // formData.append('storage_path', 'path/to/image.jpg'); // Missing intentionally
    formData.append("bucket_name", MOCK_BUCKET_NAME);
    formData.append("patient_id", MOCK_PATIENT_ID);
    formData.append("task", MOCK_TASK);
    formData.append("image_type", MOCK_IMAGE_TYPE);
    formData.append("diseases", JSON.stringify(MOCK_DISEASES));

    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Storage path is required");
  });

  it("should process prediction successfully", async () => {
    // 1. Setup Auth Mock
    vi.mocked(auth.getCurrentUser).mockResolvedValue(MOCK_USER);

    // 2. Setup Model Selection Mock
    vi.mocked(modelService.selectOptimalModels).mockResolvedValue(
      MOCK_SELECTED_MODELS,
    );

    // 3. Setup Storage Mock (Supabase)
    const imageBlob = createMockImageBlob();
    const mockDownload = vi
      .fn()
      .mockResolvedValue({ data: imageBlob, error: null });

    const mockStorageFileApi = {
      download: mockDownload,
    };

    // @ts-expect-error - Mocking storage property for testing
    supabaseClient.supabaseAdmin.storage = {
      from: vi.fn(() => mockStorageFileApi) as unknown as (
        id: string,
      ) => ReturnType<typeof supabaseClient.supabaseAdmin.storage.from>,
    };

    // 4. Setup Prediction Request Creation Mock
    vi.mocked(
      predictionRequestService.createPredictionRequest,
    ).mockImplementation(async (_token, _data) => MOCK_PREDICTION_REQUEST);

    // NO MOCK for global.fetch - we want to hit the real service

    // 5. Setup Class Disease Lookup Mock - return different data based on classId
    vi.mocked(
      classDiseaseService.getPredictionClassDiseaseByClassIdAndModelId,
    ).mockImplementation(async ({ classId }) => {
      if (classId === 1) {
        return {
          classId: 1,
          modelId: MOCK_MODEL_ID,
          diseaseId: "disease-1",
          stageIdx: 1,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          diseaseName: "Melanoma",
          diseaseStages: ["Benign", "Malignant"],
        };
      } else if (classId === 0) {
        return {
          classId: 0,
          modelId: MOCK_MODEL_ID,
          diseaseId: "disease-1",
          stageIdx: 0,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          diseaseName: "Melanoma",
          diseaseStages: ["Benign", "Malignant"],
        };
      } else if (classId === 2) {
        return {
          classId: 2,
          modelId: MOCK_MODEL_ID,
          diseaseId: "disease-1",
          stageIdx: 2,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          diseaseName: "Melanoma",
          diseaseStages: ["Benign", "Malignant", "Advanced"],
        };
      }
      return null;
    });

    // 6. Setup Prediction Saving Mock
    vi.mocked(predictionService.createPrediction).mockResolvedValue(
      MOCK_SAVED_PREDICTION,
    );

    // Prepare Request
    const formData = new FormData();
    formData.append("storage_path", MOCK_STORAGE_PATH);
    formData.append("bucket_name", MOCK_BUCKET_NAME);
    formData.append("patient_id", MOCK_PATIENT_ID);
    formData.append("task", MOCK_TASK);
    formData.append("image_type", MOCK_IMAGE_TYPE);
    formData.append("diseases", JSON.stringify(MOCK_DISEASES));

    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
      body: formData,
    });

    // Execute
    const res = await POST(req);

    // Debugging helper
    if (res.status !== 200) {
      const errorBody = await res.json().catch(() => ({}));
      console.error("Prediction failed:", res.status, errorBody);
    }

    // Assertions
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.predictions).toHaveLength(1);
    expect(body.predictions[0].db_prediction_id).toBe(MOCK_SAVED_PREDICTION.id);

    // Check enriched predictions
    const enrichedPredictions = body.predictions[0].result.predictions;
    expect(enrichedPredictions.length).toBeGreaterThan(0);

    // Each prediction should have disease info
    enrichedPredictions.forEach(
      (pred: {
        class_id: number;
        disease_name: string;
        disease_id: string;
        stage_idx: number;
        stage_content: string;
      }) => {
        expect(pred.disease_id).toBeDefined();
        expect(pred.disease_name).toBeDefined();
        expect(pred.stage_idx).toBeGreaterThanOrEqual(0);
        expect(pred.stage_content).toBeDefined();
      },
    );
  });
});
