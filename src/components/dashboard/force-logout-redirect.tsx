"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";

export function ForceLogoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    logout().finally(() => router.replace("/login"));
  }, [router]);

  return null;
}
