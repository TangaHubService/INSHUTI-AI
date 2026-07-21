"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

import { logout, type AdminRole, type AdminUser } from "@/lib/adminApiClient";

const NAV_ITEMS: { href: string; label: string; icon: string; minRole?: AdminRole }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "i-grid" },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: "i-book", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/flagged", label: "Flagged Content", icon: "i-flag", minRole: "MODERATOR" },
  { href: "/admin/facilities", label: "Facilities", icon: "i-building", minRole: "CONTENT_REVIEWER" },
  { href: "/admin/users", label: "Users & Admins", icon: "i-users", minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", icon: "i-gear", minRole: "SUPER_ADMIN" },
];

const ROLE_RANK: Record<AdminRole, number> = { MODERATOR: 0, CONTENT_REVIEWER: 1, SUPER_ADMIN: 2 };
const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_REVIEWER: "Content Reviewer",
  MODERATOR: "Moderator",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminShell({
  active,
  admin,
  children,
}: {
  active: string;
  admin: AdminUser;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-paper-2">
      <aside className="sticky top-0 flex h-screen w-[250px] flex-shrink-0 flex-col bg-[var(--admin-bg)] px-4 py-[22px] text-[#DCEBE8]">
        <div className="flex items-center gap-2.5 px-2 pb-[26px]">
          <Logo size={26} />
          <span className="font-display text-[19px] font-bold text-white">Inshuti</span>
        </div>
        <nav className="flex flex-1 flex-col gap-[3px]">
          {NAV_ITEMS.map((item) => {
            const enabled = !item.minRole || ROLE_RANK[admin.role] >= ROLE_RANK[item.minRole];
            if (!enabled) return null;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[11px] rounded-[10px] px-3 py-[10px] text-sm font-semibold ${
                  isActive ? "bg-coral text-white" : "text-[#B7D6D1] hover:bg-[var(--admin-bg-2)] hover:text-white"
                }`}
              >
                <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-95" width="18" height="18">
                  <use href={`#${item.icon}`} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-2.5 flex items-center gap-2.5 border-t border-[var(--admin-line)] px-2.5 pt-[14px]">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-gold text-[13px] font-bold text-[#5A3E11]">
            {initials(admin.name)}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-white">{admin.name}</div>
            <div className="text-[11.5px] text-[#7FA79F]">{ROLE_LABEL[admin.role]}</div>
          </div>
          <button onClick={() => void handleLogout()} title="Log out">
            <svg width="16" height="16" className="cursor-pointer text-[#7FA79F]">
              <use href="#i-logout" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-line bg-white px-8 py-4">
          <div className="flex w-[320px] items-center gap-2 rounded-[10px] bg-paper-2 px-[14px] py-[9px] text-[13.5px] text-ink-soft">
            <svg width="16" height="16">
              <use href="#i-search" />
            </svg>
            Search conversations, topics, articles…
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-100 text-[13px] font-bold text-teal-700">
            {initials(admin.name)}
          </div>
        </div>
        <div className="px-8 pb-[60px] pt-7">{children}</div>
      </div>
    </div>
  );
}
