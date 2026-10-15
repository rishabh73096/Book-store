import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetAdminPassword, AuthError } from "@/backend/controllers/auth.controller";
import { sendPasswordResetSuccessEmail } from "@/backend/lib/mailer";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return response.validationError(parsed.error);
  }

  try {
    await resetAdminPassword(parsed.data.email, parsed.data.otp, parsed.data.password);
    try {
      await sendPasswordResetSuccessEmail(parsed.data.email);
    } catch (mailErr) {
      console.error("[auth] Failed to send password reset success email:", mailErr);
    }
    return response.ok({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    throw err;
  }
}
