"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { getCurrentUser } from "@/lib/userApiClient";
import { useToast } from "@/lib/useToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WEBRTC_STUN_URL = process.env.NEXT_PUBLIC_WEBRTC_STUN_URL ?? "stun:stun.l.google.com:19302";

type RemoteParticipant = { userId: string; name: string; stream: MediaStream | null };
type Invitee = { id: string; name: string };

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

function makeCode() {
  return `call-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function GroupCall({
  code,
  invitees = [],
  onClose,
}: {
  code?: string;
  invitees?: Invitee[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [callCode, setCallCode] = useState<string>(() => code ?? "");
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [myName, setMyName] = useState("");
  const myIdRef = useRef<string>("");
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const namesRef = useRef<Map<string, string>>(new Map());

  const setRemoteStream = useCallback((userId: string, stream: MediaStream | null) => {
    setParticipants((prev) => {
      const existing = prev.find((p) => p.userId === userId);
      if (existing) return prev.map((p) => (p.userId === userId ? { ...p, stream } : p));
      return [...prev, { userId, name: namesRef.current.get(userId) ?? "Participant", stream }];
    });
  }, []);

  const closePeer = useCallback((userId: string) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.close();
    }
    peersRef.current.delete(userId);
    pendingCandidatesRef.current.delete(userId);
    setParticipants((prev) => prev.filter((p) => p.userId !== userId));
  }, []);

  const flushPending = useCallback(async (userId: string) => {
    const peer = peersRef.current.get(userId);
    if (!peer?.remoteDescription) return;
    const candidates = pendingCandidatesRef.current.get(userId) ?? [];
    pendingCandidatesRef.current.set(userId, []);
    for (const candidate of candidates) await peer.addIceCandidate(candidate).catch(() => {});
  }, []);

  const createPeer = useCallback(
    (userId: string, name: string, stream: MediaStream) => {
      peersRef.current.get(userId)?.close();
      namesRef.current.set(userId, name);
      const peer = new RTCPeerConnection({ iceServers: [{ urls: WEBRTC_STUN_URL }] });
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      peer.onicecandidate = (event) => {
        if (event.candidate && socketRef.current?.connected) {
          socketRef.current.emit("group:ice-candidate", { to: userId, candidate: event.candidate.toJSON() });
        }
      };
      peer.ontrack = (event) => {
        const existing = participants.find((p) => p.userId === userId);
        const nextStream = existing?.stream ?? new MediaStream();
        event.streams[0]?.getTracks().forEach((track) => {
          if (!nextStream.getTracks().includes(track)) nextStream.addTrack(track);
        });
        if (event.track && !nextStream.getTracks().includes(event.track)) nextStream.addTrack(event.track);
        setRemoteStream(userId, nextStream);
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "closed") closePeer(userId);
      };
      peersRef.current.set(userId, peer);
      return peer;
    },
    [closePeer, participants, setRemoteStream],
  );

  const handleOffer = useCallback(
    async (from: string, fromName: string, offer: RTCSessionDescriptionInit) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      if (!peersRef.current.has(from)) createPeer(from, fromName, stream);
      const peer = peersRef.current.get(from)!;
      if (peer.signalingState === "have-local-offer") {
        // glare: the participant with the larger id answers the incoming offer
        if (myIdRef.current > from) {
          try { await peer.setLocalDescription({ type: "rollback", sdp: undefined }); } catch { /* ignore */ }
          await peer.setRemoteDescription(offer);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await waitForIceGathering(peer);
          socketRef.current?.emit("group:answer", { to: from, answer: peer.localDescription ?? answer });
        }
        return;
      }
      await peer.setRemoteDescription(offer);
      await flushPending(from);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await waitForIceGathering(peer);
      socketRef.current?.emit("group:answer", { to: from, answer: peer.localDescription ?? answer });
    },
    [createPeer, flushPending],
  );

  const handleAnswer = useCallback(
    async (from: string, answer: RTCSessionDescriptionInit) => {
      const peer = peersRef.current.get(from);
      if (!peer) return;
      await peer.setRemoteDescription(answer).catch(() => {});
      await flushPending(from);
    },
    [flushPending],
  );

  const handleCandidate = useCallback(async (from: string, candidate: RTCIceCandidateInit) => {
    const peer = peersRef.current.get(from);
    if (!peer) return;
    if (peer.remoteDescription) await peer.addIceCandidate(candidate).catch(() => {});
    else pendingCandidatesRef.current.set(from, [...(pendingCandidatesRef.current.get(from) ?? []), candidate]);
  }, []);

  const driveOffers = useCallback(
    async (targets: { userId: string; name: string }[]) => {
      const stream = localStreamRef.current;
      const socket = socketRef.current;
      if (!stream || !socket) return;
      for (const target of targets) {
        if (myIdRef.current === target.userId) continue;
        if (peersRef.current.has(target.userId)) continue;
        const peer = createPeer(target.userId, target.name, stream);
        try {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          await waitForIceGathering(peer);
          socket.emit("group:offer", { to: target.userId, offer: peer.localDescription ?? offer });
        } catch {
          closePeer(target.userId);
        }
      }
    },
    [closePeer, createPeer],
  );

  useEffect(() => {
    let cancelled = false;
    void getCurrentUser().then((user) => {
      if (cancelled || !user) return;
      myIdRef.current = user.id;
      setMyName(user.name);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!callCode || !myIdRef.current) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    const peers = peersRef.current;
    const pending = pendingCandidatesRef.current;

    async function boot() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch {
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { stream = null; }
      }
      if (cancelled) return;
      localStreamRef.current = stream;
      setLocalStream(stream);

      const socket = io(`${API_URL}/call/${callCode}`, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("group:error", (message: string) => toast(message, "error"));
      socket.on("disconnect", () => setConnected(false));

      socket.on("group:participants", async ({ participants: existing }: { participants: { userId: string; name: string }[] }) => {
        if (cancelled) return;
        existing.forEach((p) => namesRef.current.set(p.userId, p.name));
        setParticipants((prev) => [
          ...prev,
          ...existing
            .filter((p) => p.userId !== myIdRef.current)
            .map((p) => ({ userId: p.userId, name: p.name, stream: null })),
        ]);
        await driveOffers(existing);
      });

      socket.on("group:participant-joined", ({ participant }: { participant: { userId: string; name: string } }) => {
        if (cancelled || participant.userId === myIdRef.current) return;
        namesRef.current.set(participant.userId, participant.name);
        setParticipants((prev) =>
          prev.some((p) => p.userId === participant.userId)
            ? prev
            : [...prev, { userId: participant.userId, name: participant.name, stream: null }],
        );
      });

      socket.on("group:offer", ({ from, fromName, offer }: { from: string; fromName: string; offer: RTCSessionDescriptionInit }) => {
        if (from === myIdRef.current) return;
        void handleOffer(from, fromName, offer);
      });
      socket.on("group:answer", ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
        if (from === myIdRef.current) return;
        void handleAnswer(from, answer);
      });
      socket.on("group:ice-candidate", ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        if (from === myIdRef.current) return;
        void handleCandidate(from, candidate);
      });
      socket.on("group:participant-left", ({ userId }: { userId: string }) => closePeer(userId));
    }

    void boot();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      peers.forEach((peer) => peer.close());
      peers.clear();
      pending.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      stream?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setParticipants([]);
    };
  }, [callCode, closePeer, driveOffers, handleAnswer, handleCandidate, handleOffer, toast]);

  useEffect(() => {
    if (myName && !callCode) setCallCode(makeCode());
  }, [myName, callCode]);

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

  function copyInvite() {
    const link = `${window.location.origin}/call?code=${callCode}`;
    navigator.clipboard.writeText(link).then(() => toast("Invite link copied", "info")).catch(() => {});
  }

  function invite(participant: Invitee) {
    socketRef.current?.emit("group:invite", { to: participant.id });
    toast(`Invite sent to ${participant.name}`, "success");
  }

  function leave() {
    socketRef.current?.emit("group:leave");
    onClose();
  }

  const total = participants.length + 1;
  const remoteCount = participants.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#101817] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg">📞</span>
          <div>
            <div className="text-sm font-bold">{total} in call · Group Call</div>
            <div className="text-[10px] text-white/60">
              {connected ? `Joined · ${myName}` : "Connecting…"}
            </div>
          </div>
        </div>
        <button type="button" onClick={copyInvite} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[11px] font-semibold hover:bg-white/15">
          📋 Copy invite link
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className={`mx-auto grid max-w-6xl gap-3 ${remoteCount === 0 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black/40">
            {localStream && !cameraOff ? (
              <video ref={(el) => { if (el) el.srcObject = localStream; }} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F1EF] text-[26px] font-bold text-[#08786F]">{myName.charAt(0).toUpperCase()}</span>
                <span className="mt-3 text-xs text-white/70">You · {myName}</span>
              </div>
            )}
            <span className="absolute left-2 top-2 rounded bg-black/55 px-2 py-1 text-[9px] font-semibold">You</span>
            {muted && <span className="absolute right-2 top-2 rounded bg-black/55 px-2 py-1 text-[10px]">🔇</span>}
          </div>

          {participants.map((participant) => (
            <div key={participant.userId} className="relative aspect-video overflow-hidden rounded-xl bg-black/40">
              {participant.stream ? (
                <video ref={(el) => { if (el) el.srcObject = participant.stream; }} autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F1EF] text-[26px] font-bold text-[#08786F]">{participant.name.charAt(0).toUpperCase()}</span>
                  <span className="mt-3 text-xs text-white/70">{participant.name}</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 text-[9px] font-semibold">{participant.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={toggleMute} className={`flex h-12 w-12 items-center justify-center rounded-full ${muted ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`} aria-label={muted ? "Unmute" : "Mute"}>{muted ? "🔇" : "🎙"}</button>
          <button type="button" onClick={toggleCamera} className={`flex h-12 w-12 items-center justify-center rounded-full ${cameraOff ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`} aria-label="Toggle camera">🎥</button>
          <button type="button" onClick={leave} className="flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold hover:bg-red-500">📵 End call</button>
        </div>
        {invitees.length > 0 && (
          <div className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-white/50">Invite:</span>
            {invitees.map((invitee) => (
              <button key={invitee.id} type="button" onClick={() => invite(invitee)} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/20">＋ {invitee.name}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}