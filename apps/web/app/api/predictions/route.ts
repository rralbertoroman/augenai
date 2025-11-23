import { NextRequest, NextResponse } from "next/server";
import { processPredictionRequest } from "@/server/services/prediction_workflow";
import { getCurrentUser, AuthError } from "@/server/auth";

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

    try {
      const response = await processPredictionRequest({
        userId,
        formData,
      });
      return NextResponse.json(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process prediction";
      // Check for specific error messages to return 400 or 404
      if (
        message.includes("required") ||
        message.includes("Invalid") ||
        message.includes("Failed to download")
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      if (message.includes("No suitable models found")) {
        return NextResponse.json({ error: message }, { status: 404 });
      }
      if (message.includes("All model predictions failed")) {
        return NextResponse.json({ error: message }, { status: 500 });
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
