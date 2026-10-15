import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { settingsSchema } from "@/lib/validations/settings";
import { updateSettings } from "@/backend/controllers/settings.controller";
import { response } from "@/backend/response";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const parsed = settingsSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  await updateSettings(parsed.data);
  revalidatePath("/", "layout");
  return response.ok({ success: true });
}
