import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { verifyCredentialsAndSendLoginOtp, AuthError } from "@/backend/controllers/auth.controller";
import { sendLoginOtpEmail } from "@/backend/lib/mailer";
import { clientIp, rateLimit } from "@/backend/lib/rate-limit";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return response.validationError(parsed.error);
  }

  // Brute-force protection: 5 tries per IP+email and 30 per IP, per 15 minutes.
  const ip = clientIp(req);
  const perAccount = rateLimit(`login:${ip}:${parsed.data.email.toLowerCase()}`, 5, 15 * 60_000);
  if (!perAccount.ok) return response.tooMany(perAccount.retryAfter);
  const perIp = rateLimit(`login-ip:${ip}`, 30, 15 * 60_000);
  if (!perIp.ok) return response.tooMany(perIp.retryAfter);

  try {
    const { email, otp } = await verifyCredentialsAndSendLoginOtp(
      parsed.data.email,
      parsed.data.password
    );

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendLoginOtpEmail(email, otp);
    } else if (process.env.NODE_ENV !== "production") {
      // Local development without SMTP: the code is printed in the server terminal instead.
      console.log(`[auth] SMTP not configured — login OTP for ${email}: ${otp}`);
    } else {
      throw new Error("SMTP is not configured");
    }

    return response.ok({
      message: "Verification code sent to your registered admin email. It expires in 5 minutes.",
      email,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    console.error("[auth] Login OTP send error:", err);
    return response.error("Failed to send verification code. Please try again.", 500);
  }
}

