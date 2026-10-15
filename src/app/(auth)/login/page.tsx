import type { Metadata } from "next";
import { LoginForm } from "@/components/site/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Book Store account to manage orders and personal details.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
        <LoginForm />
    </div>
  );
}
