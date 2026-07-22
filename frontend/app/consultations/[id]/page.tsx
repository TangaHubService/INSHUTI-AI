"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useRequireUser } from "@/lib/useUserAuth";
import {
  getConsultationMessages,
  sendConsultationMessage,
  type ConsultationMessage,
} from "@/lib/userApiClient";

const POLL_INTERVAL_MS = 4000;

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConsultationThreadPage() {
  const params = useParams<{ id: string }>();
  const consultationId = params.id;
  const { toast } = useToast();
  const { user, loading: authLoading } = useRequireUser();
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getConsultationMessages(consultationId);
        if (!cancelled) setMessages(data);
      } catch {
        // transient poll failures aren't worth interrupting the user with a toast
      }
    }

    void poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [consultationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const myRole = user?.role === "HEALTHCARE_PROFESSIONAL" ? "ASSISTANT" : "USER";

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendConsultationMessage(consultationId, trimmed);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setMessages(await getConsultationMessages(consultationId));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  if (authLoading || !user) return null;

  return (
    <AppShell active="/consultations" session={{ kind: "user", user }} flush>
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-line bg-white px-7 py-4">
        <div className="flex items-center gap-[14px]">
          <Link
            href="/consultations"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white"
          >
            <svg width="16" height="16">
              <use href="#i-back" />
            </svg>
          </Link>
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-teal-700">
            <svg width="18" height="18" className="text-white">
              <use href="#i-users" />
            </svg>
          </div>
          <div>
            <div className="text-[14.5px] font-bold text-teal-900">Consultation</div>
            <div className="text-xs text-ink-soft">Private, end-to-end secure messaging</div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-[30px] py-[26px]">
        {messages.length === 0 && (
          <p className="text-center text-[13.5px] text-ink-soft">No messages yet. Say hello.</p>
        )}
        {messages.map((message) => {
          const mine = message.role === myRole;
          return (
            <div
              className={`mb-[18px] flex max-w-[75%] gap-[10px] ${mine ? "ml-auto flex-row-reverse" : ""}`}
              key={message.id}
            >
              <div>
                <div
                  className={`rounded-2xl px-[17px] py-[14px] text-[14.5px] leading-[1.6] ${
                    mine ? "rounded-br-[4px] bg-teal-700 text-white" : "rounded-bl-[4px] border border-line bg-white"
                  }`}
                >
                  {message.content}
                </div>
                <div className="mt-[6px] font-mono text-[11px] text-ink-soft">{timeLabel(message.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <form className="flex items-end gap-[10px] border-t border-line bg-white px-[30px] pb-2 pt-4" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          rows={1}
          className="max-h-[120px] min-h-[48px] flex-1 resize-none overflow-y-auto rounded-[22px] border border-line bg-paper-2 px-[18px] py-[13px] font-body text-[14.5px] leading-[1.4]"
          placeholder="Type a message…"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={sending}
        />
        <button
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-coral disabled:opacity-50"
          type="submit"
          disabled={sending || !input.trim()}
        >
          <svg width="18" height="18">
            <use href="#i-send" />
          </svg>
        </button>
      </form>
    </div>
    </AppShell>
  );
}
