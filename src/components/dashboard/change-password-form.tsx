"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validations/auth";
import { changePassword } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLabel as BaseFieldLabel } from "@/components/ui/form-field";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <BaseFieldLabel className="text-muted-foreground">{children}</BaseFieldLabel>;
}

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(values: ChangePasswordFormValues) {
    setError(null);
    setSuccess(false);
    try {
      await changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div>
        <FieldLabel>Current password</FieldLabel>
        <Input
          type="password"
          aria-invalid={!!errors.currentPassword}
          className="mt-1"
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>

      <div>
        <FieldLabel>New password</FieldLabel>
        <Input
          type="password"
          aria-invalid={!!errors.newPassword}
          className="mt-1"
          {...register("newPassword")}
        />
        <FieldError message={errors.newPassword?.message} />
      </div>

      <div>
        <FieldLabel>Confirm new password</FieldLabel>
        <Input
          type="password"
          aria-invalid={!!errors.confirmPassword}
          className="mt-1"
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-muted-foreground">Password updated.</p>}
    </form>
  );
}
