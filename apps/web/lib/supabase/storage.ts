import { createClient } from "./client";

export async function uploadEyeScan(
  file: File,
  imageType: "fundus" | "oct",
  retries: number = 3,
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { path: "", error: "No estás autenticado" };
    }

    // Local validations
    if (file.size > 50 * 1024 * 1024) {
      const errorMsg = `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)} MB (máximo: 50 MB)`;
      return { path: "", error: errorMsg };
    }

    if (file.size === 0) {
      return { path: "", error: "El archivo está vacío" };
    }

    let lastError: string = "";

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const timestamp = Date.now();
        const filePath = `inputs/${imageType}/${timestamp}-${file.name}`;

        // Upload using Supabase client - basic format
        const { data, error } = await supabase.storage
          .from("medical_images")
          .upload(filePath, file);

        if (error) {
          lastError = error.message;

          // Retry logic for specific errors
          if (
            (error.message.includes("500") ||
              error.message.includes("502") ||
              error.message.includes("503") ||
              error.message.includes("504")) &&
            attempt < retries
          ) {
            const backoffTime = 1000 * attempt;
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            continue;
          }

          return {
            path: "",
            error: error.message,
          };
        }

        // Successful upload
        return { path: data.path };
      } catch (error) {
        let errorMessage = "Upload failed";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        lastError = errorMessage;

        if (attempt < retries) {
          const backoffTime = 1000 * attempt;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }
      }
    }

    return {
      path: "",
      error: lastError || "Upload failed after multiple attempts",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return {
      path: "",
      error: errorMessage,
    };
  }
}
