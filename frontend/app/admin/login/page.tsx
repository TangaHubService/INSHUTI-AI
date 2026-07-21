"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

import { login } from "@/lib/adminApiClient";
import { useToast } from "@/lib/useToast";
import { PasswordInput } from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

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
          Manage Inshuti with care.
        </h2>
        <p className="mt-[14px] max-w-[340px] text-[14.5px] leading-[1.6] text-[#9FC3BD]">
          Review content, monitor conversations, and keep answers accurate — access here is logged
          and restricted to authorized reviewers.
        </p>
      </div>
      <div className="flex items-center justify-center bg-paper p-10">
        <div className="w-full max-w-[380px]">
          <h2 className="mb-1.5 font-display text-[26px] text-teal-900">Admin sign in</h2>
          <p className="mb-7 text-sm text-ink-soft">
            Enter your credentials to access the Inshuti admin panel.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Email</label>
              <input
                className="w-full rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                type="email"
                placeholder="you@inshuti.rw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Password</label>
              <PasswordInput
                className="w-full rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <p className="mt-[18px] text-center text-xs text-ink-soft">
              Admin access is logged for security and safeguarding purposes.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
