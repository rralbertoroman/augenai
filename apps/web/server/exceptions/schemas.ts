export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export interface AppError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown> | string[] | Record<string, string[]>;
}
export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export type Result<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: AppError };
