"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { verifyOtp, resetPassword, forgotPassword } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { HoverScale } from "@/components/site/hover-scale";
import { TextReveal } from "@/components/site/text-reveal";
import { BackLink } from "@/components/site/auth/back-link";

const fieldClass =
  "mt-2 h-auto w-full rounded-none border-0 border-b border-foreground/30 bg-transparent px-0 pb-2 text-sm focus-visible:border-foreground focus-visible:ring-0 aria-invalid:ring-0";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [verifiedEmail, setVerifiedEmail] = useState(email);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState(email);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form for Step 2 (Password Reset)
  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  async function handleResendOtp() {
    if (!otpEmail) {
      setError("Please enter your admin email to resend code.");
      return;
    }
    setIsResending(true);
    setError(null);
    setResendStatus(null);
    try {
      const res = await forgotPassword(otpEmail);
      setOtp("");
      setResendStatus(res.message || "A new 6-digit code has been sent to your email.");
      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setResendStatus(null);
    setIsVerifyingOtp(true);
    try {
      await verifyOtp(otpEmail, otp);
      setVerifiedEmail(otpEmail);
      setVerifiedOtp(otp);
      passwordForm.setValue("email", otpEmail);
      passwordForm.setValue("otp", otp);
      setStep("password");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function onResetPassword(values: ResetPasswordFormValues) {
    setError(null);
    try {
      await resetPassword(verifiedEmail, verifiedOtp, values.password, values.confirmPassword);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      {step === "otp" ? (
        <>
          <BackLink href="/forgot-password" label="Back to forgot password" />
          <h1 className="font-heading text-3xl leading-tight">Enter your code</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to your registered admin email.
          </p>

          <form onSubmit={onVerifyOtp} noValidate className="mt-8 flex flex-col gap-6">
            <div>
              <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                  6-digit code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
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
                disabled={isVerifyingOtp}
              />
              {resendStatus && (
                <p className="mt-3 text-xs text-emerald-600 font-medium">{resendStatus}</p>
              )}
            </div>

            <HoverScale className="block">
              <Button
                type="submit"
                disabled={isVerifyingOtp || otp.length < 6}
                className="h-auto w-full rounded-none bg-neutral-950 py-3 text-xs font-medium tracking-widest text-white uppercase hover:bg-neutral-800 disabled:opacity-50"
              >
                <TextReveal>{isVerifyingOtp ? "Verifying..." : "Verify code"}</TextReveal>
              </Button>
            </HoverScale>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Didn&apos;t receive code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || resendCountdown > 0}
                className="underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
              </button>
            </p>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("otp");
              setError(null);
            }}
            className="group mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to code verification
          </button>

          <div className="mb-5 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 w-fit px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>Code verified for {verifiedEmail}</span>
          </div>

          <h1 className="font-heading text-3xl leading-tight">Create new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong new password for your administration account.
          </p>

          <form
            onSubmit={passwordForm.handleSubmit(onResetPassword)}
            noValidate
            className="mt-8 flex flex-col gap-6"
          >
            <div>
              <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                New password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!passwordForm.formState.errors.password}
                  className={`${fieldClass} pr-8`}
                  {...passwordForm.register("password")}
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
              {passwordForm.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                  className={`${fieldClass} pr-8`}
                  {...passwordForm.register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 h-auto w-auto -translate-y-1/2 p-0 pb-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <HoverScale className="block">
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting || done}
                className="h-auto w-full rounded-none bg-neutral-950 py-3 text-xs font-medium tracking-widest text-white uppercase hover:bg-neutral-800"
              >
                <TextReveal>{done ? "Password updated" : "Reset password"}</TextReveal>
              </Button>
            </HoverScale>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {done && (
              <p className="text-sm text-emerald-600 font-medium">
                Password updated successfully! Redirecting you to log in…
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
