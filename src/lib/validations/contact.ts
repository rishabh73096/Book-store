import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be at most 50 characters")
  .regex(/^[\p{L}\s'-]+$/u, "Only letters, spaces, hyphens, and apostrophes are allowed");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number");

export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: z
    .email("Enter a valid email address")
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(254, "Email is too long"),
  phone: phoneSchema,
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(1000, "Message is too long (max 1000 characters)"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactStatusSchema = z.object({
  status: z.enum(["pending", "resolved", "rejected"]),
});

export type ContactStatusValues = z.infer<typeof contactStatusSchema>;
