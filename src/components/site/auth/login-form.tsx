"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { login, verifyLoginOtp } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { HoverScale } from "@/components/site/hover-scale";
import { TextReveal } from "@/components/site/text-reveal";
import { BackLink } from "@/components/site/auth/back-link";
import { brand } from "@/data/brand";
import { FieldError, FieldLabel } from "@/components/ui/form-field";

const fieldClass =
  "mt-2 h-auto w-full rounded-none border-0 border-b border-foreground/30 bg-transparent px-0 pb-2 text-sm focus-visible:border-foreground focus-visible:ring-0 aria-invalid:ring-0";


export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Step 1: Credentials form
  const credForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Step 1: Submit email + password → get OTP sent
  async function onSubmitCredentials(values: LoginFormValues) {
    setError(null);
    try {
      const { email } = await login(values.email, values.password);
      setPendingEmail(email);
      setOtp("");
      setStep("otp");
      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  // Step 2: Submit OTP → get session cookies and redirect
  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setResendStatus(null);
    setIsVerifying(true);
    try {
      await verifyLoginOtp(pendingEmail, otp);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsVerifying(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    const email = credForm.getValues("email");
    const password = credForm.getValues("password");
    if (!email || !password) { setStep("credentials"); return; }
    setIsResending(true);
    setError(null);
    setResendStatus(null);
    try {
      await login(email, password);
      setOtp("");
      setResendStatus("A new verification code has been sent.");
      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => { setStep("credentials"); setError(null); setResendStatus(null); }}
          className="group mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to login
        </button>

        <div className="mb-5 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 w-fit px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="size-3.5 shrink-0" />
          <span>Credentials verified</span>
        </div>

        <h1 className="font-heading text-3xl leading-tight">Enter verification code</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A 6-digit code was sent to <strong>{pendingEmail}</strong>. It expires in 5 minutes.
        </p>

        <form onSubmit={onSubmitOtp} noValidate className="mt-8 flex flex-col gap-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <FieldLabel>6-digit code</FieldLabel>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCountdown > 0}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
              </button>
            </div>
            <OtpInput
              value={otp}
              onChange={setOtp}
              hasError={!!error}
              autoFocus
              disabled={isVerifying}
            />
            {resendStatus && (
              <p className="mt-3 text-xs text-emerald-600 font-medium">{resendStatus}</p>
            )}
          </div>

          <HoverScale className="block">
            <Button
              type="submit"
              disabled={isVerifying || otp.length < 6}
              className="h-auto w-full rounded-none bg-neutral-950 py-3 text-xs font-medium tracking-widest text-white uppercase hover:bg-neutral-800 disabled:opacity-50"
            >
              <TextReveal>{isVerifying ? "Verifying..." : "Verify & sign in"}</TextReveal>
            </Button>
          </HoverScale>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCountdown > 0}
              className="underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <BackLink href="/" label="Back to home" />
      <div className="mt-6 mb-8">
        <span className="text-brand-name block whitespace-nowrap">
          {brand.name.toUpperCase()}
        </span>
        <span className="block text-center text-[10px] tracking-[0.3em] text-muted-foreground">
          {brand.tagline.toUpperCase()}
        </span>
      </div>
      <h1 className="font-heading text-3xl leading-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage the store.
      </p>

      <form onSubmit={credForm.handleSubmit(onSubmitCredentials)} noValidate className="mt-8 flex flex-col gap-6">
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!credForm.formState.errors.email}
            className={fieldClass}
            {...credForm.register("email")}
          />
          <FieldError message={credForm.formState.errors.email?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <FieldLabel>Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              aria-invalid={!!credForm.formState.errors.password}
              className={`${fieldClass} pr-8`}
              {...credForm.register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 top-1/2 h-auto w-auto -translate-y-1/2 p-0 pb-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
          <FieldError message={credForm.formState.errors.password?.message} />
        </div>

        <HoverScale className="block">
          <Button
            type="submit"
            disabled={credForm.formState.isSubmitting}
            className="h-auto w-full rounded-none bg-neutral-950 py-3 text-xs font-medium tracking-widest text-white uppercase hover:bg-neutral-800"
          >
            <TextReveal>{credForm.formState.isSubmitting ? "Sending code…" : "Log in"}</TextReveal>
          </Button>
        </HoverScale>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

    </div>
  );
}
