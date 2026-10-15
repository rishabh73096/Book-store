import { apiRequest } from "@/services/api";
import type { SettingsInput } from "@/lib/validations/settings";

export function updateSettings(input: SettingsInput) {
  return apiRequest<{ success: true }>("/settings", {
    method: "PATCH",
    body: input,
    retryOn401: true,
  });
}
