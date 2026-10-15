import { cookies } from "next/headers";
import { logoutAdmin } from "@/backend/controllers/auth.controller";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccessToken } from "@/backend/lib/auth";
import { response } from "@/backend/response";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      await logoutAdmin(payload.sub);
    } catch {
      // Token already invalid/expired — nothing to revoke, just clear cookies below.
    }
  }

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  return response.ok({ success: true });
}
