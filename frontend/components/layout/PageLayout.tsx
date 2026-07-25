"use client";

import type { ReactNode } from "react";
import { SiteHeader, type NavItem } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PageLayout({
  children,
  activeHref,
  navItems,
  footerDisclaimer,
}: {
  children: ReactNode;
  activeHref: string;
  navItems: NavItem[];
  footerDisclaimer?: string;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader activeHref={activeHref} navItems={navItems} />
      <main className="mx-auto max-w-[1160px] px-5 sm:px-8">
        {children}
      </main>
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <SiteFooter disclaimer={footerDisclaimer} />
      </div>
    </div>
  );
}
