"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useRequireUser } from "@/lib/useUserAuth";
import { FullPageLoading } from "@/components/Spinner";
import { GroupCall } from "@/components/GroupCall";
import { toWavBlob } from "@/lib/audio";
import {
  getConsultationMessages,
  sendConsultationMessage,
  uploadConsultationFile,
  getConsultationFiles,
  getConsultationFileUrl,
  markConsultationRead,
  type ConsultationMessage,
  type FileAttachment,
} from "@/lib/userApiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AttachmentPreview = { file: FileAttachment; url: string };

function fileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function InlineAttachment({ file, onPreview }: { file: FileAttachment; onPreview: (preview: AttachmentPreview) => void }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl = "";
    void getConsultationFileUrl(file.id)
      .then((nextUrl) => {
        createdUrl = nextUrl;
        if (active) setUrl(nextUrl);
        else URL.revokeObjectURL(nextUrl);
      })
      .catch(() => { if (active) setFailed(true); });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [file.id]);

  if (file.mimeType.startsWith("audio/")) {
    return (
      <div className="w-full rounded-xl border border-[#D5DED9] bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9FDD3] text-[#08786F]"><svg width="15" height="15"><use href="#i-mic" /></svg></span><span className="min-w-0 flex-1"><b className="block truncate text-[10px] text-[#28474E]">{file.originalName}</b><span className="text-[8.5px] text-[#718187]">Voice message · {fileSize(file.size)}</span></span></div>
        {url ? <audio src={url} controls preload="metadata" className="h-9 w-full" /> : <div className="h-9 animate-pulse rounded-full bg-[#EEF1EF]" />}
        {failed && <span className="text-[9px] text-[#C74B48]">Audio could not be loaded.</span>}
      </div>
    );
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      <button type="button" disabled={!url} onClick={() => url && onPreview({ file, url })} className="group relative h-[116px] w-[150px] overflow-hidden rounded-xl border border-[#D5DED9] bg-white shadow-sm">
        {url ? <span role="img" aria-label={file.originalName} className="block h-full w-full bg-cover bg-center transition group-hover:scale-105" style={{ backgroundImage: `url(${url})` }} /> : <span className="block h-full w-full animate-pulse bg-[#EEF1EF]" />}
        <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1.5 text-left text-[8.5px] text-white">{file.originalName}</span>
      </button>
    );
  }

  return (
    <button type="button" disabled={!url} onClick={() => url && onPreview({ file, url })} className="flex h-[62px] min-w-[190px] items-center gap-3 rounded-xl border border-[#D5DED9] bg-white px-3 text-left shadow-sm transition hover:bg-[#F8FAF9]">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFE9E7] text-[#DF514D]"><svg width="17" height="17"><use href="#i-file" /></svg></span>
      <span className="min-w-0"><b className="block max-w-[160px] truncate text-[10px] text-[#28474E]">{file.originalName}</b><span className="mt-1 block text-[8.5px] text-[#718187]">PDF · {fileSize(file.size)}</span></span>
    </button>
  );
}

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
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreview | null>(null);
  const [groupCallOpen, setGroupCallOpen] = useState(false);
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
        const data = await getConsultationMessages(consultationId);
        if (!cancelled) {
          setMessages(data);
        }
      } catch {}
      try {
        const attachmentData = await getConsultationFiles(consultationId);
        if (!cancelled) setFiles(attachmentData);
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

    void markConsultationRead(consultationId).then(() => {
      window.dispatchEvent(new Event("private-messages:read"));
    });
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
      const notice = file.type.startsWith("audio/") ? "🎙 Voice message" : `📎 Shared file: ${file.name}`;
      if (socketRef.current?.connected) socketRef.current.emit("message:send", notice);
      else {
        await sendConsultationMessage(consultationId, notice);
        const data = await getConsultationMessages(consultationId);
        setMessages(data);
      }
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
        void toWavBlob(blob)
          .then((wav) => uploadFile(new File([wav], `voice-${Date.now()}.wav`, { type: "audio/wav" })))
          .catch(() => uploadFile(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type })));
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

  useEffect(() => {
    if (!attachmentPreview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAttachmentPreview(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [attachmentPreview]);

  const myRole = user?.role === "HEALTHCARE_PROFESSIONAL" ? "ASSISTANT" : "USER";

  useEffect(() => {
    const otherMessage = messages.find((message) => message.role !== myRole && message.senderName);
    if (otherMessage?.senderName) setOtherName(otherMessage.senderName);
  }, [messages, myRole]);

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
    <div className="relative flex h-[calc(100vh-66px)] min-h-[560px] flex-col bg-[#EFEAE2]">
      <div className="flex items-center justify-between border-b border-[#D9DDDA] bg-[#F0F2F5] px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/consultations")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#54656F] hover:bg-[#E3E6E8]"
          >
            <svg width="16" height="16"><use href="#i-back" /></svg>
          </button>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9EDE8] text-sm font-bold text-[#08786F]">
              {otherName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            {otherOnline && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <div className="text-[14px] font-bold text-teal-900">
              {otherName || "Private consultation"}
            </div>
            <div className="text-[10.5px] text-[#667781]">
              {typing ? <span className="font-medium text-[#00A884]">typing…</span> : otherOnline ? "online" : "private human conversation"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#54656F]">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#E2EEEB] px-3 py-1.5 text-[9.5px] text-[#36615B] sm:flex"><svg width="12" height="12"><use href="#i-lock" /></svg>Encrypted &amp; private</span>
          <button type="button" onClick={() => setGroupCallOpen(true)} className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[#0A7A70] hover:bg-[#E3E6E8]" title="Start a group call"><svg width="15" height="15"><use href="#i-users" /></svg>Group call</button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-[#E3E6E8]" title="More options">⋮</button>
        </div>
      </div>

      <div className="border-b border-[#DCE4E0] bg-[#EAF7F3] px-4 py-2 text-center text-[9.5px] text-[#46645F]">
        <span className="font-semibold">🔒 Human-to-human chat:</span> this conversation is separate from the Inshuti AI assistant.
      </div>

      <main className="w-full flex-1 overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(11,84,75,.05)_1px,transparent_1px)] bg-[length:22px_22px] px-4 py-4">
        <div className="mx-auto w-full max-w-[760px]">
        {messages.length > 0 && <div className="mb-5 text-center"><span className="rounded-lg bg-white/85 px-3 py-1.5 text-[9.5px] font-medium uppercase text-[#667781] shadow-sm">{new Date(messages[0].createdAt).toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long" })}</span></div>}
        {files.length > 0 && (
          <div className="mb-4 rounded-xl bg-white/70 p-3 shadow-sm backdrop-blur-sm">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#667781]">Shared media</div>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => <InlineAttachment key={file.id} file={file} onPreview={setAttachmentPreview} />)}
            </div>
          </div>
        )}
        {messages.length === 0 && (
          <div className="py-16 text-center"><span className="rounded-xl bg-[#FFF5C4] px-4 py-3 text-[10.5px] text-[#5F5B43] shadow-sm">No human messages yet. Say hello to start this private consultation.</span></div>
        )}
        {(() => {
          const audioFilesAsc = files
            .filter((f) => f.mimeType.startsWith("audio/"))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const voiceMessageIds = messages
            .filter((m) => m.content === "🎙 Voice message")
            .map((m) => m.id);
          const fileNotices = new Map<string, FileAttachment>(
            files
              .filter((f) => !f.mimeType.startsWith("audio/"))
              .map((f) => [`📎 Shared file: ${f.originalName}`, f] as const),
          );
          return messages.map((message, i) => {
            const mine = message.role === myRole;
            const prev = i > 0 ? messages[i - 1] : null;
            const showName = !mine && (!prev || prev.role !== message.role);
            const isRead = !!message.readAt;
            const voiceIndex = voiceMessageIds.indexOf(message.id);
            const inlineFile =
              voiceIndex >= 0 ? audioFilesAsc[voiceIndex] : (fileNotices.get(message.content) ?? null);
            return (
              <div key={message.id} className="mb-3">
                {showName && message.senderName && (
                  <div className="mb-1 ml-1 text-[11px] font-semibold text-teal-700">{message.senderName}</div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-[13px] leading-[1.5] shadow-[0_1px_1px_rgba(11,20,18,.12)] ${
                        mine
                          ? "rounded-br-[2px] bg-[#D9FDD3] text-[#172925]"
                          : "rounded-bl-[2px] bg-white text-[#172925]"
                      }`}
                    >
                      {inlineFile && !message.content.startsWith("📎 Shared file:") ? (
                        <>
                          <div className="mb-2 text-[10px] font-semibold">🎙 Voice message</div>
                          <InlineAttachment file={inlineFile} onPreview={setAttachmentPreview} />
                        </>
                      ) : inlineFile ? (
                        <InlineAttachment file={inlineFile} onPreview={setAttachmentPreview} />
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className={`mt-1 flex items-center gap-2 px-1 ${mine ? "justify-end" : "justify-start"}`}>
                      <span className="text-[9px] text-[#667781]">{timeLabel(message.createdAt)}</span>
                      {mine && (
                        <span className={`text-[9px] ${isRead ? "font-semibold text-[#53BDEB]" : "text-[#667781]"}`}>
                          {isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        {typing && (
          <div className="mb-3 flex items-center gap-2 text-[12px] text-ink-soft italic">
            <div className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            typing…
          </div>
        )}
        <div ref={bottomRef} />
        </div>
      </main>

      <form className="flex items-end gap-2 border-t border-[#D9DDDA] bg-[#F0F2F5] px-3 py-2.5" onSubmit={handleSend}>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*,application/pdf" className="hidden" onChange={(e) => void handleFileUpload(e)} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656F] hover:bg-[#E2E5E7] disabled:opacity-50"
        >
          <svg width="18" height="18" className="text-ink-soft"><use href={uploading ? "#i-spinner" : "#i-attach"} /></svg>
        </button>
        <button type="button" onClick={() => void toggleRecording()} className={`flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold ${recording ? "bg-red-100 text-red-700" : "text-[#54656F] hover:bg-[#E2E5E7]"}`} aria-label={recording ? "Stop voice message" : "Record voice message"}>
          {recording ? "■" : "🎙"}
        </button>
        <button type="button" onClick={startDictation} className="hidden h-10 rounded-full px-3 text-[10px] font-bold text-[#54656F] hover:bg-[#E2E5E7] sm:block" aria-label="Dictate message">Dictate</button>
        <textarea
          ref={textareaRef}
          rows={1}
          className="max-h-[120px] min-h-[42px] flex-1 resize-none overflow-y-auto rounded-[22px] border-0 bg-white px-4 py-2.5 text-[13px] leading-[1.4] shadow-sm outline-none"
          placeholder="Type a private message"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={sending}
        />
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00A884] disabled:opacity-40"
          type="submit"
          disabled={sending || !input.trim()}
        >
          <svg width="16" height="16" className="text-white"><use href="#i-send" /></svg>
        </button>
      </form>

      {attachmentPreview && (
        <div className="absolute inset-0 z-40 flex flex-col bg-[#101817]/95 text-white backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <button type="button" onClick={() => setAttachmentPreview(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Close file preview"><svg width="16" height="16"><use href="#i-back" /></svg></button>
            <span className="min-w-0 flex-1"><b className="block truncate text-[12px]">{attachmentPreview.file.originalName}</b><span className="mt-0.5 block text-[9px] text-white/60">{formatFileSize(attachmentPreview.file.size)}</span></span>
            <a href={attachmentPreview.url} download={attachmentPreview.file.originalName} className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-[10px] font-semibold"><svg width="14" height="14"><use href="#i-download" /></svg>Download</a>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
            {attachmentPreview.file.mimeType.startsWith("image/") ? <div role="img" aria-label={attachmentPreview.file.originalName} className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${attachmentPreview.url})` }} /> : <iframe src={attachmentPreview.url} title={attachmentPreview.file.originalName} className="h-full w-full rounded-lg border-0 bg-white" />}
          </div>
        </div>
      )}

      {groupCallOpen && (
        <GroupCall
          invitees={(() => {
            const other = messages.find((m) => m.senderId && m.senderId !== user.id);
            return other?.senderId ? [{ id: other.senderId, name: other.senderName ?? "Participant" }] : [];
          })()}
          onClose={() => setGroupCallOpen(false)}
        />
      )}
    </div>
    </AppShell>
  );
}
