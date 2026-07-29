"use client";

import Link from "next/link";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { FOOTER_COLUMNS } from "@/lib/i18nCommon";

export function SiteFooter({ disclaimer }: { disclaimer?: string }) {
  const { language, setLanguage } = useLanguage();
  const f = FOOTER_COLUMNS[language];
  const columns = [f.platform, f.resources, f.professionals, f.support];

  return (
    <footer className="w-full border-t border-line bg-white">
      <div className="mx-auto w-full max-w-[1160px] px-5 sm:px-8">
        <div className="flex flex-col items-start gap-2 py-10 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={26} />
            <span className="font-display text-lg font-bold text-teal-900 transition-colors group-hover:text-teal-700">Inshuti</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 pb-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.label}>
              <h4 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-soft">
                {col.label}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] font-medium text-ink-soft transition-colors duration-150 hover:text-teal-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {disclaimer && (
          <p className="border-t border-line py-5 text-[12px] leading-[1.6] text-ink-soft">
            {disclaimer}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-5">
          <p className="text-[13px] font-semibold text-ink-soft">
            {f.tagline}
          </p>
          <LanguageSwitcher value={language} onChange={setLanguage} />
        </div>
      </div>
    </footer>
  );
}
