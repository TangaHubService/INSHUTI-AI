import { type Server as SocketIOServer } from "socket.io";

import { prisma } from "./prisma.js";
import { deserializeToken } from "./userAuth.js";

const TOKEN_COOKIE = "inshuti_user_token";

interface GroupParticipant {
  userId: string;
  name: string;
}

const rooms = new Map<string, Map<string, GroupParticipant>>();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function setupGroupCallSocket(io: SocketIOServer): void {
  const callNamespace = io.of(/^\/call\/(.+)$/);

  callNamespace.on("connection", async (socket) => {
    const code = socket.nsp.name.split("/").pop() ?? "";
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies[TOKEN_COOKIE];
    const payload = token ? deserializeToken(token) : null;
    if (!payload) {
      socket.emit("group:error", "Authentication required");
      socket.disconnect();
      return;
    }
    const { userId } = payload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    if (!user) {
      socket.disconnect();
      return;
    }

    const room = rooms.get(code) ?? new Map<string, GroupParticipant>();
    room.set(userId, { userId, name: user.name });
    rooms.set(code, room);

    socket.join(code);

    const existing = Array.from(room.entries())
      .filter(([id]) => id !== userId)
      .map(([, participant]) => participant);

    socket.emit("group:participants", { participants: existing });
    socket.to(code).emit("group:participant-joined", {
      participant: { userId: user.id, name: user.name },
    });

    socket.on("group:offer", (payload: { to?: string; offer?: unknown }) => {
      if (typeof payload?.to !== "string" || !payload.offer) return;
      if (!room.has(payload.to)) return;
      const sender = room.get(userId);
      socket.to(code).emit("group:offer", {
        from: userId,
        fromName: sender?.name ?? user.name,
        to: payload.to,
        offer: payload.offer,
      });
    });

    socket.on("group:answer", (payload: { to?: string; answer?: unknown }) => {
      if (typeof payload?.to !== "string" || !payload.answer) return;
      if (!room.has(payload.to)) return;
      socket.to(code).emit("group:answer", { from: userId, to: payload.to, answer: payload.answer });
    });

    socket.on("group:ice-candidate", (payload: { to?: string; candidate?: unknown }) => {
      if (typeof payload?.to !== "string" || !payload.candidate) return;
      if (!room.has(payload.to)) return;
      socket.to(code).emit("group:ice-candidate", {
        from: userId,
        to: payload.to,
        candidate: payload.candidate,
      });
    });

    socket.on("group:invite", async (payload: { to?: string }) => {
      if (typeof payload?.to !== "string" || payload.to === userId) return;
      const invitedUser = await prisma.user.findUnique({ where: { id: payload.to }, select: { id: true } }).catch(() => null);
      if (!invitedUser) {
        socket.emit("group:error", "User not found");
        return;
      }
      io.of("/chat-list").to(payload.to).emit("group-call:invite", {
        code,
        callerName: user.name,
        callerId: userId,
      });
    });

    socket.on("group:leave", cleanup);
    socket.on("disconnect", cleanup);

    function cleanup() {
      const roomForCode = rooms.get(code);
      if (!roomForCode) return;
      roomForCode.delete(userId);
      socket.to(code).emit("group:participant-left", { userId });
      if (roomForCode.size === 0) rooms.delete(code);
    }
  });
}
