"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useToast } from "@/lib/useToast";
import { resetPassword } from "@/lib/userApiClient";
import { PasswordInput } from "@/components/PasswordInput";
import { Logo } from "@/components/Logo";
import { isStrongPassword } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";

const INPUT_BASE =
  "w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-100";

function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const v = VALIDATION.EN;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!password) next.password = v.required;
    else if (!isStrongPassword(password)) next.password = v.weakPassword;
    if (!confirm) next.confirm = v.required;
    else if (password !== confirm) next.confirm = v.passwordMismatch;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !token) {
      toast("This reset link is invalid. Please request a new one.", "error");
      return;
    }
    if (!validate()) {
      toast(v.fixErrors, "error");
      return;
    }
    setSending(true);
    try {
      await resetPassword(email, token, password);
      toast("Password reset. Please log in.", "success");
      router.push("/admin/login");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset password", "error");
    } finally {
      setSending(false);
    }
  }

  if (!email || !token) {
    return (
      <p className="text-sm leading-[1.6] text-ink-soft">
        This reset link is missing or invalid.{" "}
        <Link href="/forgot-password" className="font-bold text-teal-700 hover:text-teal-900">Request a new one</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">New password</label>
      <PasswordInput
        className={`${INPUT_BASE} ${errors.password ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.password}</p>

      <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Confirm password</label>
      <PasswordInput
        className={`${INPUT_BASE} ${errors.confirm ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <p className="mb-3.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.confirm}</p>

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
      >
        {sending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden flex-col justify-center overflow-hidden bg-[var(--admin-bg)] p-[70px] md:flex">
        <svg
          className="absolute -right-[60px] -top-10 w-[340px] opacity-[0.18]"
          viewBox="0 0 64 64"
        >
          <use href="#mark-knot" />
        </svg>
        <Logo size={40} className="mb-[26px]" />
        <h2 className="max-w-[360px] font-display text-[30px] leading-[1.2] text-white">
          Choose a new password.
        </h2>
        <p className="mt-[14px] max-w-[340px] text-[14.5px] leading-[1.6] text-[#9FC3BD]">
          Pick something strong you haven&apos;t used here before, and you&apos;ll be right back in.
        </p>
      </div>
      <div className="flex items-center justify-center bg-paper p-10">
        <div className="w-full max-w-[380px]">
          <h2 className="mb-7 font-display text-[26px] text-teal-900">Reset password</h2>
          <Suspense fallback={<p className="text-center text-sm text-ink-soft">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
