"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { Drawer } from "@/components/Drawer";
import { toWavBlob } from "@/lib/audio";
import {
  getChatList,
  getConsultationFiles,
  getConsultationFileUrl,
  getConsultationMessages,
  markConsultationRead,
  sendConsultationMessage,
  uploadConsultationFile,
  type ChatListItem,
  type ConsultationMessage,
  type FileAttachment,
  type UserRole,
} from "@/lib/userApiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WEBRTC_STUN_URL = process.env.NEXT_PUBLIC_WEBRTC_STUN_URL ?? "stun:stun.l.google.com:19302";

type CallMode = "audio" | "video";
type CallStatus = "idle" | "calling" | "incoming" | "connected";
type IncomingCallSignal = { chatId: string; type: CallMode; offer: RTCSessionDescriptionInit };

function waitForIceGathering(peer: RTCPeerConnection) {
  if (peer.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const timeout = window.setTimeout(done, 1800);
    function done() {
      window.clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", handleChange);
      resolve();
    }
    function handleChange() {
      if (peer.iceGatheringState === "complete") done();
    }
    peer.addEventListener("icegatheringstatechange", handleChange);
  });
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

function fallbackName(chat: ChatListItem, role: UserRole) {
  if (chat.otherParty?.name) return chat.otherParty.name;
  return role === "HEALTHCARE_PROFESSIONAL" ? "Patient awaiting support" : "Awaiting health professional";
}

function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
    void getConsultationFileUrl(file.id).then((nextUrl) => {
      createdUrl = nextUrl;
      if (active) setUrl(nextUrl);
      else URL.revokeObjectURL(nextUrl);
    }).catch(() => { if (active) setFailed(true); });
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

function PrivateConversation({
  chat,
  role,
  onBack,
  onRead,
  incomingCall,
  onIncomingCallConsumed,
}: {
  chat: ChatListItem;
  role: UserRole;
  onBack: () => void;
  onRead: (chatId: string) => void;
  incomingCall: IncomingCallSignal | null;
  onIncomingCallConsumed: () => void;
}) {
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [callMode, setCallMode] = useState<CallMode | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callError, setCallError] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreview | null>(null);
  const threadSocketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callStatusRef = useRef<CallStatus>("idle");
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const name = fallbackName(chat, role);
  const myRole = role === "HEALTHCARE_PROFESSIONAL" ? "ASSISTANT" : "USER";

  const markRead = useCallback(async () => {
    try {
      await markConsultationRead(chat.id);
      setMessages((current) => current.map((message) => message.role === myRole ? message : { ...message, readAt: message.readAt ?? new Date().toISOString() }));
      onRead(chat.id);
      window.dispatchEvent(new Event("private-messages:read"));
    } catch {
      // Keep the conversation usable and retry through the inbox refresh.
    }
  }, [chat.id, myRole, onRead]);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getConsultationMessages(chat.id);
      setMessages(data);
      if (data.some((message) => message.role !== myRole && !message.readAt)) void markRead();
    } finally {
      setLoading(false);
    }
    void getConsultationFiles(chat.id).then(setFiles).catch(() => {});
  }, [chat.id, markRead, myRole]);

  const updateCallStatus = useCallback((status: CallStatus) => {
    callStatusRef.current = status;
    setCallStatus(status);
  }, []);

  const finishCall = useCallback((notifyPeer = true) => {
    if (notifyPeer && callStatusRef.current !== "idle") threadSocketRef.current?.emit("call:end");
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    peerConnectionRef.current = null;
    pendingIceCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingOffer(null);
    setCallMode(null);
    setMuted(false);
    setCameraOff(false);
    setCallSeconds(0);
    updateCallStatus("idle");
  }, [updateCallStatus]);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    peerConnectionRef.current?.close();
    const peer = new RTCPeerConnection({ iceServers: [{ urls: WEBRTC_STUN_URL }] });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate) threadSocketRef.current?.emit("call:ice-candidate", { candidate: event.candidate.toJSON() });
    };
    peer.ontrack = (event) => {
      const streamFromPeer = event.streams[0] ?? new MediaStream([event.track]);
      remoteStreamRef.current = streamFromPeer;
      setRemoteStream(streamFromPeer);
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") updateCallStatus("connected");
      if (peer.connectionState === "failed" || peer.connectionState === "closed") finishCall(false);
    };
    peerConnectionRef.current = peer;
    return peer;
  }, [finishCall, updateCallStatus]);

  const acquireMedia = useCallback(async (mode: CallMode) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const flushPendingIceCandidates = useCallback(async () => {
    const peer = peerConnectionRef.current;
    if (!peer?.remoteDescription) return;
    const candidates = pendingIceCandidatesRef.current.splice(0);
    for (const candidate of candidates) await peer.addIceCandidate(candidate).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getConsultationMessages(chat.id)
      .then((data) => {
        if (cancelled) return;
        setMessages(data);
        if (data.some((message) => message.role !== myRole && !message.readAt)) void markRead();
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    void getConsultationFiles(chat.id).then((attachments) => { if (!cancelled) setFiles(attachments); }).catch(() => {});

    threadSocketRef.current = io(`${API_URL}/consultation/${chat.id}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    threadSocketRef.current.on("message:new", (message: ConsultationMessage) => {
      if (cancelled) return;
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      void getConsultationFiles(chat.id).then((attachments) => { if (!cancelled) setFiles(attachments); }).catch(() => {});
      if (message.role !== myRole) window.setTimeout(() => void markRead(), 0);
    });
    threadSocketRef.current.on("messages:read", ({ messageIds, readAt }: { messageIds: string[]; readAt: string }) => {
      if (cancelled) return;
      setMessages((current) => current.map((message) => messageIds.includes(message.id) ? { ...message, readAt } : message));
    });
    threadSocketRef.current.on("user:online", ({ online }: { online: boolean }) => setOtherOnline(online));
    threadSocketRef.current.on("typing:start", () => setOtherTyping(true));
    threadSocketRef.current.on("typing:stop", () => setOtherTyping(false));
    threadSocketRef.current.on("call:offer", ({ type, offer }: { type: CallMode; offer: RTCSessionDescriptionInit }) => {
      if (callStatusRef.current !== "idle") {
        threadSocketRef.current?.emit("call:decline");
        return;
      }
      setCallError("");
      setCallMode(type);
      setIncomingOffer(offer);
      updateCallStatus("incoming");
    });
    threadSocketRef.current.on("call:answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      const peer = peerConnectionRef.current;
      if (!peer) return;
      await peer.setRemoteDescription(answer).catch(() => {});
      await flushPendingIceCandidates();
      updateCallStatus("connected");
    });
    threadSocketRef.current.on("call:ice-candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      const peer = peerConnectionRef.current;
      if (!peer?.remoteDescription) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }
      await peer.addIceCandidate(candidate).catch(() => {});
    });
    threadSocketRef.current.on("call:decline", () => {
      setCallError("Call declined");
      finishCall(false);
    });
    threadSocketRef.current.on("call:end", () => finishCall(false));

    return () => {
      cancelled = true;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      finishCall(false);
      threadSocketRef.current?.disconnect();
      threadSocketRef.current = null;
    };
  }, [chat.id, finishCall, flushPendingIceCandidates, markRead, myRole, updateCallStatus]);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = window.setInterval(() => setCallSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [callStatus]);

  useEffect(() => {
    if (!incomingCall || incomingCall.chatId !== chat.id) return;
    if (callStatusRef.current !== "idle") {
      onIncomingCallConsumed();
      return;
    }
    setCallError("");
    setCallMode(incomingCall.type);
    setIncomingOffer(incomingCall.offer);
    updateCallStatus("incoming");
    onIncomingCallConsumed();
  }, [chat.id, incomingCall, onIncomingCallConsumed, updateCallStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    try {
      if (threadSocketRef.current?.connected) {
        threadSocketRef.current.emit("typing:stop");
        threadSocketRef.current.emit("message:send", content);
      } else {
        await sendConsultationMessage(chat.id, content);
        await loadMessages();
      }
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (!threadSocketRef.current?.connected) return;
    threadSocketRef.current.emit("typing:start");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => threadSocketRef.current?.emit("typing:stop"), 1500);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      await uploadConsultationFile(chat.id, file);
      setFiles(await getConsultationFiles(chat.id));
      const notice = file.type.startsWith("audio/") ? "🎙 Voice message" : `📎 Shared file: ${file.name}`;
      if (threadSocketRef.current?.connected) threadSocketRef.current.emit("message:send", notice);
      else await sendConsultationMessage(chat.id, notice);
    } catch {
      // Leave the current conversation intact when an attachment fails.
    } finally {
      setUploading(false);
    }
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
          .then((wav) => void uploadFile(new File([wav], `voice-${Date.now()}.wav`, { type: "audio/wav" })))
          .catch(() => void uploadFile(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type })));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }

  async function startCall(mode: CallMode) {
    if (!threadSocketRef.current?.connected || callStatusRef.current !== "idle") return;
    setCallError("");
    setCallMode(mode);
    updateCallStatus("calling");
    try {
      const stream = await acquireMedia(mode);
      const peer = createPeerConnection(stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await waitForIceGathering(peer);
      threadSocketRef.current.emit("call:offer", { type: mode, offer: peer.localDescription ?? offer });
    } catch {
      setCallError(`Allow ${mode === "video" ? "camera and microphone" : "microphone"} access to start the call.`);
      finishCall(false);
    }
  }

  async function acceptCall() {
    if (!incomingOffer || !callMode) return;
    setCallError("");
    try {
      const stream = await acquireMedia(callMode);
      const peer = createPeerConnection(stream);
      await peer.setRemoteDescription(incomingOffer);
      await flushPendingIceCandidates();
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await waitForIceGathering(peer);
      threadSocketRef.current?.emit("call:answer", { answer: peer.localDescription ?? answer });
      updateCallStatus("connected");
    } catch {
      setCallError(`Allow ${callMode === "video" ? "camera and microphone" : "microphone"} access to answer.`);
      threadSocketRef.current?.emit("call:decline");
      finishCall(false);
    }
  }

  function declineCall() {
    threadSocketRef.current?.emit("call:decline");
    finishCall(false);
  }

  function toggleMute() {
    const next = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !next; });
    setMuted(next);
  }

  function toggleCamera() {
    const next = !cameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !next; });
    setCameraOff(next);
  }

  const callDuration = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(callSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="relative -m-6 flex h-[calc(100vh-65px)] flex-col overflow-hidden bg-[#EFEAE2]">
      <div className="flex items-center gap-3 border-b border-[#D9DDDA] bg-[#F0F2F5] px-4 py-3">
        <button type="button" onClick={onBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-teal-700 transition hover:bg-paper-2" aria-label="Back to private message list">
          <svg width="16" height="16"><use href="#i-back" /></svg>
        </button>
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[14px] font-bold text-teal-700">
          {name.charAt(0).toUpperCase()}
          <i className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${otherOnline ? "bg-green-500" : "bg-gray-300"}`} />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[13px] text-ink">{name}</strong>
          <span className={`mt-0.5 block text-[10px] ${otherTyping ? "font-semibold text-[#00A884]" : "text-ink-soft"}`}>{otherTyping ? "typing…" : otherOnline ? "Online" : "Private human conversation"}</span>
        </span>
        <div className="flex items-center gap-1 text-[#54656F]">
          <button type="button" onClick={() => void startCall("audio")} disabled={callStatus !== "idle"} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#E0E4E6] disabled:opacity-40" aria-label={`Audio call ${name}`} title="Audio call"><svg width="17" height="17"><use href="#i-phone" /></svg></button>
          <button type="button" onClick={() => void startCall("video")} disabled={callStatus !== "idle"} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#E0E4E6] disabled:opacity-40" aria-label={`Video call ${name}`} title="Video call"><svg width="18" height="18"><use href="#i-video" /></svg></button>
        </div>
      </div>

      <div className="border-b border-[#D8E8E4] bg-[#EFF8F6] px-5 py-2.5 text-center text-[10px] text-[#47645F]">
        <span className="font-semibold">🔒 Private:</span> you are chatting with {name}, not the Inshuti AI.
      </div>
      {callError && <button type="button" onClick={() => setCallError("")} className="border-b border-[#F0D2D0] bg-[#FFF0EF] px-4 py-2 text-center text-[10px] text-[#B84540]">{callError} · tap to dismiss</button>}

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(11,84,75,.05)_1px,transparent_1px)] bg-[length:22px_22px] px-5 py-5">
        {loading && <div className="py-10 text-center text-[11px] text-ink-soft">Loading conversation…</div>}
        {files.length > 0 && <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-white/55 p-3 shadow-sm"><div className="w-full text-[9px] font-semibold uppercase tracking-[0.08em] text-[#647A7F]">Shared media &amp; files</div>{files.map((file) => <InlineAttachment key={file.id} file={file} onPreview={setAttachmentPreview} />)}</div>}
        {!loading && messages.length === 0 && <div className="py-10 text-center text-[11px] text-ink-soft">No human messages yet. Say hello.</div>}
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
          return messages.map((message, index) => {
            const mine = message.role === myRole;
            const previous = index > 0 ? messages[index - 1] : null;
            const showName = !mine && previous?.role !== message.role;
            const voiceIndex = voiceMessageIds.indexOf(message.id);
            const inlineFile =
              voiceIndex >= 0 ? audioFilesAsc[voiceIndex] : (fileNotices.get(message.content) ?? null);
            return (
              <div key={message.id} className="mb-3">
                {showName && <div className="mb-1 ml-1 text-[10px] font-semibold text-teal-700">{message.senderName ?? name}</div>}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[82%]">
                    <div className={`rounded-lg px-3.5 py-2.5 text-[12.5px] leading-5 shadow-[0_1px_1px_rgba(11,20,18,.12)] ${mine ? "rounded-br-[2px] bg-[#D9FDD3] text-[#172925]" : "rounded-bl-[2px] bg-white text-[#172925]"}`}>
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
                    <div className={`mt-1 flex items-center gap-1.5 px-1 text-[9px] text-ink-soft ${mine ? "justify-end" : "justify-start"}`}>
                      <span>{messageTime(message.createdAt)}</span>
                      {mine && <span className={message.readAt ? "font-semibold text-[#53BDEB]" : ""}>{message.readAt ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        {otherTyping && <div className="mb-3 flex justify-start"><span className="rounded-lg rounded-bl-[2px] bg-white px-4 py-2 text-[12px] tracking-[3px] text-[#84918E] shadow-sm">•••</span></div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-[#D9DDDA] bg-[#F0F2F5] p-4">
        <input ref={fileInputRef} type="file" accept="image/*,audio/*,application/pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = ""; }} />
        <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656F] hover:bg-[#E1E5E6] disabled:opacity-40" aria-label="Attach file"><svg width="17" height="17"><use href={uploading ? "#i-spinner" : "#i-attach"} /></svg></button>
        <textarea
          value={input}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder={`Message ${name}…`}
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-[22px] border-0 bg-white px-4 py-2.5 text-[12.5px] shadow-sm outline-none"
        />
        {!input.trim() ? <button type="button" onClick={() => void toggleRecording()} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${recording ? "bg-[#FFE1E1] text-[#D94242]" : "bg-[#00A884] text-white hover:bg-[#008F72]"}`} aria-label={recording ? "Stop recording" : "Record voice message"}>{recording ? "■" : "🎙"}</button> : <button type="submit" disabled={sending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-white transition hover:bg-[#008F72] disabled:opacity-40" aria-label="Send private message"><svg width="16" height="16"><use href="#i-send" /></svg></button>}
      </form>

      {attachmentPreview && (
        <div className="absolute inset-0 z-40 flex flex-col bg-[#101817]/95 text-white backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <button type="button" onClick={() => setAttachmentPreview(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Close file preview"><svg width="16" height="16"><use href="#i-back" /></svg></button>
            <span className="min-w-0 flex-1"><b className="block truncate text-[12px]">{attachmentPreview.file.originalName}</b><span className="mt-0.5 block text-[9px] text-white/60">{fileSize(attachmentPreview.file.size)}</span></span>
            <a href={attachmentPreview.url} download={attachmentPreview.file.originalName} className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-[10px] font-semibold"><svg width="14" height="14"><use href="#i-download" /></svg>Download</a>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
            {attachmentPreview.file.mimeType.startsWith("image/") ? <div role="img" aria-label={attachmentPreview.file.originalName} className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${attachmentPreview.url})` }} /> : <iframe src={attachmentPreview.url} title={attachmentPreview.file.originalName} className="h-full w-full rounded-lg border-0 bg-white" />}
          </div>
        </div>
      )}

      {callStatus !== "idle" && callMode && (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#164B47,#071F20_72%)] text-white">
          {remoteStream && (callMode === "video" ? <video ref={(element) => { if (element) element.srcObject = remoteStream; }} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" /> : <audio ref={(element) => { if (element) element.srcObject = remoteStream; }} autoPlay />)}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
          <div className="relative z-[1] flex items-center justify-between p-5">
            <button type="button" onClick={() => finishCall(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md" aria-label="Close call"><svg width="16" height="16"><use href="#i-close" /></svg></button>
            <div className="rounded-full bg-black/30 px-3 py-1.5 text-[10px] backdrop-blur-md">🔒 Private {callMode} call</div>
            <span className="h-10 w-10" />
          </div>

          <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 text-center">
            {callMode === "video" && localStream && <video ref={(element) => { if (element) element.srcObject = localStream; }} autoPlay playsInline muted className="absolute right-4 top-3 h-[150px] w-[108px] rounded-xl border-2 border-white/70 bg-black object-cover shadow-2xl sm:h-[180px] sm:w-[130px]" />}
            {(!remoteStream || callMode === "audio") && <span className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/15 bg-[#D9EDE8] text-[43px] font-bold text-[#08786F] shadow-2xl">{name.charAt(0).toUpperCase()}</span>}
            <h2 className="mt-5 text-[21px] font-bold">{name}</h2>
            <p className="mt-2 text-[12px] text-white/75">{callStatus === "incoming" ? `Incoming ${callMode} call…` : callStatus === "calling" ? "Calling…" : callDuration}</p>
          </div>

          <div className="relative z-[1] pb-8">
            {callStatus === "incoming" ? (
              <div className="flex justify-center gap-10">
                <button type="button" onClick={declineCall} className="flex flex-col items-center gap-2 text-[10px]"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E74C4C] shadow-lg"><svg width="22" height="22" className="rotate-[135deg]"><use href="#i-phone" /></svg></span>Decline</button>
                <button type="button" onClick={() => void acceptCall()} className="flex flex-col items-center gap-2 text-[10px]"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20B66B] shadow-lg"><svg width="22" height="22"><use href={callMode === "video" ? "#i-video" : "#i-phone"} /></svg></span>Accept</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-5">
                <button type="button" onClick={toggleMute} className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md ${muted ? "bg-white text-[#17312E]" : "bg-white/20"}`} aria-label={muted ? "Unmute" : "Mute"}><svg width="20" height="20"><use href="#i-mic" /></svg></button>
                {callMode === "video" && <button type="button" onClick={toggleCamera} className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md ${cameraOff ? "bg-white text-[#17312E]" : "bg-white/20"}`} aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}><svg width="20" height="20"><use href="#i-video" /></svg></button>}
                <button type="button" onClick={() => finishCall(true)} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E74C4C] shadow-lg" aria-label="End call"><svg width="22" height="22" className="rotate-[135deg]"><use href="#i-phone" /></svg></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PrivateMessagesBell({ role }: { role: UserRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [incomingCallSignal, setIncomingCallSignal] = useState<IncomingCallSignal | null>(null);
  const [groupInvite, setGroupInvite] = useState<{ code: string; callerName: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const refresh = useCallback(async () => {
    try {
      setChats(await getChatList());
    } catch {
      // The header should remain usable when the inbox service is temporarily unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const refreshInterval = window.setInterval(() => void refresh(), 30_000);
    const handleFocus = () => void refresh();
    const handleRead = () => void refresh();
    const handleOpen = (event: Event) => {
      const chatId = (event as CustomEvent<{ chatId?: string }>).detail?.chatId;
      setSelectedChatId(chatId ?? null);
      setOpen(true);
      void refresh();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("private-messages:read", handleRead);
    window.addEventListener("private-messages:open", handleOpen);

    socketRef.current = io(`${API_URL}/chat-list`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current.on("message:new", () => void refresh());
    socketRef.current.on("messages:read", () => void refresh());
    socketRef.current.on("call:incoming", ({ consultationId, type, offer }: { consultationId: string; type: CallMode; offer: RTCSessionDescriptionInit }) => {
      setIncomingCallSignal({ chatId: consultationId, type, offer });
      setSelectedChatId(consultationId);
      setOpen(true);
      void refresh();
    });
    socketRef.current.on("call:cancelled", ({ consultationId }: { consultationId: string }) => {
      setIncomingCallSignal((current) => current?.chatId === consultationId ? null : current);
    });
    socketRef.current.on("group-call:invite", ({ code, callerName }: { code: string; callerName: string }) => {
      setGroupInvite({ code, callerName });
    });

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("private-messages:read", handleRead);
      window.removeEventListener("private-messages:open", handleOpen);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [refresh]);

  const unreadCount = useMemo(() => chats.reduce((sum, chat) => sum + chat.unreadCount, 0), [chats]);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null;

  const handleRead = useCallback((chatId: string) => {
    setChats((current) => current.map((chat) => chat.id === chatId ? { ...chat, unreadCount: 0 } : chat));
  }, []);
  const consumeIncomingCall = useCallback(() => setIncomingCallSignal(null), []);

  function closeDrawer() {
    setOpen(false);
    setSelectedChatId(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          void refresh();
        }}
        title="Private messages"
        aria-label={`Private messages${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[var(--radius-sm)] border border-line bg-white text-teal-700 transition hover:bg-paper-2"
      >
        <svg width="17" height="17" aria-hidden="true"><use href="#i-chat" /></svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={closeDrawer} title={selectedChat ? `Chat with ${fallbackName(selectedChat, role)}` : "Private messages"}>
        {selectedChat ? (
          <PrivateConversation key={selectedChat.id} chat={selectedChat} role={role} onBack={() => {
            setSelectedChatId(null);
            void refresh();
          }} onRead={handleRead} incomingCall={incomingCallSignal?.chatId === selectedChat.id ? incomingCallSignal : null} onIncomingCallConsumed={consumeIncomingCall} />
        ) : <>
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-[#CFE5E0] bg-[#EFF8F6] p-4">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
              <svg width="17" height="17"><use href="#i-lock" /></svg>
            </span>
            <div>
              <div className="text-[13px] font-bold text-ink">Human support inbox</div>
              <p className="mt-1 text-[11px] leading-5 text-ink-soft">These are private conversations with a person, separate from the Inshuti AI chat.</p>
            </div>
          </div>
          {unreadCount > 0 && <span className="shrink-0 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold text-white">{unreadCount} new</span>}
        </div>

        {loading && chats.length === 0 && (
          <div className="space-y-3" aria-label="Loading private messages">
            {[0, 1, 2].map((item) => <div key={item} className="h-[78px] animate-pulse rounded-xl bg-white" />)}
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700"><svg width="27" height="27"><use href="#i-chat" /></svg></span>
            <h3 className="mt-4 text-[15px] font-bold text-ink">No private messages yet</h3>
            <p className="mt-2 max-w-sm text-[11px] leading-5 text-ink-soft">Human consultation conversations and replies will appear here.</p>
            <Link href="/consultations" onClick={() => setOpen(false)} className="mt-5 rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-semibold text-white">Open consultations</Link>
          </div>
        )}

        {chats.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {chats.map((chat) => {
              const name = fallbackName(chat, role);
              const time = chat.lastMessage?.createdAt ?? chat.updatedAt;
              return (
                <button
                  type="button"
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-4 text-left transition last:border-b-0 hover:bg-paper-2 ${chat.unreadCount ? "bg-[#F7FCFB]" : ""}`}
                >
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[14px] font-bold text-teal-700">
                    {name.charAt(0).toUpperCase()}
                    {chat.unreadCount > 0 && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-coral" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <strong className="truncate text-[13px] text-ink">{name}</strong>
                      <span className="shrink-0 text-[9.5px] text-ink-soft">{relativeTime(time)}</span>
                    </span>
                    <span className={`mt-1 block truncate text-[11px] ${chat.unreadCount ? "font-semibold text-ink" : "text-ink-soft"}`}>
                      {chat.lastMessage?.content ?? "Private consultation started"}
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-3 text-[9.5px] text-ink-soft">
                      <span>{chat.status.replace("_", " ")}</span>
                      {chat.unreadCount > 0 && <b className="rounded-full bg-coral px-2 py-0.5 text-white">{chat.unreadCount} unread</b>}
                    </span>
                  </span>
                  <span className="text-lg text-ink-soft">›</span>
                </button>
              );
            })}
          </div>
        )}

        {chats.length > 0 && (
          <Link href="/consultations" onClick={() => setOpen(false)} className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-teal-700 bg-white px-4 py-3 text-[11px] font-semibold text-teal-700">
            View all private conversations <svg width="14" height="14"><use href="#i-arrow" /></svg>
          </Link>
        )}
        </>}
      </Drawer>

      {groupInvite && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-[#CDE5DF] bg-white p-4 shadow-2xl">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7F3] text-lg">📞</span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-ink">Group call invite</div>
            <div className="mt-0.5 truncate text-[10.5px] text-ink-soft">{groupInvite.callerName} invited you to a group call</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => router.push(`/call?code=${groupInvite.code}`)} className="rounded-lg bg-teal-700 px-3 py-2 text-[10.5px] font-semibold text-white hover:bg-teal-900">Join</button>
            <button type="button" onClick={() => setGroupInvite(null)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-paper-2" aria-label="Dismiss invite"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
          </div>
        </div>
      )}
    </>
  );
}
