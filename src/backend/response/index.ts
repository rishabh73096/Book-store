import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export const response = {
  ok<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  },
  badRequest(message: string) {
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  },
  unauthorized(message = "Not authenticated") {
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  },
  notFound(message = "Not found") {
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  },
  error(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
  },
  tooMany(retryAfter: number) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a little and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  },
  unavailable(message = "Service temporarily unavailable. Please try again later.") {
    return NextResponse.json({ success: false, error: message }, { status: 503 });
  },
  validationError(error: ZodError) {
    return NextResponse.json({ success: false, error: error.flatten() }, { status: 400 });
  },
};
