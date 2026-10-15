import { cookies } from "next/headers";
import { ACCESS_COOKIE, verifyAccessToken, type AdminTokenPayload } from "@/backend/lib/auth";

// Same JWT check as RequireAdmin (the page-level gate), but for Route Handlers that
// have no server-rendered page to redirect from — returns null instead of redirecting.
export async function requireAdminApi(role = "admin"): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const payload = await verifyAccessToken(accessToken);
    return payload.role === role ? payload : null;
  } catch {
    return null;
  }
}
