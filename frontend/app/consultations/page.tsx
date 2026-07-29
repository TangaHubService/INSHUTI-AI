"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import {
  getChatList,
  type ChatListItem,
} from "@/lib/userApiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function firstLine(text: string): string {
  return text.replace(/\n.*/, "").slice(0, 80);
}

export default function ConsultationsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useRequireUser();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await getChatList();
        if (!cancelled) setChats(data);
      } catch {
        if (!cancelled) toast("Failed to load chats", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();

    socketRef.current = io(`${API_URL}/chat-list`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("user:online", (data: { userId: string; online: boolean }) => {
      if (!cancelled) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.online) next.add(data.userId);
          else next.delete(data.userId);
          return next;
        });
      }
    });

      socketRef.current.on("message:new", () => {
      if (!cancelled) {
        void load();
      }
    });

    return () => {
      cancelled = true;
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    };
  }, [authLoading, user]);

  if (authLoading || !user) return <FullPageLoading />;

  const t = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      eyebrow: { EN: "Messages", RW: "Ubutumwa", FR: "Messages", SW: "Jumbe" },
      empty: { EN: "No conversations yet. Ask to talk to a health worker from the AI chat.", RW: "Nta biganiro bihari. Saba kuvugana n'umukozi w'ubuzima mu kiganiro.", FR: "Aucune conversation. Demandez à parler à un professionnel depuis le chat.", SW: "Hakuna mazungumzo. Omba kuzungumza na mhudumu wa afya kutoka kwenye mazungumzo." },
      online: { EN: "Online", RW: "Ariho", FR: "En ligne", SW: "Ana mtandao" },
      offline: { EN: "Offline", RW: "Ntariho", FR: "Hors ligne", SW: "Hana mtandao" },
    };
    return labels[key]?.[language] ?? labels[key]?.EN ?? key;
  };

  return (
    <AppShell active="/consultations" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[860px]">
        <div className="pb-3">
          <h1 className="font-display text-[28px] text-teal-900">{t("eyebrow")}</h1>
        </div>

        <div className="card py-1.5">
          {loading && <PageLoading />}
          {!loading && chats.length === 0 && (
            <p className="px-5 py-8 text-center text-[13.5px] text-ink-soft">{t("empty")}</p>
          )}
          {chats.map((chat) => {
            const isOnline = chat.otherParty ? onlineUsers.has(chat.otherParty.id) : false;
            return (
              <Link
                key={chat.id}
                href={`/consultations/${chat.id}`}
                className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-paper-2"
              >
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                    {chat.otherParty?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[14px] font-semibold text-ink">
                      {chat.otherParty?.name ?? (user.role === "HEALTHCARE_PROFESSIONAL" ? "Anonymous User" : "Health Worker")}
                    </span>
                    {chat.lastMessage && (
                      <span className="shrink-0 text-[11px] text-ink-soft">{timeLabel(chat.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-ink-soft">
                      {chat.lastMessage ? firstLine(chat.lastMessage.content) : "No messages yet"}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </span>
                      )}
                      <span className={`text-[10px] ${isOnline ? "text-green-600" : "text-ink-soft"}`}>
                        {isOnline ? t("online") : t("offline")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
