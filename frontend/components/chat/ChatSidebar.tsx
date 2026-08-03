"use client";

import Link from "next/link";

import { Logo } from "@/components/Logo";
import type { ConversationSummary } from "@/lib/apiClient";
import type { UserProfile } from "@/lib/userApiClient";

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  conversations: ConversationSummary[];
  user: UserProfile | null;
  search: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
}

const NAV_ITEMS = [
  ["/dashboard", "Dashboard", "i-grid"],
  ["/chat", "Chat", "i-chat"],
  ["/my-space", "My Space", "i-clock"],
  ["/appointments", "Appointments", "i-calendar"],
  ["/consultations", "Consultations", "i-stethoscope"],
  ["/facility-locator", "Find Care", "i-map-pin"],
  ["/notifications", "Notifications", "i-bell"],
  ["/profile", "Profile", "i-user-check"],
] as const;

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function ChatSidebar({ collapsed, onToggle, user }: ChatSidebarProps) {
  const name = user?.name ?? "Inshuti User";

  return (
    <aside className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-[#174843] bg-[linear-gradient(160deg,#063F3D_0%,#073331_55%,#052C2B_100%)] text-white ${collapsed ? "w-[72px]" : "w-[274px]"}`}>
      <div className={`flex h-[78px] items-center ${collapsed ? "justify-center" : "justify-between px-7"}`}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo size={38} />
          {!collapsed && <span className="font-display text-[27px] font-bold tracking-[-0.02em]">Inshuti</span>}
        </Link>
        {!collapsed && <button type="button" onClick={onToggle} aria-label="Collapse sidebar" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C4DEDA] hover:bg-white/10"><span className="text-2xl leading-none">«</span></button>}
      </div>

      <nav className="space-y-1 px-3 pt-2">
        {NAV_ITEMS.map(([href, label, icon]) => {
          const active = href === "/chat";
          return <Link key={href} href={href} title={label} className={`flex h-[47px] items-center rounded-xl transition ${collapsed ? "justify-center" : "gap-4 px-4"} ${active ? "bg-[linear-gradient(100deg,#F15E4F,#F47761)] text-white shadow-[0_7px_18px_rgba(241,94,79,.25)]" : "text-[#F1FAF8] hover:bg-white/8"}`}>
            <svg width="20" height="20" className="shrink-0"><use href={`#${icon}`} /></svg>
            {!collapsed && <span className="text-[15px] font-medium">{label}</span>}
          </Link>;
        })}
      </nav>

      <div className={`mt-auto ${collapsed ? "px-3" : "px-[18px]"}`}>
        {!collapsed && <div className="rounded-2xl border border-[#2B6761] bg-[#0A4541]/70 p-4">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4B64F] text-sm font-bold text-[#183F3A]">{initials(name)}</div><div className="min-w-0"><div className="truncate text-sm font-semibold">{name}</div><div className="mt-1 text-[10px] uppercase text-[#A9CBC6]">{user?.role.replaceAll("_", " ") ?? "Guest"}</div></div></div>
        </div>}
        {!collapsed && <div className="mb-7 mt-5 rounded-2xl bg-[#0A4541]/65 p-4"><h3 className="text-sm font-semibold">Need help now?</h3><p className="mt-2 text-[11px] text-[#C4DEDA]">You&apos;re not alone.</p><Link href="/facility-locator" className="mt-4 flex h-10 items-center justify-center rounded-xl bg-white text-[11px] font-semibold text-teal-900">Crisis Resources</Link></div>}
        {collapsed && <button type="button" onClick={onToggle} aria-label="Expand sidebar" className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">»</button>}
      </div>
    </aside>
  );
}
