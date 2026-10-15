import { NextRequest } from "next/server";
import { verifyPaymentSchema } from "@/lib/validations/order";
import { verifyPaymentSignature } from "@/backend/lib/razorpay";
import { markOrderPaid } from "@/backend/controllers/order.controller";
import { response } from "@/backend/response";

// Public: called by the browser after Razorpay checkout succeeds. The HMAC signature
// proves the payment is genuine, so an order can only be marked paid with a valid one.
export async function POST(req: NextRequest) {
  const parsed = verifyPaymentSchema.safeParse(await req.json());
  if (!parsed.success) return response.validationError(parsed.error);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return response.badRequest("Payment verification failed");
  }

  const order = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
  if (!order) return response.notFound("Order not found");

  return response.ok({ orderNumber: order.orderNumber });
}
