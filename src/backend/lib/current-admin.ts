import { cookies } from "next/headers";
import { ACCESS_COOKIE, verifyAccessToken, type AdminTokenPayload } from "@/backend/lib/auth";

// Cheap, DB-free read of who's logged in (JWT payload only) — safe to call from a
// server layout purely for display purposes, separate from RequireAdmin's access gate.
export async function getCurrentAdminPayload(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    return await verifyAccessToken(accessToken);
  } catch {
    return null;
  }
}
