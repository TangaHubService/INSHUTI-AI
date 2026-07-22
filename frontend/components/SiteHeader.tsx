"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { dashboardPathForRole, getCurrentUser, logoutUser, type UserProfile } from "@/lib/userApiClient";

export type NavItem = { href: string; label: string };

// These pages are meaningless while logged out (they immediately show a
// "log in" gate), so the tab only appears once a session is confirmed.
const AUTH_ONLY_HREFS = new Set(["/profile"]);

// Keyed by route so every page's nav gets a consistent icon without having to
// pass one in — icons stay readable even when a translated label runs long
// (e.g. Kinyarwanda/French) and would otherwise crowd out its neighbors.
const NAV_ICON: Record<string, string> = {
  "/": "i-home",
  "/chat": "i-chat",
  "/my-space": "i-clock",
  "/appointments": "i-calendar",
  "/consultations": "i-stethoscope",
  "/notifications": "i-bell",
  "/profile": "i-user-check",
  "/facility-locator": "i-map-pin",
};

const GO_TO_DASHBOARD_LABEL: Record<string, string> = {
  EN: "Go to Dashboard",
  RW: "Jya ku Kibaho",
  FR: "Aller au Tableau de bord",
  SW: "Nenda kwa Dashibodi",
};

const GO_TO_CHAT_LABEL: Record<string, string> = {
  EN: "Go to Chat",
  RW: "Jya ku Kiganiro",
  FR: "Aller au Chat",
  SW: "Nenda kwa Mazungumzo",
};

const LOG_OUT_LABEL: Record<string, string> = {
  EN: "Log out",
  RW: "Sohoka",
  FR: "Déconnexion",
  SW: "Toka",
};

export function SiteHeader({
  navItems,
  activeHref,
  extraActions,
}: {
  navItems: NavItem[];
  activeHref: string;
  extraActions?: ReactNode;
}) {
  const { language, setLanguage } = useLanguage();
  const nav = NAV[language];
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) => !AUTH_ONLY_HREFS.has(item.href) || !!user);

  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    setMenuOpen(false);
  }

  const authArea = (
    <>
      {user && <NotificationBell />}
      {user ? (
        <>
          <Link
            href={dashboardPathForRole(user.role)}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 transition hover:-translate-y-px hover:bg-teal-100"
          >
            {user.role === "HEALTHCARE_PROFESSIONAL" || user.role === "GOVERNMENT_USER"
              ? GO_TO_DASHBOARD_LABEL[language]
              : GO_TO_CHAT_LABEL[language]}
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
          >
            {LOG_OUT_LABEL[language]}
          </button>
        </>
      ) : user === null ? (
        <>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 transition hover:-translate-y-px hover:bg-teal-100"
          >
            {nav.register}
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
          >
            {nav.logIn}
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-4 sm:px-8 sm:py-[22px]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={30} />
          <span className="font-display text-lg font-bold text-teal-900 sm:text-[22px]">Inshuti</span>
        </Link>

        <nav className="no-scrollbar hidden min-w-0 flex-1 items-center justify-center gap-5 overflow-x-auto text-[14px] font-semibold text-ink-soft lg:flex xl:gap-7 xl:text-[14.5px]">
          {visibleNavItems.map((item) => {
            const icon = NAV_ICON[item.href];
            const content = (
              <>
                {icon && (
                  <svg width="15" height="15" className="shrink-0">
                    <use href={`#${icon}`} />
                  </svg>
                )}
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            );
            return item.href === activeHref ? (
              <span key={item.href} className="flex shrink-0 items-center gap-1.5 text-teal-700">
                {content}
              </span>
            ) : (
              <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-1.5 hover:text-teal-700">
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <LanguageSwitcher value={language} onChange={setLanguage} />
          {extraActions}
          {authArea}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-teal-900 lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18">
            <use href={menuOpen ? "#i-close" : "#i-menu"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-paper px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 text-[15px] font-semibold text-ink-soft">
            {visibleNavItems.map((item) => {
              const icon = NAV_ICON[item.href];
              const content = (
                <>
                  {icon && (
                    <svg width="16" height="16" className="shrink-0">
                      <use href={`#${icon}`} />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </>
              );
              return item.href === activeHref ? (
                <span key={item.href} className="flex items-center gap-2 text-teal-700">
                  {content}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  {content}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <LanguageSwitcher value={language} onChange={setLanguage} />
            {extraActions}
            {authArea}
          </div>
        </div>
      )}
    </header>
  );
}
