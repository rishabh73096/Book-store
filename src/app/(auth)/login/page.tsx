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
    <div className="zine-auth flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="zine-card w-full max-w-md p-7 sm:p-10">
          <LoginForm />
        </div>
    </div>
  );
}
