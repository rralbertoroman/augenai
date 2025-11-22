import { NextRequest, NextResponse } from "next/server";
import {
  AI_PREDICTION_SERVICE_URL,
  AI_PREDICTION_SERVICE_SECRET_KEY,
} from "@/server/constants";
import {
  PredictionStatus,
  type AIServicePredictionResponse,
  type PredictionResponse,
  type MultiplePredictionsResponse,
} from "@/types/prediction";
import { createPrediction } from "@/server/services/prediction";
import { createPredictionRequest } from "@/server/services/prediction_request";
import { getPredictionClassDiseaseByClassIdAndModelId } from "@/server/services/prediction_class_disease";
import { supabaseAdmin } from "@/server/supabase/client";
import { getCurrentUser } from "@/server/auth";
import { selectOptimalModels } from "@/server/services/model";

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
    const patientId = formData.get("patient_id") as string;
    const task = formData.get("task") as string;
    const imageType = formData.get("image_type") as string;
    const diseasesStr = formData.get("diseases") as string;

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

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 },
      );
    }

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    if (!imageType) {
      return NextResponse.json(
        { error: "Image type is required" },
        { status: 400 },
      );
    }

    if (!diseasesStr) {
      return NextResponse.json(
        { error: "Diseases are required" },
        { status: 400 },
      );
    }

    let diseases: string[];
    try {
      diseases = JSON.parse(diseasesStr);
      if (!Array.isArray(diseases) || diseases.length === 0) {
        throw new Error("Diseases must be a non-empty array");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid diseases format. Must be a JSON array" },
        { status: 400 },
      );
    }

    // Select optimal models based on task, imageType, and diseases
    const selectedModelIds = await selectOptimalModels(
      task,
      imageType,
      diseases,
    );

    if (selectedModelIds.length === 0) {
      return NextResponse.json(
        { error: "No suitable models found for the given criteria" },
        { status: 404 },
      );
    }

    // Download image from storage
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

    // Create prediction request first
    const predictionRequest = await createPredictionRequest({
      userId,
      patientId,
      task,
      imageType,
      diseases,
      storagePath,
      bucketName,
      modelsUsed: selectedModelIds,
    });

    // Run predictions for all selected models
    const allPredictions: PredictionResponse[] = [];

    for (const modelId of selectedModelIds) {
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
        await predictionResponse.json().catch(() => ({}));
        continue; // Skip this model and continue with others
      }

      const predictionResult: AIServicePredictionResponse =
        await predictionResponse.json();

      if (predictionResult.status === PredictionStatus.ERROR) {
        continue;
      }

      if (
        !predictionResult.result ||
        !predictionResult.result.predictions ||
        predictionResult.result.predictions.length === 0
      ) {
        continue;
      }

      // Get the top prediction (highest confidence)
      const topPrediction = predictionResult.result.predictions.reduce(
        (max, pred) => (pred.confidence > max.confidence ? pred : max),
        predictionResult.result.predictions[0],
      );

      const classId = topPrediction.class_id.toString();

      const predictionClassDisease =
        await getPredictionClassDiseaseByClassIdAndModelId({
          classId,
          modelId,
        });

      if (!predictionClassDisease) {
        continue;
      }

      const savedPrediction = await createPrediction({
        requestId: predictionRequest.id,
        modelId,
        predictionResult: predictionResult.result,
      });

      const apiResponse: PredictionResponse = {
        ...predictionResult,
        db_prediction_id: savedPrediction.id,
        disease_id: predictionClassDisease.diseaseId,
        stage_idx: predictionClassDisease.stageIdx,
      };

      allPredictions.push(apiResponse);
    }

    if (allPredictions.length === 0) {
      return NextResponse.json(
        { error: "All model predictions failed" },
        { status: 500 },
      );
    }

    const response: MultiplePredictionsResponse = {
      predictions: allPredictions,
      models_used: selectedModelIds,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to process prediction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
