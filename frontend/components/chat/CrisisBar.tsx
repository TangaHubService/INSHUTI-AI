"use client";

import type { CrisisResource, Language } from "@/lib/apiClient";

interface CrisisBarProps {
  showCrisisInfo: boolean;
  crisisResources: CrisisResource[];
  crisisResourcesLoading: boolean;
  language: Language;
  onToggle: () => void;
  onOpen: () => void;
}

export function CrisisBar({
  showCrisisInfo,
  crisisResources,
  crisisResourcesLoading,
  language,
  onToggle,
  onOpen,
}: CrisisBarProps) {
  if (!showCrisisInfo) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 bg-gold-100/80 py-[7px] text-center text-[12px] font-semibold text-[#8A5E1E] dark:bg-[#3D3018]/80 dark:text-[#E3A857]">
        <span>
          {language === "RW" ? "Uri mu kaga? " : language === "FR" ? "En crise ? " : language === "SW" ? "Katika hatari? " : "In crisis? "}
        </span>
        <a
          href="tel:116"
          className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3 py-1 text-[11px] text-white shadow-sm transition hover:bg-coral-dark"
        >
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1v3.5c0 .6-.4 1-1 1C9.1 21 3 14.9 3 7.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z" />
          </svg>
          {language === "RW" ? "Hamagara 116" : language === "FR" ? "Appelez le 116" : language === "SW" ? "Piga 116" : "Call 116"}
        </a>
        <span className="hidden sm:inline">&middot;</span>
        <button
          type="button"
          onClick={onOpen}
          className="underline hover:no-underline"
        >
          {language === "RW" ? "Kanda hano ubone ubufasha" : language === "FR" ? "Appuyez ici pour de l'aide" : language === "SW" ? "Bonyeza hapa kwa msaada" : "Tap here for immediate support"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-[#E1DACB] bg-gold-100/60 px-4 py-3 dark:border-[#33363A] dark:bg-[#3D3018]/40">
      <div className="mx-auto flex max-w-[860px] items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[13px] font-bold text-[#8A5E1E] dark:text-[#E3A857]">
            {language === "RW" ? "Ubufasha bwihutirwa" : language === "FR" ? "Ressources d'urgence" : language === "SW" ? "Rasilimali za dharura" : "Immediate support resources"}
          </div>
          {crisisResourcesLoading ? (
            <p className="mt-1 text-[12px] text-[#8A5E1E] dark:text-[#E3A857]">Loading&hellip;</p>
          ) : crisisResources.length === 0 ? (
            <p className="mt-1 text-[12px] text-[#8A5E1E] dark:text-[#E3A857]">
              {language === "RW"
                ? "Nta bufasha buboneka ubu. Nyabona vugana n'ivuriro riri hafi."
                : language === "FR"
                  ? "Aucune ressource disponible. Contactez un établissement de santé proche."
                  : language === "SW"
                    ? "Hakuna rasilimali zinazopatikana. Wasiliana na kituo cha afya."
                    : "No resources available. Please contact a nearby health facility."}
            </p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {crisisResources.map((r) => (
                <li key={r.id} className="text-[12px] text-[#8A5E1E] dark:text-[#E3A857]">
                  <span className="font-semibold">{r.name}</span> &mdash; {r.contact}
                  <span className="text-[#8A5E1E]/70 dark:text-[#E3A857]/70"> ({r.region})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#8A5E1E] transition hover:bg-gold-100 dark:text-[#E3A857] dark:hover:bg-[#3D3018]"
          aria-label="Close crisis info"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
