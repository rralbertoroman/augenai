import { verifySupabaseToken } from "./jwt-validator";
import type { AuthenticatedUser } from "./types";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Validates JWT and returns authenticated user
 * Replicates get_current_user from FastAPI
 * @param token - JWT string without "Bearer" prefix
 * @returns Authenticated user
 * @throws AuthError if token is invalid or expired
 */
export async function getCurrentUser(
  token: string,
): Promise<AuthenticatedUser> {
  try {
    const payload = await verifySupabaseToken(token);

    // Map "sub" to "userId"
    const user: AuthenticatedUser = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      sessionId: payload.session_id,
    };

    return user;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        throw new AuthError("Token expired", 401);
      }
      throw new AuthError("Invalid token", 401);
    }
    throw new AuthError("Authentication error", 401);
  }
}

/**
 * Verifies that the authenticated user owns the resource
 * Replicates verify_ownership from FastAPI
 * @param currentUser - Authenticated user
 * @param resourceUserId - ID of the resource owner
 * @throws AuthError if user is not the owner
 */
export function verifyOwnership(
  currentUser: AuthenticatedUser,
  resourceUserId: string,
): void {
  if (currentUser.userId !== resourceUserId) {
    throw new AuthError(
      "You don't have permission to modify this resource",
      403,
    );
  }
}
