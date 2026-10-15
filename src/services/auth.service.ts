import { apiRequest } from "@/services/api";

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function login(email: string, password: string) {
  return apiRequest<{ message: string; email: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<{ success: true }>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiRequest<{ admin: AdminSession }>("/auth/me", { retryOn401: true });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function verifyOtp(email: string, otp: string) {
  return apiRequest<{ verified: boolean }>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export function verifyLoginOtp(email: string, otp: string) {
  return apiRequest<{ admin: AdminSession }>("/auth/verify-login-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export function resetPassword(
  email: string,
  otp: string,
  password: string,
  confirmPassword: string
) {
  return apiRequest<{ success: true }>("/auth/reset-password", {
    method: "POST",
    body: { email, otp, password, confirmPassword },
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  return apiRequest<{ success: true }>("/auth/change-password", {
    method: "PATCH",
    body: { currentPassword, newPassword, confirmPassword },
    retryOn401: true,
  });
}
