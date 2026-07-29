"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useRequireUser } from "@/lib/useUserAuth";
import { FullPageLoading } from "@/components/Spinner";
import {
  getConsultationMessages,
  sendConsultationMessage,
  uploadConsultationFile,
  getConsultationFiles,
  type ConsultationMessage,
  type FileAttachment,
} from "@/lib/userApiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function fetchMessages() {
      try {
        const [data, attachmentData] = await Promise.all([
          getConsultationMessages(consultationId),
          getConsultationFiles(consultationId),
        ]);
        if (!cancelled) {
          setMessages(data);
          setFiles(attachmentData);
        }
      } catch {
        // transient failures aren't worth a toast
      }
    }

    async function init() {
      await fetchMessages();
      if (cancelled) return;

      socketRef.current = io(`${API_URL}/consultation/${consultationId}`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("message:new", (msg: ConsultationMessage) => {
        if (!cancelled) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      socketRef.current.on("connect_error", () => {
        if (!cancelled && !pollInterval) {
          pollInterval = setInterval(fetchMessages, 4000);
        }
      });

      socketRef.current.on("connect", () => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      });
    }

    void init();

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [consultationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadConsultationFile(consultationId, file);
      const attachmentData = await getConsultationFiles(consultationId);
      setFiles(attachmentData);
      toast("File uploaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to upload file", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const myRole = user?.role === "HEALTHCARE_PROFESSIONAL" ? "ASSISTANT" : "USER";

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:send", trimmed);
      } else {
        await sendConsultationMessage(consultationId, trimmed);
        const data = await getConsultationMessages(consultationId);
        setMessages(data);
      }
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

  if (authLoading || !user) return <FullPageLoading />;

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
        {files.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.08em] text-ink-soft">Attachments</div>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[13px]">
                  <svg width="14" height="14" className="text-ink-soft"><use href="#i-file" /></svg>
                  <span className="font-medium text-teal-900">{file.originalName}</span>
                  <span className="text-ink-soft">({formatFileSize(file.size)})</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => void handleFileUpload(e)} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white hover:bg-paper-2 disabled:opacity-50"
          title="Attach file"
        >
          <svg width="18" height="18" className="text-ink-soft"><use href={uploading ? "#i-spinner" : "#i-attach"} /></svg>
        </button>
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
