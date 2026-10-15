import { cookies } from "next/headers";
import { refreshAdminSession, AuthError } from "@/backend/controllers/auth.controller";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
  cookieOptions,
} from "@/backend/lib/auth";
import { response } from "@/backend/response";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return response.unauthorized();
  }

  try {
    const { accessToken, refreshToken: nextRefreshToken, admin } =
      await refreshAdminSession(refreshToken);

    cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
    cookieStore.set(REFRESH_COOKIE, nextRefreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    return response.ok({ admin });
  } catch (err) {
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
    if (err instanceof AuthError) {
      return response.error(err.message, err.status);
    }
    throw err;
  }
}
