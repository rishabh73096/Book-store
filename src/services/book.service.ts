import { apiRequest } from "@/services/api";
import type { BookInput } from "@/lib/validations/book";

export function createBook(input: BookInput) {
  return apiRequest<{ id: string }>("/books", { method: "POST", body: input, retryOn401: true });
}

export function updateBook(id: string, input: BookInput) {
  return apiRequest<{ id: string }>(`/books/${id}`, {
    method: "PATCH",
    body: input,
    retryOn401: true,
  });
}

export function deleteBook(id: string) {
  return apiRequest<{ success: true }>(`/books/${id}`, { method: "DELETE", retryOn401: true });
}
