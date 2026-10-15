import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccessToken, type AdminTokenPayload } from "@/backend/lib/auth";

// Server-side gate for admin routes: verifies the access-token cookie and checks
// its role before rendering. Wrap any admin-only layout/page with this.
export async function RequireAdmin({
  role = "admin",
  children,
}: {
  role?: string;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  let payload: AdminTokenPayload | null = null;
  if (accessToken) {
    try {
      payload = await verifyAccessToken(accessToken);
    } catch {
      payload = null;
    }
  }

  if (!payload && cookieStore.get(REFRESH_COOKIE)?.value) {
    // Access token lapsed but a refresh token exists: renew the session, then land on the dashboard.
    redirect("/api/auth/session");
  }

  if (!payload || payload.role !== role) {
    redirect("/login");
  }

  return <>{children}</>;
}
