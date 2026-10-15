import { NextRequest } from "next/server";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyAdminOtp, AuthError } from "@/backend/controllers/auth.controller";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return response.validationError(parsed.error);
  }

  try {
    await verifyAdminOtp(parsed.data.email, parsed.data.otp);
    return response.ok({ verified: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    console.error("[auth] Verify OTP error:", err);
    return response.error("Failed to verify code. Please try again.", 500);
  }
}
