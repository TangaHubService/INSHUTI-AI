"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useToast } from "@/lib/useToast";
import { resetPassword } from "@/lib/userApiClient";
import { PasswordInput } from "@/components/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !token) {
      toast("This reset link is invalid. Please request a new one.", "error");
      return;
    }
    if (password.length < 8) {
      toast("Password must be at least 8 characters.", "error");
      return;
    }
    if (password !== confirm) {
      toast("Passwords don't match.", "error");
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
          <Link href="/forgot-password" className="font-bold text-teal-700">Request a new one</Link>.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)}>
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">New password</label>
          <PasswordInput
            className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Confirm password</label>
          <PasswordInput
            className="mb-5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
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
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[400px] px-8 py-16">
        <div className="mb-6 text-center">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Choose a new password
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">Reset password</h2>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-ink-soft">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
