import { NextRequest, NextResponse } from "next/server";
import { processPredictionRequest } from "@/server/services/prediction_workflow";
import { getCurrentUser, AuthError, getTokenFromHeaders } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (validates token from headers)
    const token = await getTokenFromHeaders();
    await getCurrentUser(token);

    const formData = await request.formData();

    // Extract and validate FormData parameters
    const storagePath = formData.get("storage_path");
    const bucketName = formData.get("bucket_name");
    const patientId = formData.get("patient_id");
    const task = formData.get("task");
    const imageType = formData.get("image_type");
    const diseasesStr = formData.get("diseases");

    // Validate required fields
    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json(
        { error: "Storage path is required" },
        { status: 400 },
      );
    }
    if (!bucketName || typeof bucketName !== "string") {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 },
      );
    }
    if (!patientId || typeof patientId !== "string") {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 },
      );
    }
    if (!task || typeof task !== "string") {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }
    if (!imageType || typeof imageType !== "string") {
      return NextResponse.json(
        { error: "Image type is required" },
        { status: 400 },
      );
    }
    if (!diseasesStr || typeof diseasesStr !== "string") {
      return NextResponse.json(
        { error: "Diseases are required" },
        { status: 400 },
      );
    }

    // Parse diseases array
    let diseases: string[];
    try {
      diseases = JSON.parse(diseasesStr);
      if (!Array.isArray(diseases) || diseases.length === 0) {
        return NextResponse.json(
          { error: "Diseases must be a non-empty array" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid diseases format. Must be a JSON array" },
        { status: 400 },
      );
    }

    // Call service with clean, validated data
    try {
      const response = await processPredictionRequest({
        token,
        storagePath,
        bucketName,
        patientId,
        task,
        imageType,
        diseases,
      });
      return NextResponse.json(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process prediction";

      // Check for specific error messages to return appropriate status codes
      if (message.includes("No suitable models found")) {
        return NextResponse.json({ error: message }, { status: 404 });
      }
      if (message.includes("All model predictions failed")) {
        return NextResponse.json({ error: message }, { status: 500 });
      }
      if (message.includes("Failed to download")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }

      throw err; // Re-throw to be caught by outer catch
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to process prediction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
