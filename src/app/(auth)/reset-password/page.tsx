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
    <div className="zine-auth flex items-center justify-center px-5 py-12 sm:px-10">
      <div className="zine-card w-full max-w-md p-7 sm:p-10">
        <ResetPasswordForm email={email ?? ""} />
      </div>
    </div>
  );
}
