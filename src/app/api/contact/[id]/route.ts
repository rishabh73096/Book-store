import { NextRequest } from "next/server";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { contactStatusSchema } from "@/lib/validations/contact";
import { setContactStatus } from "@/backend/controllers/contact.controller";
import { response } from "@/backend/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const { id } = await params;
  const body = await req.json();
  const parsed = contactStatusSchema.safeParse(body);
  if (!parsed.success) return response.validationError(parsed.error);

  const result = await setContactStatus(id, parsed.data.status);
  if (!result) return response.notFound("Message not found");

  return response.ok(result);
}
