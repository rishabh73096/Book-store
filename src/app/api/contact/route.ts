import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { createContactMessage } from "@/backend/controllers/contact.controller";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await createContactMessage(parsed.data);
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ success: false, error: "Service temporarily unavailable. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ success: true, data: { success: true } }, { status: 201 });
}
