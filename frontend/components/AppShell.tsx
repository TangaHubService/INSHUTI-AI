"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { logout as logoutAdmin, type AdminRole, type AdminUser } from "@/lib/adminApiClient";
import { logoutUser, type UserProfile, type UserRole } from "@/lib/userApiClient";

export type AppSession = { kind: "admin"; admin: AdminUser } | { kind: "user"; user: UserProfile };

const ADMIN_NAV_ITEMS: { href: string; label: string; icon: string; minRole?: AdminRole }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "i-grid" },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: "i-book", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/flagged", label: "Flagged Content", icon: "i-flag", minRole: "MODERATOR" },
  { href: "/admin/facilities", label: "Facilities", icon: "i-building", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/users", label: "Users & Admins", icon: "i-users", minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", icon: "i-gear", minRole: "SUPER_ADMIN" },
];

const ADMIN_ROLE_RANK: Record<AdminRole, number> = { MODERATOR: 0, CONTENT_REVIEWER: 1, SUPER_ADMIN: 2 };
const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_REVIEWER: "Content Reviewer",
  MODERATOR: "Moderator",
};

function userNavItems(role: UserRole, nav: (typeof NAV)["EN"]): { href: string; label: string; icon: string }[] {
  switch (role) {
    case "PARENT_GUARDIAN":
      return [
        { href: "/parent", label: nav.dashboard, icon: "i-grid" },
        { href: "/chat", label: nav.chat, icon: "i-chat" },
        { href: "/appointments", label: nav.appointments, icon: "i-calendar" },
        { href: "/facility-locator", label: nav.findCare, icon: "i-map-pin" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
      ];
    case "HEALTHCARE_PROFESSIONAL":
      return [
        { href: "/professional", label: nav.dashboard, icon: "i-grid" },
        { href: "/consultations", label: nav.consultations, icon: "i-stethoscope" },
        { href: "/appointments", label: nav.appointments, icon: "i-calendar" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
      ];
    case "GOVERNMENT_USER":
      return [
        { href: "/government", label: nav.dashboard, icon: "i-grid" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
      ];
    default:
      return [
        { href: "/dashboard", label: nav.dashboard, icon: "i-grid" },
        { href: "/chat", label: nav.chat, icon: "i-chat" },
        { href: "/my-space", label: nav.mySpace, icon: "i-clock" },
        { href: "/appointments", label: nav.appointments, icon: "i-calendar" },
        { href: "/consultations", label: nav.consultations, icon: "i-stethoscope" },
        { href: "/facility-locator", label: nav.findCare, icon: "i-map-pin" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
      ];
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const COLLAPSE_KEY = "inshuti_sidebar_collapsed";

export function AppShell({
  active,
  session,
  children,
  flush = false,
}: {
  active: string;
  session: AppSession;
  children: React.ReactNode;
  /** Skip the default content padding for pages that manage their own full-bleed layout (e.g. chat). */
  flush?: boolean;
}) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const nav = NAV[language];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, String(next));
  }

  async function handleLogout() {
    if (session.kind === "admin") {
      await logoutAdmin();
    } else {
      await logoutUser();
    }
    router.replace("/admin/login");
  }

  const name = session.kind === "admin" ? session.admin.name : session.user.name;
  const roleLabel = session.kind === "admin" ? ADMIN_ROLE_LABEL[session.admin.role] : undefined;
  const navItems =
    session.kind === "admin"
      ? ADMIN_NAV_ITEMS.filter(
          (item) => !item.minRole || ADMIN_ROLE_RANK[session.admin.role] >= ADMIN_ROLE_RANK[item.minRole],
        )
      : userNavItems(session.user.role, nav);

  return (
    <div className="flex min-h-screen bg-paper-2">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed top-0 z-50 flex h-screen w-[250px] flex-shrink-0 flex-col bg-[var(--admin-bg)] px-4 py-[22px] text-[#DCEBE8] transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-[250px]"}`}
      >
        <div
          className={`flex items-center pb-[26px] px-2 ${collapsed ? "flex-col gap-2" : "justify-between gap-2.5"}`}
        >
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            {!collapsed && <span className="font-display text-[19px] font-bold text-white">Inshuti</span>}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] text-[#7FA79F] hover:bg-[var(--admin-bg-2)] hover:text-white lg:flex"
          >
            <svg width="14" height="14" className={`transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`}>
              <use href="#i-chevron-down" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-[3px]">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-[11px] rounded-[10px] px-3 py-[10px] text-sm font-semibold ${
                  isActive ? "bg-coral text-white" : "text-[#B7D6D1] hover:bg-[var(--admin-bg-2)] hover:text-white"
                }`}
              >
                <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-95" width="18" height="18">
                  <use href={`#${item.icon}`} />
                </svg>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-2.5 flex items-center gap-2.5 border-t border-[var(--admin-line)] px-2.5 pt-[14px]">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-gold text-[13px] font-bold text-[#5A3E11]">
            {initials(name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-bold text-white">{name}</div>
              {roleLabel && <div className="text-[11.5px] text-[#7FA79F]">{roleLabel}</div>}
            </div>
          )}
          <button onClick={() => void handleLogout()} title="Log out">
            <svg width="16" height="16" className="cursor-pointer text-[#7FA79F]">
              <use href="#i-logout" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-teal-900 lg:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18">
              <use href={mobileOpen ? "#i-close" : "#i-menu"} />
            </svg>
          </button>
          {session.kind === "admin" ? (
            <div className="hidden w-[320px] items-center gap-2 rounded-[10px] bg-paper-2 px-[14px] py-[9px] text-[13.5px] text-ink-soft lg:flex">
              <svg width="16" height="16">
                <use href="#i-search" />
              </svg>
              Search conversations, topics, articles…
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="flex items-center gap-3">
            {session.kind === "user" && <LanguageSwitcher value={language} onChange={setLanguage} />}
            {session.kind === "user" && <NotificationBell />}
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-100 text-[13px] font-bold text-teal-700">
              {initials(name)}
            </div>
          </div>
        </div>
        {flush ? <div className="flex flex-1 flex-col">{children}</div> : <div className="px-5 pb-[60px] pt-7 sm:px-8">{children}</div>}
      </div>
    </div>
  );
}
