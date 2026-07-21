"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

import {
  clearHistory,
  getHistory,
  getSuggestions,
  type ConversationSummary,
  type Language,
  type Suggestion,
  type TopicCount,
} from "@/lib/apiClient";
import { useToast } from "@/lib/useToast";
import { ConfirmModal } from "@/components/Modal";
import { NotificationBell } from "@/components/NotificationBell";

const COLOR_TOKENS: Record<string, { bg: string; fg: string; pillBg: string; pillFg: string }> = {
  coral: { bg: "bg-coral-100", fg: "text-coral-dark", pillBg: "bg-coral-100", pillFg: "text-coral-dark" },
  gold: { bg: "bg-gold-100", fg: "text-[#8A5E1E]", pillBg: "bg-gold-100", pillFg: "text-[#8A5E1E]" },
  teal: { bg: "bg-teal-100", fg: "text-teal-700", pillBg: "bg-teal-100", pillFg: "text-teal-700" },
};

function colorFor(token: string | undefined) {
  return COLOR_TOKENS[token ?? "teal"] ?? COLOR_TOKENS.teal;
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function MySpacePage() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [history, suggestionList] = await Promise.all([getHistory(), getSuggestions(language)]);
      setConversations(history.conversations);
      setTopicCounts(history.topicCounts);
      setSuggestions(suggestionList);
      setError(null);
    } catch {
      setError(
        language === "RW"
          ? "Ntibyashobotse gukura amateka yawe. Ongera ugerageze."
          : language === "FR"
            ? "Impossible de charger votre historique. Veuillez réessayer."
            : language === "SW"
              ? "Haikuweza kupakia historia yako. Tafadhali jaribu tena."
              : "Couldn't load your history right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  async function handleClearHistory() {
    setShowClearConfirm(false);
    setClearing(true);
    try {
      await clearHistory();
      await loadAll();
      toast(language === "RW" ? "Amateka yawe yasibwe" : language === "FR" ? "Historique effacé" : language === "SW" ? "Historia imefutwa" : "History cleared", "success");
    } catch {
      toast(
        language === "RW"
          ? "Ntibyashobotse gusiba amateka yawe. Ongera ugerageze."
          : language === "FR"
            ? "Impossible d'effacer votre historique. Veuillez réessayer."
            : language === "SW"
              ? "Haikuweza kufuta historia yako. Tafadhali jaribu tena."
              : "Couldn't clear your history right now. Please try again.",
        "error",
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/" className="hover:text-teal-700">
              Home
            </Link>
            <Link href="/chat" className="hover:text-teal-700">
              Chat
            </Link>
            <span className="text-teal-700">My Space</span>
            <Link href="/appointments" className="hover:text-teal-700">
              Appointments
            </Link>
            <Link href="/consultations" className="hover:text-teal-700">
              Consultations
            </Link>
            <Link href="/notifications" className="hover:text-teal-700">
              Notifications
            </Link>
            <Link href="/facility-locator" className="hover:text-teal-700">
              Find Care
            </Link>
            <Link href="/profile" className="hover:text-teal-700">
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
              {(["EN", "RW", "FR", "SW"] as const).map((lang) => (
                <span
                  key={lang}
                  className={`cursor-pointer rounded-full px-2.5 py-1.5 ${language === lang ? "bg-teal-700 text-white" : "text-teal-700"}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </span>
              ))}
            </div>
            <NotificationBell />
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              Start chatting
            </Link>
          </div>
        </header>

        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Private · Only on this device
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">Your questions, your progress.</h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            This is where your past conversations live, along with a few things Inshuti noticed
            that might help you next. Nothing here is linked to your name — it&apos;s tied only to
            this device.
          </p>
        </section>

        {error && (
          <div className="mb-4 rounded-md border border-danger bg-coral-100 px-4 py-3 text-[13.5px] font-semibold text-coral-dark">
            {error}
          </div>
        )}

        <section className="pb-16 pt-5">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
                <h3 className="text-base text-teal-900">Recent conversations</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-[14px] py-1.5 text-[13px] font-semibold text-ink-soft">
                  Last 30 days
                </span>
              </div>

              {!loading && conversations.length === 0 && (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">
                  No conversations yet.{" "}
                  <Link href="/chat" className="font-semibold text-teal-700">
                    Start one now
                  </Link>
                  .
                </p>
              )}

              {conversations.map((conversation) => {
                const color = colorFor(conversation.topic?.colorToken);
                return (
                  <Link
                    href="/chat"
                    className="flex items-center gap-[14px] border-b border-line px-[18px] py-4 last:border-b-0 hover:bg-paper-2"
                    key={conversation.id}
                  >
                    <div className={`flex h-[38px] w-[38px] items-center justify-center rounded-2xl ${color.bg} ${color.fg}`}>
                      <svg width="18" height="18">
                        <use href={`#${conversation.topic?.icon ?? "i-chat"}`} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">
                        &quot;{conversation.firstUserMessage ?? "…"}&quot;
                      </div>
                      <div className="mt-[3px] text-xs text-ink-soft">
                        {conversation.topic
                          ? language === "RW"
                            ? conversation.topic.nameRw
                            : conversation.topic.nameEn
                          : "General"}{" "}
                        · {relativeTime(conversation.createdAt)}
                      </div>
                    </div>
                    <svg width="16" height="16" className="text-ink-soft">
                      <use href="#i-arrow" />
                    </svg>
                  </Link>
                );
              })}

              {topicCounts.length > 0 && (
                <div className="px-5 pb-1 pt-4">
                  <div className="pb-[10px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    Topics you&apos;ve explored
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topicCounts.map(({ topic, count }) =>
                      topic ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-[14px] py-1.5 text-[13px] font-semibold ${colorFor(topic.colorToken).pillBg} ${colorFor(topic.colorToken).pillFg}`}
                          key={topic.id}
                        >
                          {language === "RW" ? topic.nameRw : topic.nameEn} · {count}
                        </span>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-[14px]">
              <div className="px-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Suggested for you
              </div>

              {suggestions.map((suggestion) => (
                <div
                  className="flex flex-col gap-[10px] rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card"
                  key={suggestion.title}
                >
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-coral-dark">
                    <svg width="13" height="13">
                      <use href="#i-sparkle" />
                    </svg>
                    {suggestion.tag}
                  </span>
                  <h3 className="text-[15.5px] text-teal-900">{suggestion.title}</h3>
                  <p className="text-[13px] leading-[1.55] text-ink-soft">{suggestion.body}</p>
                  <Link href="/chat" className="mt-auto flex items-center gap-[5px] text-[12.5px] font-bold text-teal-700">
                    {suggestion.ctaText}
                    <svg width="12" height="12">
                      <use href="#i-arrow" />
                    </svg>
                  </Link>
                </div>
              ))}

              <div className="flex items-start gap-[14px] rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <svg width="18" height="18">
                    <use href="#i-lock" />
                  </svg>
                </div>
                <div>
                  <div className="mb-1 text-[13.5px] font-bold text-teal-900">
                    This history is private to your device
                  </div>
                  <p className="text-[12.5px] leading-[1.55] text-ink-soft">
                    It&apos;s never linked to your name or shared with anyone. You can clear it at
                    any time.
                  </p>
                  <button
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-coral-dark px-4 py-[9px] text-[13px] font-semibold text-coral-dark transition hover:-translate-y-px hover:bg-teal-100 disabled:opacity-50"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={clearing}
                  >
                    <svg width="13" height="13">
                      <use href="#i-trash" />
                    </svg>
                    {clearing ? "Clearing…" : "Clear my history"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConfirmModal
          open={showClearConfirm}
          title={language === "RW" ? "Gusiba amateka" : language === "FR" ? "Effacer l'historique" : language === "SW" ? "Futa historia" : "Clear history"}
          message={language === "RW" ? "Wemeza ko ushaka gusiba amateka yawe yose?" : language === "FR" ? "Êtes-vous sûr de vouloir effacer tout votre historique ?" : language === "SW" ? "Una uhakika unataka kufuta historia yako yote?" : "Are you sure you want to clear all your history?"}
          confirmLabel={language === "RW" ? "Siba" : language === "FR" ? "Effacer" : language === "SW" ? "Futa" : "Clear"}
          cancelLabel={language === "RW" ? "Rekura" : language === "FR" ? "Annuler" : language === "SW" ? "Ghairi" : "Cancel"}
          variant="danger"
          onConfirm={() => void handleClearHistory()}
          onCancel={() => setShowClearConfirm(false)}
        />
        <footer className="border-t border-line py-9">
          <div className="flex flex-wrap items-center justify-between gap-[14px]">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="font-display text-[17px] font-bold text-teal-900">Inshuti</span>
            </div>
            <div className="flex gap-[22px] text-[13.5px] font-semibold text-ink-soft">
              <a href="#" className="hover:text-teal-700">
                Privacy
              </a>
              <a href="#" className="hover:text-teal-700">
                Terms
              </a>
              <a href="/admin/login" className="hover:text-teal-700">
                Admin
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
