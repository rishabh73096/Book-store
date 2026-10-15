import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/backend/lib/razorpay";
import { markOrderFailed, markOrderPaid } from "@/backend/controllers/order.controller";

// Razorpay webhook (payment.captured / payment.failed) — safety net for customers who pay
// but close the tab before the browser callback runs. Configure in the Razorpay dashboard
// with the secret stored in RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string } } };
  };
  const payment = event.payload?.payment?.entity;

  if (payment?.order_id) {
    if (event.event === "payment.captured") await markOrderPaid(payment.order_id, payment.id);
    if (event.event === "payment.failed") await markOrderFailed(payment.order_id);
  }

  return NextResponse.json({ received: true });
}
