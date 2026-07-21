"use client";

import Link from "next/link";
import { useState } from "react";

import { useToast } from "@/lib/useToast";
import { forgotPassword } from "@/lib/userApiClient";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast("Please enter your email.", "error");
      return;
    }
    setSending(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Backend always returns 200 for this endpoint, but handle network errors gracefully.
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[400px] px-8 py-16">
        <div className="mb-6 text-center">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Reset your password
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">Forgot password</h2>
        </div>

        <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
          {sent ? (
            <p className="text-sm leading-[1.6] text-ink-soft">
              If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)}>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Email</label>
              <input
                className="mb-5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
          <p className="mt-3.5 text-center text-xs text-ink-soft">
            <Link href="/login" className="font-bold text-teal-700">Back to log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
