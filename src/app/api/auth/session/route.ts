import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshAdminSession } from "@/backend/controllers/auth.controller";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
  cookieOptions,
} from "@/backend/lib/auth";


export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  const login = new URL("/login", req.url);

  if (!refreshToken) return NextResponse.redirect(login);

  try {
    const { accessToken, refreshToken: next } = await refreshAdminSession(refreshToken);
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookies.set(REFRESH_COOKIE, next, cookieOptions(REFRESH_COOKIE_MAX_AGE));
    return res;
  } catch {
    const res = NextResponse.redirect(login);
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }
}
