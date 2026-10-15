import { NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validations/order";
import { createCheckout, OrderError } from "@/backend/controllers/order.controller";
import { response } from "@/backend/response";

// Public: starts a checkout — validates the cart server-side and opens a Razorpay order.
export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  try {
    return response.ok(await createCheckout(parsed.data), 201);
  } catch (err) {
    if (err instanceof OrderError) return response.error(err.message, err.status);
    console.error("[checkout]", err);
    if (err instanceof Error && /MONGODB_URI|RAZORPAY_/.test(err.message)) return response.unavailable("Online checkout is not set up yet.");
    return response.error("Could not start payment. Please try again.", 500);
  }
}
