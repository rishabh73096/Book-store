import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/site/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
        <ForgotPasswordForm />
    </div>
  );
}
