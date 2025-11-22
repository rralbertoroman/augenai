import { NextResponse } from "next/server";
import { getAllPredictions } from "@/server/services/prediction";
import { getAllPredictionRequests } from "@/server/services/prediction_request";
import { getPatientById } from "@/server/services/patient";

export async function GET() {
  try {
    console.log("GET /api/predictions/list - Fetching all predictions");

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
          } catch (err) {
            console.error("Error fetching patient:", err);
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

    console.log("Predictions fetched:", enrichedPredictions.length);
    return NextResponse.json(enrichedPredictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch predictions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
