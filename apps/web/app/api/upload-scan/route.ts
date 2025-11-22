import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/server/supabase/client";
import { getCurrentUser } from "@/server/auth";

export const maxDuration = 60;

// Exclude this endpoint from middleware to avoid conflicts with FormData
export const skipAuth = true;

// Helper to calculate SHA256 of file
async function calculateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  // Validate auth BEFORE touching request body
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Parse FormData
  let file;
  let imageType;
  let buffer;

  try {
    const formData = await request.formData();
    file = formData.get("file") as File;
    imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!imageType || (imageType !== "fundus" && imageType !== "oct")) {
      return NextResponse.json({ error: "Invalid imageType" }, { status: 400 });
    }

    // Convert to Buffer
    const bytes = await file.bytes();
    buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    view.set(bytes);
  } catch {
    return NextResponse.json(
      { error: "Failed to read upload" },
      { status: 400 },
    );
  }

  try {
    // Validate user
    await getCurrentUser(token);

    // Calculate file hash to avoid duplicates
    const fileHash = await calculateFileHash(buffer);
    const fileExtension = file.name.split(".").pop() || "bin";
    const fileName = `${fileHash}.${fileExtension}`;
    const filePath = `${imageType}/${fileName}`;

    // Check if file already exists
    try {
      const { data: listData } = await supabaseAdmin.storage
        .from("medical_images")
        .list(imageType, { limit: 1000, search: fileName });

      if (listData && listData.length > 0) {
        const existingFile = listData.find((f) => f.name === fileName);
        if (existingFile) {
          return NextResponse.json({ path: filePath, id: fileHash });
        }
      }
    } catch {
      // Continue with upload even if check fails
    }

    // Upload to Supabase (only if not exists)
    let uploadResult;

    try {
      uploadResult = await Promise.race([
        supabaseAdmin.storage.from("medical_images").upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Upload timeout")), 30000),
        ),
      ]);
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Process response
    const { data, error } = uploadResult as {
      data?: { path: string; id: string };
      error?: { message: string };
    };

    if (error) {
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 400 },
      );
    }

    if (!data?.path) {
      return NextResponse.json(
        { error: "No path returned from Supabase" },
        { status: 500 },
      );
    }

    return NextResponse.json({ path: data.path, id: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 },
    );
  }
}
