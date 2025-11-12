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
import { supabaseAdmin } from "@/server/supabase/client";
import { getCurrentUser } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Get authenticated user from JWT
    const currentUser = await getCurrentUser(token);
    const userId = currentUser.userId;

    const formData = await request.formData();
    const storagePath = formData.get("storage_path") as string;
    const bucketName = formData.get("bucket_name") as string;
    const modelId = formData.get("model_id") as string;
    const patientId = formData.get("patient_id") as string;

    if (!storagePath) {
      return NextResponse.json(
        { error: "Storage path is required" },
        { status: 400 },
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 },
      );
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

    const { data: imageBlob, error: downloadError } =
      await supabaseAdmin.storage.from(bucketName).download(storagePath);

    if (downloadError || !imageBlob) {
      return NextResponse.json(
        {
          error: `Failed to download image from storage: ${downloadError?.message || "No data returned"}`,
        },
        { status: 400 },
      );
    }

    const fileName = storagePath.split("/").pop();

    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid storage path: cannot extract filename" },
        { status: 400 },
      );
    }

    const predictionFormData = new FormData();
    predictionFormData.append("image", imageBlob, fileName);
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
