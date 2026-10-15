import type { Metadata } from "next";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminPayload } from "@/backend/lib/current-admin";
import { getAdminById } from "@/backend/controllers/auth.controller";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function DashboardProfilePage() {
  const payload = await getCurrentAdminPayload();
  const admin = payload ? await getAdminById(payload.sub).catch(() => null) : null;

  const name = admin?.name ?? "Administrator";
  const email = admin?.email ?? payload?.email ?? "";
  const role = admin?.role ?? payload?.role ?? "admin";

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account details.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Role
          </p>
          <p className="mt-1 text-sm font-medium capitalize">{role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Enter your current password to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
