import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/site/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="zine-auth flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="zine-card w-full max-w-md p-7 sm:p-10">
          <ForgotPasswordForm />
        </div>
    </div>
  );
}
