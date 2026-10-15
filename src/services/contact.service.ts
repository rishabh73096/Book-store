import { apiRequest } from "@/services/api";

export type ContactStatus = "pending" | "resolved" | "rejected";

export type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

export function submitContact(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  return apiRequest<{ success: true }>("/contact", { method: "POST", body: input });
}

export function updateContactStatus(id: string, status: ContactStatus) {
  return apiRequest<{ id: string; status: ContactStatus }>(`/contact/${id}`, {
    method: "PATCH",
    body: { status },
    retryOn401: true,
  });
}
