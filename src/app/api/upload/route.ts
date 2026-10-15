import { NextRequest } from "next/server";
import { requireAdminApi } from "@/backend/lib/require-admin-api";
import { uploadImage } from "@/backend/controllers/upload.controller";
import { response } from "@/backend/response";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) return response.unauthorized();

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) return response.badRequest("No file provided");
  if (!ALLOWED.includes(file.type)) return response.badRequest("Only JPEG, PNG, WebP or AVIF images are allowed");
  if (file.size === 0) return response.badRequest("The file is empty");
  if (file.size > MAX_BYTES) return response.badRequest("Image is larger than 5 MB");

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return response.unavailable("Image upload isn't configured yet (Cloudinary keys are missing).");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    return response.ok(await uploadImage(buffer, "content"), 201);
  } catch (err) {
    console.error("[upload]", err);
    return response.error("Image upload failed. Please try again.", 502);
  }
}
