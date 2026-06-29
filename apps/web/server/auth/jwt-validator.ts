import { createRemoteJWKSet, jwtVerify } from "jose";
import { SUPABASE_URL } from "../constants";
import type { JWTPayload } from "./schemas";

/**
 * Supabase publishes its JWT signing public keys at the JWKS endpoint. Using a
 * remote JWK set (instead of a single pinned key) means signing-key rotation is
 * handled automatically: `jose` caches the keys in-process and refetches when it
 * encounters a token signed by an unknown key id.
 */
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

/**
 * Validates a Supabase JWT and returns the payload
 * @param token - JWT string without "Bearer" prefix
 * @returns JWT payload with claims (sub, email, role, etc.)
 * @throws Error if token is invalid or expired
 */
export async function verifySupabaseToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["ES256"],
      audience: "authenticated",
    });

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("Token validation error:", error);
    if (error instanceof Error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
    throw new Error("Token validation failed");
  }
}
