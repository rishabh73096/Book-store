import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/site/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
      <ResetPasswordForm email={email ?? ""} />
    </div>
  );
}
