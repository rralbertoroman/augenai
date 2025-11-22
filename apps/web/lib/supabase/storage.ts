import { createClient } from "./client";

// Mapa de códigos de error a mensajes amigables
const ERROR_MESSAGES: Record<number, string> = {
  400: "Solicitud inválida - Verifica el formato del archivo",
  401: "No estás autenticado - Por favor inicia sesión",
  403: "Permiso denegado - No tienes acceso para subir archivos",
  404: "Recurso no encontrado",
  409: "El archivo ya existe - Se reintentará",
  413: "Archivo demasiado grande - Máximo 50MB",
  429: "Demasiadas solicitudes - Intenta de nuevo más tarde",
  500: "Error del servidor - Se reintentará automáticamente",
  502: "Puerta de enlace incorrecta - Se reintentará",
  503: "Servicio no disponible - Se reintentará",
  504: "Tiempo de espera agotado - Se reintentará",
};

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

    let lastError: string = "";

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Validaciones locales
        if (file.size > 50 * 1024 * 1024) {
          const errorMsg = `Archivo demasiado grande: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)} MB (máximo: 50 MB)`;
          return { path: "", error: errorMsg };
        }

        if (file.size === 0) {
          return { path: "", error: "El archivo está vacío" };
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("imageType", imageType);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 45000);

        const response = await fetch("/api/upload-scan", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage =
            ERROR_MESSAGES[response.status] ||
            "Error desconocido al subir archivo";

          try {
            // Leer el body UNA SOLA VEZ para evitar "body is locked" error
            const bodyText = await response.text();
            const contentType = response.headers.get("content-type");

            // Intentar parsear como JSON si el content-type lo indica
            if (contentType && contentType.includes("application/json")) {
              try {
                const errorData = JSON.parse(bodyText);
                if (errorData.error) {
                  errorMessage = `${errorMessage} (${errorData.error})`;
                }
              } catch {
                // No es JSON válido, usar mensaje por defecto
              }
            }
          } catch {
            // Error leyendo body, usar mensaje por defecto
          }

          lastError = errorMessage;

          // Retry logic mejorado
          if (
            (response.status === 500 ||
              response.status === 502 ||
              response.status === 503 ||
              response.status === 504 ||
              response.status === 429) &&
            attempt < retries
          ) {
            const backoffTime = 1000 * attempt;
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            continue;
          }

          // No reintentar con estos errores
          if (response.status === 413 || response.status === 400) {
            return {
              path: "",
              error: errorMessage,
            };
          }

          return {
            path: "",
            error: errorMessage,
          };
        }

        let data;
        try {
          data = await response.json();
        } catch {
          return {
            path: "",
            error: "Error al parsear respuesta del servidor",
          };
        }

        if (!data.path) {
          return {
            path: "",
            error: "Respuesta del servidor sin ruta de archivo",
          };
        }

        return { path: data.path };
      } catch (error) {
        let errorMessage = "Upload failed";

        if (error instanceof Error) {
          errorMessage = error.message;

          // Detectar tipo específico de error
          if (error.name === "AbortError") {
            errorMessage = "La solicitud fue cancelada (timeout)";
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "Error de conexión - Verifica tu internet";
          } else if (error.message.includes("NetworkError")) {
            errorMessage = "Error de red";
          }
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
