import { NextRequest } from "next/server";
import { z } from "zod";
import { subscribe } from "@/backend/controllers/newsletter.controller";
import { response } from "@/backend/response";

const schema = z.object({ email: z.email("Enter a valid email address").trim().toLowerCase().max(254) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return response.validationError(parsed.error);
  try {
    await subscribe(parsed.data.email);
  } catch (err) {
    console.error("[newsletter]", err);
    return response.unavailable();
  }
  return response.ok({ success: true }, 201);
}
