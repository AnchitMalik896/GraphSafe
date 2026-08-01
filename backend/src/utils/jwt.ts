import jwt from 'jsonwebtoken';

import { config } from '../config';
import type { JwtPayload } from '../types/auth';

/**
 * Signs a JWT for the given payload using the app's shared secret.
 * Expiration comes from config.auth.jwtExpiresIn (JWT_EXPIRES_IN env
 * var) — no refresh tokens exist in Version 1, so this is the only
 * expiration ever applied.
 *
 * The cast below is a type-only concession: JWT_EXPIRES_IN is
 * validated as a non-empty string at startup (see config/env.ts), but
 * jsonwebtoken's SignOptions expects its narrower `StringValue`
 * literal-union type, which a runtime-sourced string can't statically
 * satisfy. The value itself is passed through unchanged.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies and decodes a JWT. Throws (jwt.JsonWebTokenError /
 * jwt.TokenExpiredError) if the token is invalid, malformed, or expired.
 * Callers are responsible for catching and translating into an AppError.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
}
