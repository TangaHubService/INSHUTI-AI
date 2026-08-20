"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { PrivateMessagesBell } from "@/components/PrivateMessagesBell";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { logout as logoutAdmin, type AdminRole, type AdminUser } from "@/lib/adminApiClient";
import { getAppPreferences, logoutUser, type UserProfile, type UserRole } from "@/lib/userApiClient";

export type AppSession = { kind: "admin"; admin: AdminUser } | { kind: "user"; user: UserProfile };

const ADMIN_NAV_ITEMS: { href: string; label: string; icon: string; minRole?: AdminRole }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "i-grid" },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: "i-book", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/health-education", label: "Health Education", icon: "i-file", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/consultations", label: "Consultation Oversight", icon: "i-stethoscope", minRole: "MODERATOR" },
  { href: "/admin/flagged", label: "Flagged Content", icon: "i-flag", minRole: "MODERATOR" },
  { href: "/admin/facilities", label: "Facilities", icon: "i-building", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/users", label: "Users & Admins", icon: "i-users", minRole: "SUPER_ADMIN" },
  { href: "/admin/reports", label: "Reports", icon: "i-download", minRole: "SUPER_ADMIN" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "i-clock", minRole: "SUPER_ADMIN" },
  { href: "/admin/monitoring", label: "Monitoring", icon: "i-activity", minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", icon: "i-gear", minRole: "SUPER_ADMIN" },
];

const ADMIN_ROLE_RANK: Record<AdminRole, number> = { MODERATOR: 0, CONTENT_REVIEWER: 1, SUPER_ADMIN: 2 };
const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_REVIEWER: "Content Reviewer",
  MODERATOR: "Moderator",
};

type UserNavItem = { href: string; label: string; icon: string; badge?: number };

function userNavItems(role: UserRole, nav: (typeof NAV)["EN"]): UserNavItem[] {
  switch (role) {
    case "PARENT_GUARDIAN":
      return [
        { href: "/parent", label: nav.dashboard, icon: "i-grid" },
        { href: "/chat", label: nav.chat, icon: "i-chat" },
        { href: "/appointments", label: nav.appointments, icon: "i-calendar" },
        { href: "/facility-locator", label: nav.findCare, icon: "i-map-pin" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
        { href: "/settings", label: "Settings", icon: "i-gear" },
        { href: "/help-resources", label: "Help & Resources", icon: "i-file" },
      ];
    case "HEALTHCARE_PROFESSIONAL":
      return [
        { href: "/professional", label: nav.dashboard, icon: "i-grid" },
        { href: "/consultations", label: nav.consultations, icon: "i-stethoscope" },
        { href: "/appointments", label: nav.appointments, icon: "i-calendar" },
        { href: "/consultations?view=messages", label: "Messages", icon: "i-chat" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/library", label: "Knowledge Base", icon: "i-book" },
        { href: "/settings", label: "Settings", icon: "i-gear" },
        { href: "/help-resources", label: "Help & Resources", icon: "i-file" },
      ];
    case "GOVERNMENT_USER":
      return [
        { href: "/government", label: nav.dashboard, icon: "i-grid" },
        { href: "/notifications", label: nav.notifications, icon: "i-bell" },
        { href: "/profile", label: nav.profile, icon: "i-user-check" },
        { href: "/settings", label: "Settings", icon: "i-gear" },
        { href: "/help-resources", label: "Help & Resources", icon: "i-file" },
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
        { href: "/settings", label: "Settings", icon: "i-gear" },
        { href: "/help-resources", label: "Help & Resources", icon: "i-file" },
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

  useEffect(() => {
    if (session.kind !== "user") return;
    void getAppPreferences().then((preferences) => {
      const root = document.documentElement;
      const dark = preferences.theme === "DARK" || (preferences.theme === "SYSTEM" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
      root.classList.toggle("large-text", preferences.largeText);
      root.classList.toggle("reduce-motion", preferences.reducedMotion);
      root.classList.toggle("high-contrast", preferences.highContrast);
    }).catch(() => {});
  }, [session]);

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
  const roleLabel = session.kind === "admin"
    ? ADMIN_ROLE_LABEL[session.admin.role]
    : session.user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const navItems: UserNavItem[] = [
    { href: "/", label: nav.home, icon: "i-home" },
    ...(session.kind === "admin"
      ? ADMIN_NAV_ITEMS.filter(
          (item) => !item.minRole || ADMIN_ROLE_RANK[session.admin.role] >= ADMIN_ROLE_RANK[item.minRole],
        )
      : userNavItems(session.user.role, nav)),
  ];
  const isProfessional = session.kind === "user" && session.user.role === "HEALTHCARE_PROFESSIONAL";

  return (
    <div className={`flex min-h-screen ${isProfessional ? "bg-[#FAF9F7]" : "bg-paper-2"}`}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed top-0 z-50 flex h-screen w-[260px] flex-shrink-0 flex-col overflow-y-auto px-4 py-[22px] text-[#DCEBE8] transition-all duration-300 ease-out lg:sticky lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-[260px]"} ${
          isProfessional
            ? "bg-[radial-gradient(circle_at_20%_84%,#0A5A54_0%,#034C47_33%,#053C39_76%,#062F2D_100%)]"
            : "bg-[var(--admin-bg)]"
        }`}
      >
        <div
          className={`flex items-center px-2 ${isProfessional ? "pb-[30px]" : "pb-[26px]"} ${collapsed ? "flex-col gap-2" : "justify-between gap-2.5"}`}
        >
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85" title={nav.home}>
            <Logo size={isProfessional ? 34 : 26} />
            {!collapsed && <span className={`font-display font-bold text-white ${isProfessional ? "text-[24px]" : "text-[19px]"}`}>Inshuti</span>}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[#7FA79F] hover:bg-[var(--admin-bg-2)] hover:text-white lg:flex transition-colors"
          >
            <svg width="14" height="14" className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : "rotate-90"}`}>
              <use href="#i-chevron-down" />
            </svg>
          </button>
        </div>
        <nav className={`flex flex-1 flex-col ${isProfessional ? "gap-[5px]" : "gap-[3px]"}`}>
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={(event) => {
                  if (item.href === "/consultations?view=messages") {
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent("private-messages:open", { detail: {} }));
                  }
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-[11px] rounded-[var(--radius-sm)] px-3 text-sm font-semibold transition-all duration-150 ${isProfessional ? "py-[11px]" : "py-[10px]"} ${
                  isActive
                    ? isProfessional
                      ? "bg-gradient-to-r from-[#FF604F] to-[#F35649] text-white shadow-[0_7px_18px_rgba(238,76,61,0.2)]"
                      : "bg-coral text-white shadow-sm"
                    : "text-[#B7D6D1] hover:bg-[var(--admin-bg-2)] hover:text-white"
                }`}
              >
                <svg className="h-[18px] w-[18px] flex-shrink-0" width="18" height="18">
                  <use href={`#${item.icon}`} />
                </svg>
                {!collapsed && <span className="min-w-0 flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F05B4D] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={`mt-2.5 flex items-center gap-2.5 border-t border-[var(--admin-line)] px-2.5 ${isProfessional ? "py-[17px]" : "pt-[14px]"}`}>
          <div className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gold font-bold text-white ${isProfessional ? "h-[46px] w-[46px] text-[16px]" : "h-[34px] w-[34px] text-[13px] text-[#5A3E11]"}`}>
            {initials(name)}
          </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold text-white">{name}</div>
                  <div className={`${isProfessional ? "mt-0.5 text-[9.5px] uppercase leading-[14px] text-[#B9D7D2]" : "text-[11.5px] text-[#7FA79F]"}`}>{roleLabel}</div>
                </div>
              )}
          <button onClick={() => void handleLogout()} title="Log out" className="transition-opacity hover:opacity-80">
            <svg width="16" height="16" className="cursor-pointer text-[#7FA79F]">
              <use href="#i-logout" />
            </svg>
          </button>
        </div>
        {isProfessional && !collapsed && (
          <div className="mt-0 border-t border-[#1A5D57] pt-[17px]">
            <div className="rounded-xl border border-[#17625C] bg-[#084B47]/70 p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
              <div className="text-[13px] font-bold text-white">Quick Help</div>
              <div className="mt-4 flex items-center gap-2 text-[10.5px] text-[#C3DAD6]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2B7D75] text-white">
                  <svg width="16" height="16"><use href="#i-phone" /></svg>
                </span>
                <span>Need immediate support?</span>
              </div>
              <Link href="/help-resources" className="mt-4 flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#FF6150] to-[#F35448] text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(238,76,61,0.2)]">
                Crisis Resources
              </Link>
            </div>
          </div>
        )}
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className={`flex items-center justify-between border-b border-line bg-white px-5 sm:px-8 ${isProfessional ? "h-[66px] py-[10px]" : "py-4"}`}>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-teal-900 hover:bg-paper-2 transition-colors lg:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18">
              <use href={mobileOpen ? "#i-close" : "#i-menu"} />
            </svg>
          </button>
          {session.kind === "admin" ? (
            <Link href="/admin/search" className="hidden w-[320px] items-center gap-2 rounded-[var(--radius-sm)] bg-paper-2 px-[14px] py-[9px] text-[13.5px] text-ink-soft lg:flex">
              <svg width="16" height="16">
                <use href="#i-search" />
              </svg>
              Search conversations, topics, articles…
            </Link>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="flex items-center gap-3">
            {session.kind === "user" && <LanguageSwitcher value={language} onChange={setLanguage} />}
            {session.kind === "user" && <PrivateMessagesBell role={session.user.role} />}
            {session.kind === "user" && <NotificationBell />}
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700 ${isProfessional ? "h-[40px] w-[40px] text-[14px]" : "h-[34px] w-[34px] text-[13px]"}`}>
                {initials(name)}
              </div>
              <div className="hidden text-left text-sm sm:block">
                <div className="font-semibold text-ink">{name}</div>
                <div className={`${isProfessional ? "text-[9.5px] uppercase text-ink-soft" : "text-[11px] text-ink-soft"}`}>{roleLabel}</div>
              </div>
            </div>
          </div>
        </div>
        {flush ? (
          <div className="flex flex-1 flex-col">{children}</div>
        ) : (
          <div className={`flex-1 px-5 pb-[60px] sm:px-8 ${isProfessional ? "pt-[27px]" : "pt-7"}`}>{children}</div>
        )}
      </div>
    </div>
  );
}
