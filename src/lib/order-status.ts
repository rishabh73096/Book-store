export const ORDER_STATUSES = ["pending_payment", "paid", "shipped", "delivered", "cancelled", "failed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

// Which status an admin may move an order to. Payment states (pending_payment/failed → paid)
// are set only by the verified payment flow, never by hand.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  failed: ["cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
