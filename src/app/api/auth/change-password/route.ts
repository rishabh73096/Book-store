import { NextRequest } from "next/server";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { changePasswordSchema } from "@/lib/validations/auth";
import { changeAdminPassword, AuthError } from "@/backend/controllers/auth.controller";
import { response } from "@/backend/response";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return response.validationError(parsed.error);

  try {
    await changeAdminPassword(admin.sub, parsed.data.currentPassword, parsed.data.newPassword);
    return response.ok({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return response.error(err.message, err.status);
    throw err;
  }
}
