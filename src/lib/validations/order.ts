import { z } from "zod";
import { MAX_QTY_PER_BOOK } from "@/lib/limits";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().min(1),
        quantity: z
          .number()
          .int()
          .min(1)
          .max(MAX_QTY_PER_BOOK, `You can buy at most ${MAX_QTY_PER_BOOK} copies of a book`),
      })
    )
    .min(1, "Your cart is empty")
    .max(20, "Too many different books in one order"),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{10,15}$/, "Enter a valid phone number"),
    address: z.string().trim().min(5, "Enter your full address").max(300),
    city: z.string().trim().min(2, "Enter your city").max(80),
    state: z.string().trim().min(2, "Enter your state").max(80),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const orderUpdateSchema = z.object({
  status: z
    .enum(["pending_payment", "paid", "shipped", "delivered", "cancelled", "failed"])
    .optional(),
  trackingNote: z.string().trim().max(500).optional(),
});
