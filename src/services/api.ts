export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Opt-in only: a 401 from login/forgot-password/etc. means bad credentials or an
  // invalid code, not an expired session, so it should never trigger a refresh attempt.
  retryOn401?: boolean;
};

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    if ("error" in payload) {
      const error = (payload as { error: unknown }).error;
      if (typeof error === "string") return error;
      if (error && typeof error === "object") {
        const flat = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
        const fieldMessage = flat.fieldErrors
          ? Object.values(flat.fieldErrors).flat()[0]
          : undefined;
        return flat.formErrors?.[0] || fieldMessage || fallback;
      }
    }
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, retryOn401 = false } = options;

  const isFormData = body instanceof FormData;

  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    // FormData sets its own multipart Content-Type (with boundary) — letting fetch
    // do that automatically instead of overriding it is required for uploads to work.
    headers: body && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && retryOn401 && path !== "/auth/refresh") {
    const refreshed = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (refreshed.ok) {
      return apiRequest<T>(path, { ...options, retryOn401: false });
    }
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new ApiError(extractMessage(payload, "Something went wrong"), res.status);
  }

  return payload.data as T;
}
