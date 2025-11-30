import { normalizeError } from "./error_codes";
import { Result, CustomError } from "./schemas";

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

export function unwrap<T>(result: Result<T>): T {
  if (!result.success) {
    const error = new Error(result.error.message) as CustomError;
    error.code = result.error.code;
    error.status = result.error.status;
    throw error;
  }
  return result.data;
}
