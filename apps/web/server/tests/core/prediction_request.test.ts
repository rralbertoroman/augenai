import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPredictionRequestById,
  getAllPredictionRequestsWithPredictionsByUserId,
} from "@/server/services/prediction_request";
import * as auth from "@/server/auth";
import * as classDiseaseService from "@/server/services/prediction_class_disease";
import * as classLesionService from "@/server/services/prediction_class_lesion";
import { PredictionClassDiseaseWithDisease } from "@/server/zod-schemas/prediction_class_disease";
import { PredictionClassLesionWithLesion } from "@/server/zod-schemas/prediction_class_lesion";
import { AuthenticatedUser } from "@/server/auth";

// Mock DB
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/server/db/client", () => ({
  db: {
    query: {
      PredictionRequestsTable: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

vi.mock("@/server/auth");
vi.mock("@/server/services/prediction_class_disease");
vi.mock("@/server/services/prediction_class_lesion");

const MOCK_USER: AuthenticatedUser = {
  userId: "user-123",
  role: "authenticated",
  email: "test@example.com",
  aud: "authenticated",
  exp: 1234567890,
  iat: 1234567890,
};
const MOCK_TOKEN = "token-123";

describe("Prediction Request Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.getCurrentUser).mockResolvedValue(MOCK_USER);
    vi.mocked(auth.verifyOwnership).mockImplementation(() => {});
  });

  describe("getPredictionRequestById", () => {
    it("should return enriched prediction request", async () => {
      const mockRequest = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "user-123",
        patientId: "patient-1",
        bucketName: "bucket",
        storagePath: "path",
        patient: { dateOfBirth: "2000-01-01" },
        predictions: [
          {
            id: "pred-1",
            modelId: "model-1",
            classifications: [
              { id: "c-1", classId: 0, confidence: 0.9, createdAt: new Date() },
            ],
            detections: [],
          },
        ],
      };

      mockFindFirst.mockResolvedValue(mockRequest);

      vi.mocked(
        classDiseaseService.getPredictionClassDiseaseByClassIdAndModelId,
      ).mockResolvedValue({
        id: "d-1",
        classId: 0,
        modelId: "model-1",
        diseaseId: "d-1",
        diseaseName: "Disease A",
        stageIdx: 0,
        diseaseStages: ["Stage 1"],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PredictionClassDiseaseWithDisease);

      const result = await getPredictionRequestById(MOCK_TOKEN, {
        id: "123e4567-e89b-12d3-a456-426614174000",
      });

      expect(result).toBeDefined();
      expect(result?.predictions).toHaveLength(1);
      expect(result?.predictions[0].classifications[0].disease_name).toBe(
        "Disease A",
      );
    });

    it("should return null if request not found", async () => {
      mockFindFirst.mockResolvedValue(null);
      const result = await getPredictionRequestById(MOCK_TOKEN, {
        id: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result).toBeNull();
    });
  });

  describe("getAllPredictionRequestsWithPredictionsByUserId", () => {
    it("should return enriched predictions for all requests", async () => {
      const mockRequests = [
        {
          id: "req-1",
          userId: "user-123",
          patientId: "patient-1",
          bucketName: "bucket",
          storagePath: "path",
          patient: { dateOfBirth: "2000-01-01" },
          predictions: [
            {
              id: "pred-1",
              modelId: "model-1",
              classifications: [],
              detections: [
                {
                  id: "d-1",
                  classId: 1,
                  confidence: 0.8,
                  xLeft: 10,
                  yTop: 10,
                  width: 50,
                  height: 50,
                  createdAt: new Date(),
                },
              ],
            },
          ],
        },
      ];

      mockFindMany.mockResolvedValue(mockRequests);

      vi.mocked(
        classLesionService.getPredictionClassLesionByClassIdAndModelId,
      ).mockResolvedValue({
        classId: 1,
        modelId: "model-1",
        lesionId: "l-1",
        lesionName: "Lesion B",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PredictionClassLesionWithLesion);

      const result = await getAllPredictionRequestsWithPredictionsByUserId(
        MOCK_TOKEN,
        "user-123",
      );

      expect(result).toHaveLength(1);
      expect(result[0].predictions[0].detections[0].lesion_name).toBe(
        "Lesion B",
      );
      expect(result[0].predictions[0].detections[0].bbox).toBeDefined();
    });
  });
});
