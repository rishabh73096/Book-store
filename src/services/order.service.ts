import { apiRequest } from "@/services/api";
import type { CheckoutInput } from "@/lib/validations/order";

export type CheckoutSession = {
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customer: CheckoutInput["customer"];
};

export function startCheckout(input: CheckoutInput) {
  return apiRequest<CheckoutSession>("/orders", { method: "POST", body: input });
}

export function verifyPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiRequest<{ orderNumber: string }>("/orders/verify", { method: "POST", body: input });
}

export function updateOrder(id: string, input: { status?: string; trackingNote?: string }) {
  return apiRequest<{ id: string; status: string }>(`/orders/${id}`, {
    method: "PATCH",
    body: input,
    retryOn401: true,
  });
}
