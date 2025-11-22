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
import type { PredictionClassDiseaseDTO } from "@/server/zod-schemas/prediction_class_disease";
import type { PredictionDTO } from "@/server/zod-schemas/prediction";

// --- Mocks Configuration ---
vi.mock("@/server/auth");
vi.mock("@/server/supabase/client");
vi.mock("@/server/services/model");
vi.mock("@/server/services/prediction_request");
vi.mock("@/server/services/prediction");
vi.mock("@/server/services/prediction_class_disease");

// --- Test Constants & Fixtures ---

// Auth Fixtures
const MOCK_USER: auth.AuthenticatedUser = {
  userId: "user-123",
  email: "test@example.com",
  role: "authenticated",
  aud: "authenticated",
  exp: 1234567890,
  iat: 1234567890,
};
const MOCK_TOKEN = "valid-token";

// Request Fixtures
const MOCK_BUCKET_NAME = "predictions";
const MOCK_PATIENT_ID = "patient-123";
const MOCK_TASK = "classification";
const MOCK_IMAGE_TYPE = "dermoscopy";
const MOCK_DISEASES = ["melanoma"];
const MOCK_STORAGE_PATH = "path/to/image.png";

// Model Service Fixtures
const MOCK_SELECTED_MODELS = ["diabetic-retinopathy-224-procnorm-vit"];

// Prediction Request Service Fixtures
const MOCK_PREDICTION_REQUEST: PredictionRequestDTO = {
  id: "req-123",
  userId: MOCK_USER.userId,
  patientId: MOCK_PATIENT_ID,
  task: MOCK_TASK,
  imageType: MOCK_IMAGE_TYPE,
  diseases: MOCK_DISEASES,
  storagePath: MOCK_STORAGE_PATH,
  bucketName: MOCK_BUCKET_NAME,
  modelsUsed: MOCK_SELECTED_MODELS,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Class Disease Service Fixtures
const MOCK_CLASS_DISEASE: PredictionClassDiseaseDTO = {
  id: "class-disease-1",
  classId: 1,
  modelId: "model-1",
  diseaseId: "disease-1",
  stageIdx: 0,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Prediction Service Fixtures
const MOCK_SAVED_PREDICTION: PredictionDTO = {
  id: "pred-123",
  requestId: MOCK_PREDICTION_REQUEST.id,
  modelId: "model-1",
  predictionResult: {
    classId: "class-1",
    confidence: 0.95,
  },
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
  });

  it("should return 401 if authorization header is missing", async () => {
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
        id: string
      ) => ReturnType<typeof supabaseClient.supabaseAdmin.storage.from>,
    };

    // 4. Setup Prediction Request Creation Mock
    vi.mocked(
      predictionRequestService.createPredictionRequest,
    ).mockResolvedValue(MOCK_PREDICTION_REQUEST);

    // NO MOCK for global.fetch - we want to hit the real service

    // 5. Setup Class Disease Lookup Mock
    vi.mocked(
      classDiseaseService.getPredictionClassDiseaseByClassIdAndModelId,
    ).mockResolvedValue(MOCK_CLASS_DISEASE);

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
  });
});
