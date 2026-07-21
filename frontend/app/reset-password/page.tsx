"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useToast } from "@/lib/useToast";
import { resetPassword } from "@/lib/userApiClient";
import { PasswordInput } from "@/components/PasswordInput";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
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
      router.push("/login");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset password", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
      {!email || !token ? (
        <p className="text-sm leading-[1.6] text-ink-soft">
          This reset link is missing or invalid.{" "}
          <Link href="/forgot-password" className="font-bold text-teal-700 hover:text-teal-900">Request a new one</Link>.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)}>
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">New password</label>
          <PasswordInput
            className={`${INPUT_BASE} ${errors.password ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.password}</p>

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Confirm password</label>
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
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[400px] px-8 py-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft transition hover:text-teal-700"
        >
          <svg width="16" height="16"><use href="#i-back" /></svg>
          Back
        </button>
        <div className="mb-6 text-center">
          <Link href="/" className="mb-5 inline-flex items-center justify-center gap-2">
            <Logo size={34} />
            <span className="font-display text-xl font-bold text-teal-900">Inshuti</span>
          </Link>
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Choose a new password
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">Reset password</h2>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-ink-soft">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
        <SiteFooter />
      </div>
    </div>
  );
}
