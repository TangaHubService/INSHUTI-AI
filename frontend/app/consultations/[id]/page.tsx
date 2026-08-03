"use client";

import { useParams, useRouter } from "next/navigation";
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
  markConsultationRead,
  type ConsultationMessage,
  type FileAttachment,
} from "@/lib/userApiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export default function ConsultationThreadPage() {
  const params = useParams<{ id: string }>();
  const consultationId = params.id;
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useRequireUser();
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      } catch {}
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
          if (msg.senderName) setOtherName(msg.senderName);
        }
      });

      socketRef.current.on("messages:read", (data: { messageIds: string[]; readAt: string }) => {
        if (!cancelled) {
          setMessages((prev) =>
            prev.map((m) =>
              data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt } : m,
            ),
          );
        }
      });

      socketRef.current.on("user:online", (data: { userId: string; online: boolean }) => {
        if (!cancelled) setOtherOnline(data.online);
      });

      socketRef.current.on("typing:start", () => {
        if (!cancelled) setTyping(true);
      });

      socketRef.current.on("typing:stop", () => {
        if (!cancelled) setTyping(false);
      });

      socketRef.current.on("connect_error", () => {
        if (!cancelled && !pollInterval) {
          pollInterval = setInterval(fetchMessages, 4000);
        }
      });

      socketRef.current.on("connect", () => {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
      });
    }

    void init();

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    };
  }, [consultationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const unreadIds = messages
      .filter((m) => {
        const isMe = user?.role === "HEALTHCARE_PROFESSIONAL" ? m.role === "ASSISTANT" : m.role === "USER";
        return !isMe && !m.readAt;
      })
      .map((m) => m.id);
    if (unreadIds.length === 0) return;

    void markConsultationRead(consultationId);
    if (socketRef.current?.connected) {
      socketRef.current.emit("messages:read", unreadIds);
    }
  }, [messages, user?.role, consultationId]);

  async function uploadFile(file: File) {
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
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function toggleRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void uploadFile(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast("Microphone access is unavailable.", "error");
    }
  }

  function startDictation() {
    const SpeechRecognitionCtor = (window as unknown as { SpeechRecognition?: new () => {
      lang: string; start(): void; onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
      onerror: () => void;
    }; webkitSpeechRecognition?: new () => {
      lang: string; start(): void; onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
      onerror: () => void;
    } }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => { lang: string; start(): void; onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onerror: () => void } }).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) { toast("Voice-to-text is not supported by this browser.", "error"); return; }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = user?.preferredLanguage === "FR" ? "fr-FR" : user?.preferredLanguage === "SW" ? "sw-KE" : user?.preferredLanguage === "RW" ? "rw-RW" : "en-US";
    recognition.onresult = (event) => setInput((current) => `${current}${current ? " " : ""}${event.results[0][0].transcript}`);
    recognition.onerror = () => toast("Voice-to-text could not understand that. Please try again.", "error");
    recognition.start();
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
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:stop");
      socketRef.current.emit("message:send", trimmed);
    } else {
      try {
        await sendConsultationMessage(consultationId, trimmed);
        const data = await getConsultationMessages(consultationId);
        setMessages(data);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to send message", "error");
      }
    }
    setSending(false);
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

    if (socketRef.current?.connected) {
      socketRef.current.emit("typing:start");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing:stop");
      }, 2000);
    }
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
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/consultations")}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg width="16" height="16"><use href="#i-back" /></svg>
          </button>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
              {otherName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            {otherOnline && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <div className="text-[14px] font-bold text-teal-900">
              {otherName || "Consultation"}
            </div>
            <div className="text-[11px] text-ink-soft">
              {typing ? "typing…" : otherOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[720px] flex-1 overflow-y-auto px-4 py-4">
        {files.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">Attachments</div>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <a href={`${API_URL}/api/uploads/${file.id}`} target="_blank" rel="noreferrer" key={file.id} className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[12px]">
                  <svg width="12" height="12" className="text-ink-soft"><use href="#i-file" /></svg>
                  <span className="font-medium text-teal-900">{file.originalName}</span>
                  <span className="text-ink-soft">({formatFileSize(file.size)})</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {messages.length === 0 && (
          <p className="py-12 text-center text-[13px] text-ink-soft">No messages yet. Say hello.</p>
        )}
        {messages.map((message, i) => {
          const mine = message.role === myRole;
          const prev = i > 0 ? messages[i - 1] : null;
          const showName = !mine && (!prev || prev.role !== message.role);
          const isRead = !!message.readAt;
          return (
            <div key={message.id} className="mb-3">
              {showName && message.senderName && (
                <div className="mb-1 ml-1 text-[11px] font-semibold text-teal-700">{message.senderName}</div>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[14px] leading-[1.5] ${
                      mine
                        ? "rounded-br-[4px] bg-teal-700 text-white"
                        : "rounded-bl-[4px] border border-line bg-white"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className={`mt-1 flex items-center gap-2 px-1 ${mine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-ink-soft">{timeLabel(message.createdAt)}</span>
                    {mine && (
                      <span className="text-[10px] text-ink-soft">
                        {isRead ? "✓✓ Read" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="mb-3 flex items-center gap-2 text-[12px] text-ink-soft italic">
            <div className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            typing…
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <form className="flex items-end gap-2 border-t border-line bg-white px-4 pb-2 pt-3" onSubmit={handleSend}>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*,application/pdf" className="hidden" onChange={(e) => void handleFileUpload(e)} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <svg width="18" height="18" className="text-ink-soft"><use href={uploading ? "#i-spinner" : "#i-attach"} /></svg>
        </button>
        <button type="button" onClick={() => void toggleRecording()} className={`h-10 rounded-full px-3 text-xs font-bold ${recording ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}`} aria-label={recording ? "Stop voice message" : "Record voice message"}>
          {recording ? "Stop" : "Voice"}
        </button>
        <button type="button" onClick={startDictation} className="h-10 rounded-full bg-paper-2 px-3 text-xs font-bold text-teal-700" aria-label="Dictate message">Dictate</button>
        <textarea
          ref={textareaRef}
          rows={1}
          className="max-h-[120px] min-h-[42px] flex-1 resize-none overflow-y-auto rounded-[20px] border border-line bg-gray-50 px-4 py-2.5 text-[14px] leading-[1.4] outline-none focus:border-teal-400 focus:bg-white"
          placeholder="Type a message…"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={sending}
        />
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral disabled:opacity-50"
          type="submit"
          disabled={sending || !input.trim()}
        >
          <svg width="16" height="16" className="text-white"><use href="#i-send" /></svg>
        </button>
      </form>
    </div>
    </AppShell>
  );
}
