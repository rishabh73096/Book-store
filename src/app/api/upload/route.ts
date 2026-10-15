import { NextRequest } from "next/server";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { uploadImage } from "@/backend/controllers/upload.controller";
import { response } from "@/backend/response";

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return response.badRequest("No file provided");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadImage(buffer, "content");

  return response.ok(result, 201);
}
