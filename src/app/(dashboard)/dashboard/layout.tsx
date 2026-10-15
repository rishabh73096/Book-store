import type { Metadata } from "next";
import { RequireAdmin } from "@/components/auth/require-admin";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentAdminPayload } from "@/backend/lib/current-admin";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const payload = await getCurrentAdminPayload();
  const admin = payload ? { email: payload.email, role: payload.role } : null;

  return (
    <RequireAdmin role="admin">
      <DashboardShell admin={admin}>{children}</DashboardShell>
    </RequireAdmin>
  );
}
