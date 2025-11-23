import { z } from "zod";

export const AuthenticatedUserSchema = z.object({
  userId: z.string(),
  email: z.email(),
  role: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string().optional(),
  sessionId: z.string().optional(),
});

export const JWTPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  role: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string().optional(),
  session_id: z.string().optional(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
