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
        <div className="flex flex-wrap gap-x-[22px] gap-y-2 text-[13.5px] font-semibold text-ink-soft">
          <Link href="/about" className="transition-colors duration-150 hover:text-teal-700">{footer.about}</Link>
          <Link href="/services" className="transition-colors duration-150 hover:text-teal-700">{footer.services}</Link>
          <Link href="/library" className="transition-colors duration-150 hover:text-teal-700">{footer.library}</Link>
          <Link href="/faq" className="transition-colors duration-150 hover:text-teal-700">{footer.faq}</Link>
          <Link href="/privacy" className="transition-colors duration-150 hover:text-teal-700">{footer.privacy}</Link>
          <Link href="/terms" className="transition-colors duration-150 hover:text-teal-700">{footer.terms}</Link>
          <Link href="/contact" className="transition-colors duration-150 hover:text-teal-700">{footer.contact}</Link>
          <Link href="/admin/login" className="transition-colors duration-150 hover:text-teal-700">{footer.login}</Link>
        </div>
      </div>
      {disclaimer && <p className="mt-4 max-w-[640px] text-[12.5px] leading-[1.6] text-ink-soft">{disclaimer}</p>}
    </footer>
  );
}
