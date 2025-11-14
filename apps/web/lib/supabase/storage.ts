import { createClient } from "./client";

export async function uploadEyeScan(
  file: File,
  imageType: "fundus" | "oct",
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { path: "", error: "No estás autenticado" };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("imageType", imageType);

    const response = await fetch("/api/upload-scan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        path: "",
        error: errorData.error || "Error al subir archivo",
      };
    }

    const data = await response.json();
    return { path: data.path };
  } catch (error) {
    return {
      path: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
