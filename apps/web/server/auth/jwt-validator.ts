import { importJWK, jwtVerify } from "jose";
import { SUPABASE_JWT_JWK } from "../constants";
import type { JWTPayload } from "./schemas";

/**
 * Validates a Supabase JWT and returns the payload
 * @param token - JWT string without "Bearer" prefix
 * @returns JWT payload with claims (sub, email, role, etc.)
 * @throws Error if token is invalid or expired
 */
export async function verifySupabaseToken(token: string): Promise<JWTPayload> {
  try {
    // Parse JWK from environment variable
    const jwkData = JSON.parse(SUPABASE_JWT_JWK);

    // Convert JWK to public key
    const publicKey = await importJWK(jwkData, "ES256");

    // Decode and validate token
    const { payload } = await jwtVerify(token, publicKey, {
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
