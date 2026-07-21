"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { NotificationBell } from "@/components/NotificationBell";
import type { Language } from "@/lib/apiClient";
import { getCurrentUser, updateProfile, type UserProfile } from "@/lib/userApiClient";

const ANONYMOUS_MODE_KEY = "inshuti_anonymous_mode";

const ROLE_LABEL: Record<string, string> = {
  TEENAGER: "Teenager / User",
  PARENT_GUARDIAN: "Parent / Guardian",
  HEALTHCARE_PROFESSIONAL: "Healthcare Professional",
  GOVERNMENT_USER: "Government User",
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>("EN");
  const [saving, setSaving] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);

  useEffect(() => {
    setAnonymousMode(localStorage.getItem(ANONYMOUS_MODE_KEY) !== "false");
    void getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        setName(u.name);
        setPhone(u.phone ?? "");
        setPreferredLanguage((u.preferredLanguage as Language) ?? "EN");
      }
    });
  }, []);

  function toggleAnonymousMode() {
    const next = !anonymousMode;
    setAnonymousMode(next);
    localStorage.setItem(ANONYMOUS_MODE_KEY, String(next));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, preferredLanguage });
      toast("Profile updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <svg className="inline-flex" width="34" height="34" viewBox="0 0 64 64">
              <use href="#mark-knot" />
            </svg>
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/" className="hover:text-teal-700">Home</Link>
            <Link href="/chat" className="hover:text-teal-700">Chat</Link>
            <Link href="/my-space" className="hover:text-teal-700">My Space</Link>
            <Link href="/appointments" className="hover:text-teal-700">Appointments</Link>
            <Link href="/consultations" className="hover:text-teal-700">Consultations</Link>
            <Link href="/notifications" className="hover:text-teal-700">Notifications</Link>
            <span className="text-teal-700">Profile</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
              {(["EN", "RW", "FR", "SW"] as const).map((lang) => (
                <span
                  key={lang}
                  className={`cursor-pointer rounded-full px-2.5 py-1.5 ${language === lang ? "bg-teal-700 text-white" : "text-teal-700"}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </span>
              ))}
            </div>
            {user && <NotificationBell />}
          </div>
        </header>

        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Profile
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">Your account</h1>
        </section>

        {user === undefined && <p className="pb-16 text-sm text-ink-soft">Loading…</p>}

        {user === null && (
          <div className="mb-16 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 text-center shadow-card">
            <p className="text-[14.5px] text-ink-soft">Log in to view your profile.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              Log in
            </Link>
          </div>
        )}

        {user && (
          <section className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.2fr_1fr]">
            <form onSubmit={(e) => void handleSave(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-[12px] font-bold text-teal-700">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
                <span className="text-[13px] text-ink-soft">{user.email}</span>
              </div>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Name</label>
              <input
                className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Phone (optional)</label>
              <input
                className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Preferred language</label>
              <select
                className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as Language)}
              >
                <option value="EN">English</option>
                <option value="RW">Kinyarwanda</option>
                <option value="FR">Français</option>
                <option value="SW">Kiswahili</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {user.role === "TEENAGER" && (
                <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
                  <h3 className="mb-2 text-base text-teal-900">Anonymous mode</h3>
                  <p className="mb-4 text-[13px] leading-[1.6] text-ink-soft">
                    When on, your chats aren&apos;t linked to this account and you won&apos;t be offered human follow-up —
                    the same private, anonymous flow as chatting without an account.
                  </p>
                  <button
                    type="button"
                    onClick={toggleAnonymousMode}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                      anonymousMode ? "bg-teal-100 text-teal-700" : "bg-gold-100 text-[#8A5E1E]"
                    }`}
                  >
                    Anonymous mode: {anonymousMode ? "On" : "Off"}
                  </button>
                </div>
              )}
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
                <h3 className="mb-2 text-base text-teal-900">Notifications</h3>
                <p className="mb-4 text-[13px] leading-[1.6] text-ink-soft">
                  Manage which channels you&apos;re notified on.
                </p>
                <Link href="/notifications" className="text-[13px] font-semibold text-teal-700">
                  Notification preferences →
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
