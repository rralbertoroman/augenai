export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
  iss?: string;
  sessionId?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  aud: string;
  exp: number;
  iat: number;
  iss?: string;
  session_id?: string;
}
