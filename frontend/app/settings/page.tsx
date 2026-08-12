"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/Modal";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { clearHistory } from "@/lib/apiClient";
import { changeMyPassword, downloadMyData, getAppPreferences, updateAppPreferences, type AppPreferences } from "@/lib/userApiClient";
import { useRequireUser } from "@/lib/useUserAuth";
import { useToast } from "@/lib/useToast";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-teal-700" : "bg-[#CAD3D1]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

function Row({ icon, color, title, description, control }: { icon: string; color: string; title: string; description: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}15`, color }}><svg width="20" height="20"><use href={`#${icon}`} /></svg></span><span className="min-w-0 flex-1"><strong className="block text-xs">{title}</strong><span className="mt-1 block text-[10px] leading-4 text-ink-soft">{description}</span></span>{control}</div>;
}

function applyVisualPreferences(preferences: AppPreferences) {
  const root = document.documentElement;
  const dark = preferences.theme === "DARK" || (preferences.theme === "SYSTEM" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.classList.toggle("large-text", preferences.largeText);
  root.classList.toggle("reduce-motion", preferences.reducedMotion);
  root.classList.toggle("high-contrast", preferences.highContrast);
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useRequireUser();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => { if (user) void getAppPreferences().then(setPreferences).catch(() => toast("Could not load settings", "error")); }, [user, toast]);

  async function save(changes: Partial<AppPreferences>) {
    if (!preferences) return;
    const optimistic = { ...preferences, ...changes };
    setPreferences(optimistic); setSaving(true);
    try { const updated = await updateAppPreferences(changes); setPreferences(updated); applyVisualPreferences(updated); toast("Settings saved", "success"); }
    catch (error) { setPreferences(preferences); applyVisualPreferences(preferences); toast(error instanceof Error ? error.message : "Could not save settings", "error"); }
    finally { setSaving(false); }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (passwords.next.length < 8 || passwords.next !== passwords.confirm) { toast("New passwords must match and contain at least 8 characters", "error"); return; }
    try { await changeMyPassword(passwords.current, passwords.next); setPasswords({ current: "", next: "", confirm: "" }); setShowPassword(false); toast("Password changed", "success"); }
    catch (error) { toast(error instanceof Error ? error.message : "Could not change password", "error"); }
  }

  async function handleClear() { setConfirmClearOpen(false); try { await clearHistory(); toast("Chat history cleared", "success"); } catch { toast("Could not clear chat history", "error"); } }
  if (authLoading || !user) return <FullPageLoading />;

  return <AppShell active="/settings" session={{ kind: "user", user }}><div className="mx-auto max-w-[1080px] pb-14">
    <header><h1 className="text-[32px] font-bold">Settings</h1><p className="mt-1 text-sm text-ink-soft">Customize your experience and account preferences.</p></header>
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-1"><a href="#general" className="rounded-xl border border-teal-700 bg-teal-100 px-4 py-2 text-[11px] font-semibold text-teal-800">⚙ General</a><Link href="/notifications" className="rounded-xl border border-line bg-white px-4 py-2 text-[11px] font-semibold">♢ Notifications</Link><Link href="/profile" className="rounded-xl border border-line bg-white px-4 py-2 text-[11px] font-semibold">♙ Privacy & safety</Link><a href="#general" className="rounded-xl border border-line bg-white px-4 py-2 text-[11px] font-semibold">◎ Language</a><a href="#accessibility" className="rounded-xl border border-line bg-white px-4 py-2 text-[11px] font-semibold">◉ Accessibility</a></nav>
    {!preferences ? <PageLoading /> : <div className="mt-4 space-y-4">
      <section id="general" className="scroll-mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><h2 className="px-5 pt-4 text-sm font-bold">General preferences {saving && <span className="ml-2 text-[9px] font-normal text-ink-soft">Saving…</span>}</h2>
        <Row icon="i-globe" color="#8254E8" title="Theme" description="Choose your preferred appearance." control={<select value={preferences.theme} onChange={(e) => void save({ theme: e.target.value as AppPreferences["theme"] })} className="rounded-lg border border-line bg-white px-3 py-2 text-[11px]"><option value="LIGHT">Light</option><option value="DARK">Dark</option><option value="SYSTEM">Use device setting</option></select>} />
        <Row icon="i-chat" color="#249D70" title="Response style" description="Choose how Inshuti explains health information." control={<select value={preferences.responseStyle} onChange={(e) => void save({ responseStyle: e.target.value as AppPreferences["responseStyle"] })} className="rounded-lg border border-line bg-white px-3 py-2 text-[11px]"><option value="FRIENDLY">Friendly & supportive</option><option value="CONCISE">Short & direct</option><option value="DETAILED">Detailed</option></select>} />
        <Row icon="i-globe" color="#3B86D8" title="Auto-detect language" description="Allow chat to respond in the language you use." control={<Toggle label="Auto-detect language" checked={preferences.autoDetectLanguage} onChange={() => void save({ autoDetectLanguage: !preferences.autoDetectLanguage })} />} />
        <Row icon="i-chat" color="#F0A01E" title="Save conversations" description="Keep your conversations available in My Space on this device." control={<Toggle label="Save conversations" checked={preferences.saveConversations} onChange={() => void save({ saveConversations: !preferences.saveConversations })} />} />
        <Row icon="i-bell" color="#F05A7D" title="Health reminders" description="Allow optional health learning reminders." control={<Toggle label="Health reminders" checked={preferences.healthReminders} onChange={() => void save({ healthReminders: !preferences.healthReminders })} />} />
      </section>
      <section id="accessibility" className="scroll-mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><h2 className="px-5 pt-4 text-sm font-bold">Accessibility</h2>
        <Row icon="i-eye" color="#3B86D8" title="Larger text" description="Increase the interface font size." control={<Toggle label="Larger text" checked={preferences.largeText} onChange={() => void save({ largeText: !preferences.largeText })} />} />
        <Row icon="i-activity" color="#8956E8" title="Reduce motion" description="Reduce interface animation and movement." control={<Toggle label="Reduce motion" checked={preferences.reducedMotion} onChange={() => void save({ reducedMotion: !preferences.reducedMotion })} />} />
        <Row icon="i-eye" color="#E99B19" title="High contrast" description="Increase visual contrast for controls and text." control={<Toggle label="High contrast" checked={preferences.highContrast} onChange={() => void save({ highContrast: !preferences.highContrast })} />} />
      </section>
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><h2 className="px-5 pt-4 text-sm font-bold">Data & storage</h2><Row icon="i-trash" color="#F05268" title="Clear chat history" description="Remove anonymous AI conversations associated with this browser." control={<button onClick={() => setConfirmClearOpen(true)} className="rounded-lg border border-coral px-4 py-2 text-[11px] font-semibold text-coral-dark">Clear</button>} /><Row icon="i-download" color="#3986D7" title="Export my data" description="Download a JSON copy of the account data stored by Inshuti." control={<button onClick={() => void downloadMyData().catch(() => toast("Could not export data", "error"))} className="rounded-lg border border-teal-700 px-4 py-2 text-[11px] font-semibold text-teal-700">Export</button>} /></section>
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><h2 className="px-5 pt-4 text-sm font-bold">Account</h2><Row icon="i-lock" color="#8956E8" title="Change password" description="Verify your current password before choosing a new one." control={<button onClick={() => setShowPassword((value) => !value)} className="text-xl text-ink-soft">›</button>} />{showPassword && <form onSubmit={(event) => void changePassword(event)} className="grid gap-3 border-t border-line bg-paper-2 p-5 sm:grid-cols-3"><input type="password" required placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="rounded-lg border border-line bg-white px-3 py-2 text-xs" /><input type="password" required placeholder="New password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className="rounded-lg border border-line bg-white px-3 py-2 text-xs" /><input type="password" required placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="rounded-lg border border-line bg-white px-3 py-2 text-xs" /><button className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white sm:col-span-3">Change password</button></form>}</section>
      <section className="flex items-center gap-4 rounded-2xl border border-[#CDE5DF] bg-[#EFF9F6] p-5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D8F1E8] text-success"><svg width="21" height="21"><use href="#i-lock" /></svg></span><div><h2 className="text-sm font-bold">Your privacy matters</h2><p className="mt-1 text-[10px] text-ink-soft">Your settings are stored securely on your account and can be changed at any time.</p></div><Link href="/privacy" className="ml-auto text-[11px] font-semibold text-teal-700">Learn more →</Link></section>
    </div>}
    <ConfirmModal
      open={confirmClearOpen}
      title="Clear chat history"
      message="Clear the anonymous chat history stored for this browser?"
      confirmLabel="Clear"
      cancelLabel="Cancel"
      variant="danger"
      onConfirm={() => void handleClear()}
      onCancel={() => setConfirmClearOpen(false)}
    />
  </div></AppShell>;
}
