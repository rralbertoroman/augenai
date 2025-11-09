import { NextRequest, NextResponse } from "next/server";
import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
} from "@/server/constants";
import type {
  AIServicePredictionResponse,
  PredictionResponse,
} from "@/types/prediction";
import { createPrediction } from "@/server/services/prediction";
import { getPredictionClassDiseaseByClassIdAndModelId } from "@/server/services/prediction_class_disease";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const modelId = formData.get("model_id") as string;
    const patientId = formData.get("patient_id") as string;
    const userId = formData.get("user_id") as string;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 },
      );
    }

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const predictionFormData = new FormData();
    predictionFormData.append("image", image);
    predictionFormData.append("model_id", modelId);

    const predictionResponse = await fetch(
      `${AI_PREDICTION_SERVICE_URL}/predictions/predict`,
      {
        method: "POST",
        headers: {
          "X-API-Key": AI_PREDICTION_SERVICE_SECRET_KEY,
        },
        body: predictionFormData,
      },
    );

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "AI Service error" },
        { status: predictionResponse.status },
      );
    }

    const predictionResult: AIServicePredictionResponse =
      await predictionResponse.json();

    if (
      !predictionResult.result ||
      typeof predictionResult.result !== "object"
    ) {
      return NextResponse.json(
        { error: "Invalid prediction result format" },
        { status: 500 },
      );
    }

    const classId = (predictionResult.result as Record<string, unknown>)
      .class_id;

    if (typeof classId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid class_id in prediction result" },
        { status: 500 },
      );
    }

    const predictionClassDisease =
      await getPredictionClassDiseaseByClassIdAndModelId({
        classId,
        modelId,
      });

    if (!predictionClassDisease) {
      return NextResponse.json(
        {
          error: `Prediction class disease not found for class_id: ${classId} and model_id: ${modelId}`,
        },
        { status: 404 },
      );
    }

    const savedPrediction = await createPrediction({
      modelId,
      patientId,
      userId,
      predictionResult: predictionResult.result,
    });

    const apiResponse: PredictionResponse = {
      ...predictionResult,
      db_prediction_id: savedPrediction.id,
      disease_id: predictionClassDisease.diseaseId,
      stage_idx: predictionClassDisease.stageIdx,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Prediction error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process prediction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
