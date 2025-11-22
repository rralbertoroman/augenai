import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/server/supabase/client";
import { getCurrentUser } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Validate auth before reading body
    try {
      await getCurrentUser(token);
    } catch (authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clone the request to avoid body being locked
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const file = formData.get("file") as File;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!imageType || (imageType !== "fundus" && imageType !== "oct")) {
      return NextResponse.json(
        { error: "Valid image type is required (fundus or oct)" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${imageType}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("medical_images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ path: data.path });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
