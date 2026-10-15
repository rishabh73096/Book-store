"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { forgotPassword } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoverScale } from "@/components/site/hover-scale";
import { TextReveal } from "@/components/site/text-reveal";
import { BackLink } from "@/components/site/auth/back-link";

const fieldClass =
  "mt-2 h-11 w-full px-3 text-sm aria-invalid:border-destructive";

export function ForgotPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    try {
      await forgotPassword(values.email);
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <BackLink href="/login" label="Back to login" />
      <h1 className="font-heading text-3xl leading-tight">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a 6-digit code to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-6">
        <div>
          <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
            Email
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <HoverScale className="block">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full py-3 text-sm tracking-wide uppercase"
          >
            <TextReveal>Send code</TextReveal>
          </Button>
        </HoverScale>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
