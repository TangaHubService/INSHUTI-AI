"use client";

import type { ReactNode } from "react";
import { SiteHeader, type NavItem } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PageLayout({
  children,
  activeHref,
  navItems,
  footerDisclaimer,
  contained = true,
}: {
  children: ReactNode;
  activeHref: string;
  navItems: NavItem[];
  footerDisclaimer?: string;
  contained?: boolean;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader activeHref={activeHref} navItems={navItems} />
      <main className={contained ? "mx-auto w-full max-w-[1160px] px-5 sm:px-8" : "w-full"}>
        {children}
      </main>
      <SiteFooter disclaimer={footerDisclaimer} />
    </div>
  );
}
