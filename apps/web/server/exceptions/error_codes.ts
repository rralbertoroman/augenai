import { ZodError } from "zod";
import { AppError, CustomError, HTTP_STATUS } from "./schemas";

export function normalizeError(error: unknown): AppError {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join(".");

      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }

      fieldErrors[path]?.push(issue.message);
    }

    return {
      message: "Validation Error",
      code: "VALIDATION_ERROR",
      status: HTTP_STATUS.BAD_REQUEST,
      details: fieldErrors,
    };
  }

  if (error instanceof Error) {
    const customError = error as CustomError;
    const rawStatus = customError.status;
    const status =
      typeof rawStatus === "number"
        ? rawStatus
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const code = customError.code || "INTERNAL_ERROR";

    return {
      message: error.message,
      code,
      status,
    };
  }

  return {
    message: String(error) || "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  };
}
