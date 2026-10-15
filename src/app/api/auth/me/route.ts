import { cookies } from "next/headers";
import { getAdminById, AuthError } from "@/backend/controllers/auth.controller";
import { ACCESS_COOKIE, verifyAccessToken } from "@/backend/lib/auth";
import { response } from "@/backend/response";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return response.unauthorized();
  }

  try {
    const payload = await verifyAccessToken(accessToken);
    const admin = await getAdminById(payload.sub);
    return response.ok({ admin });
  } catch (err) {
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    return response.unauthorized();
  }
}
