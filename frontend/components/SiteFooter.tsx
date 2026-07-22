"use client";

import Link from "next/link";

import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/LanguageContext";
import { FOOTER } from "@/lib/i18nCommon";

export function SiteFooter({ disclaimer }: { disclaimer?: string }) {
  const { language } = useLanguage();
  const footer = FOOTER[language];

  return (
    <footer className="border-t border-line py-9">
      <div className="flex flex-wrap items-center justify-between gap-[14px]">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="font-display text-[17px] font-bold text-teal-900">Inshuti</span>
        </div>
        <div className="flex gap-[22px] text-[13.5px] font-semibold text-ink-soft">
          <a href="#" className="hover:text-teal-700">{footer.privacy}</a>
          <a href="#" className="hover:text-teal-700">{footer.terms}</a>
          <Link href="/admin/login" className="hover:text-teal-700">{footer.login}</Link>
        </div>
      </div>
      {disclaimer && <p className="mt-4 max-w-[640px] text-[12.5px] leading-[1.6] text-ink-soft">{disclaimer}</p>}
    </footer>
  );
}
