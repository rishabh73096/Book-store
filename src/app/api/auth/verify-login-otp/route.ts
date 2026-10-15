import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyLoginOtpAndIssueTokens, AuthError } from "@/backend/controllers/auth.controller";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
  cookieOptions,
} from "@/backend/lib/auth";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return response.validationError(parsed.error);
  }

  try {
    const { accessToken, refreshToken, admin } = await verifyLoginOtpAndIssueTokens(
      parsed.data.email,
      parsed.data.otp
    );

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
    cookieStore.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    return response.ok({ admin });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    console.error("[auth] Verify login OTP error:", err);
    return response.error("Something went wrong. Please try again.", 500);
  }
}
