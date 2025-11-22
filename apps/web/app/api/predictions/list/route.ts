import { NextResponse } from "next/server";
import { getAllPredictions } from "@/server/services/prediction";
import { getAllPredictionRequests } from "@/server/services/prediction_request";
import { getPatientById } from "@/server/services/patient";

export async function GET() {
  try {
    // Get all predictions with their request details
    const predictions = await getAllPredictions();
    const predictionRequests = await getAllPredictionRequests();

    // Create a map of requests for quick lookup
    const requestMap = new Map(predictionRequests.map((r) => [r.id, r]));

    // Enrich predictions with request and patient data
    const enrichedPredictions = await Promise.all(
      predictions.map(async (pred) => {
        const request = requestMap.get(pred.requestId);
        let patientName = "Unknown";

        if (request?.patientId) {
          try {
            const patient = await getPatientById(request.patientId);
            patientName = patient?.name || "Unknown";
          } catch {
            // Error fetching patient
          }
        }

        return {
          id: pred.id,
          patientId: request?.patientId || "Unknown",
          patientName,
          diseaseId: request?.diseases?.[0] || "Unknown",
          stageIdx: 0,
          status: "completed",
          createdAt: pred.createdAt,
          updatedAt: pred.updatedAt,
        };
      }),
    );

    return NextResponse.json(enrichedPredictions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch predictions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
