import { SignJWT, jwtVerify } from "jose";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export const ACCESS_COOKIE_MAX_AGE = 15 * 60;
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function getSecret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set in environment variables`);
  return new TextEncoder().encode(value);
}

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function signAccessToken(payload: AdminTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecret("JWT_ACCESS_SECRET"));
}

export async function signRefreshToken(payload: AdminTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(getSecret("JWT_REFRESH_SECRET"));
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify<AdminTokenPayload>(token, getSecret("JWT_ACCESS_SECRET"));
  return payload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify<AdminTokenPayload>(token, getSecret("JWT_REFRESH_SECRET"));
  return payload;
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
