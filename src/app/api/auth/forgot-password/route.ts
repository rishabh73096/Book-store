import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset, AuthError } from "@/backend/controllers/auth.controller";
import { sendOtpEmail } from "@/backend/lib/mailer";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return response.validationError(parsed.error);
  }

  try {
    const otp = await requestPasswordReset(parsed.data.email);
    if (!otp) {
      return response.error("Only registered admin accounts can receive a password reset code.", 403);
    }

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendOtpEmail(parsed.data.email, otp);
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[auth] SMTP not configured — reset OTP for ${parsed.data.email}: ${otp}`);
    } else {
      throw new Error("SMTP is not configured");
    }

    return response.ok({
      message: "Verification code sent to your registered admin email.",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    console.error("[auth] Failed to send password reset OTP email:", err);
    return response.error("Failed to send verification code. Please try again.", 500);
  }
}
