import { normalizeError } from "./error_codes";
import { Result } from "./schemas";

export async function tryCatch<T>(
  fn: () => Promise<T> | T,
): Promise<Result<T>> {
  try {
    const data = await fn();

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error("Server Error:", error);

    const normalizedError = normalizeError(error);
    return {
      success: false,
      data: null,
      error: normalizedError,
    };
  }
}
