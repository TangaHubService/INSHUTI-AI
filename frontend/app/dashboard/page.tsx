"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getHistory, type ConversationSummary } from "@/lib/apiClient";
import { AppShell } from "@/components/AppShell";
import { PageLoading } from "@/components/Spinner";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { getNotifications, type AppNotification } from "@/lib/userApiClient";

const QUICK_TOPICS = [
  { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Menstrual Health" },
  { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Pregnancy" },
  { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Relationships" },
  { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Family Planning" },
  { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "HIV & STIs" },
  { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Mental Health" },
];

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function TeenDashboardPage() {
  const { user, loading: authLoading } = useRequireUser();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getHistory(), getNotifications()])
      .then(([history, n]) => {
        setConversations(history.conversations);
        setNotifications(n.notifications);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <AppShell active="/dashboard" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Welcome back
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-[10px] max-w-[560px] text-[14.5px] leading-[1.6] text-ink-soft">
            Ask anything, pick up a past conversation, or explore a topic below.
          </p>
          <Link
            href="/chat"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[10px] text-[13.5px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
          >
            Start chatting
          </Link>
        </section>

        {loading ? (
          <PageLoading />
        ) : (
          <section className="grid grid-cols-1 gap-4 pb-16 pt-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mb-4 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
                <h3 className="mb-4 text-base text-teal-900">Quick topics</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {QUICK_TOPICS.map((topic) => (
                    <Link
                      key={topic.name}
                      href={`/chat?topic=${topic.icon}`}
                      className="flex flex-col items-start gap-2 rounded-2xl border border-line px-3.5 py-3 hover:bg-paper-2"
                    >
                      <div className={`flex h-[26px] w-[26px] items-center justify-center rounded-lg ${topic.bg} ${topic.fg}`}>
                        <svg width="14" height="14">
                          <use href={`#${topic.icon}`} />
                        </svg>
                      </div>
                      <span className="text-[12.5px] font-semibold text-ink">{topic.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
                <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
                  <h3 className="text-base text-teal-900">Recent conversations</h3>
                  <Link href="/my-space" className="text-[12.5px] font-semibold text-teal-700">
                    View all →
                  </Link>
                </div>
                {conversations.length === 0 && (
                  <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">
                    No conversations yet.{" "}
                    <Link href="/chat" className="font-semibold text-teal-700">
                      Start one now
                    </Link>
                    .
                  </p>
                )}
                {conversations.slice(0, 5).map((conversation) => (
                  <Link
                    href="/chat"
                    className="flex items-center gap-[14px] border-b border-line px-5 py-3 last:border-b-0 hover:bg-paper-2"
                    key={conversation.id}
                  >
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
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">Recent notifications</div>
              {notifications.length === 0 && (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">Nothing new.</p>
              )}
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="border-b border-line px-5 py-3 last:border-b-0">
                  <div className="text-sm font-semibold text-ink">{n.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{n.body}</div>
                </div>
              ))}
              <div className="px-5 py-3">
                <Link href="/notifications" className="text-[12.5px] font-semibold text-teal-700">
                  View all →
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
