import crypto from "node:crypto";
import { type Server as SocketIOServer } from "socket.io";

import { prisma } from "./prisma.js";
import { deserializeToken } from "./userAuth.js";
import { env } from "./env.js";

const ENCRYPTION_KEY = env.MESSAGE_ENCRYPTION_KEY;
const TOKEN_COOKIE = "inshuti_user_token";

const onlineUsers = new Set<string>();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(ENCRYPTION_KEY).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

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

export function setupConsultationSocket(io: SocketIOServer): void {
  const chatListNamespace = io.of("/chat-list");

  chatListNamespace.on("connection", async (socket) => {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies[TOKEN_COOKIE];
    if (!token) { socket.disconnect(); return; }
    const payload = deserializeToken(token);
    if (!payload) { socket.disconnect(); return; }

    onlineUsers.add(payload.userId);
    socket.join("online");

    socket.on("disconnect", () => {
      onlineUsers.delete(payload.userId);
    });
  });

  const consultationNamespace = io.of(/^\/consultation\/(.+)$/);

  consultationNamespace.on("connection", async (socket) => {
    const consultationId = socket.nsp.name.split("/").pop() ?? "";

    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies[TOKEN_COOKIE];
    if (!token) {
      socket.emit("error", "Authentication required");
      socket.disconnect();
      return;
    }

    const payload = deserializeToken(token);
    if (!payload) {
      socket.emit("error", "Invalid token");
      socket.disconnect();
      return;
    }
    const userId = payload.userId;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        user: { select: { id: true, name: true, role: true } },
        professional: { include: { user: { select: { id: true, name: true, role: true } } } },
      },
    });
    if (!consultation) {
      socket.emit("error", "Consultation not found");
      socket.disconnect();
      return;
    }

    const professional = await prisma.healthcareProfessional.findUnique({ where: { userId } });
    const isUser = consultation.userId === userId;
    const isProfessional = !!professional && consultation.professionalId === professional.id;
    if (!isUser && !isProfessional) {
      socket.emit("error", "Not authorized");
      socket.disconnect();
      return;
    }

    const otherUserId = isUser
      ? consultation.professional?.userId
      : consultation.userId;

    onlineUsers.add(userId);
    socket.join(consultationId);

    if (otherUserId) {
      io.of(`/consultation/${consultationId}`).emit("user:online", {
        userId: otherUserId,
        online: onlineUsers.has(otherUserId),
      });
    }

    socket.on("message:send", async (content: string) => {
      if (typeof content !== "string" || content.trim().length === 0) return;

      const encryptedContent = encrypt(content);

      const message = await prisma.message.create({
        data: {
          conversationId: consultation.conversationId,
          consultationId: consultation.id,
          role: isUser ? "USER" : "ASSISTANT",
          content: encryptedContent,
        },
      });

      io.of(`/consultation/${consultationId}`).emit("message:new", {
        id: message.id,
        role: message.role,
        content,
        createdAt: message.createdAt,
        senderId: userId,
        senderName: isUser
          ? consultation.user.name
          : (consultation.professional?.user.name ?? "Professional"),
      });
    });

    socket.on("messages:read", async (messageIds: string[]) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;
      const now = new Date();
      await prisma.message.updateMany({
        where: { id: { in: messageIds }, consultationId, readAt: null },
        data: { readAt: now },
      });
      io.of(`/consultation/${consultationId}`).emit("messages:read", {
        messageIds,
        readAt: now.toISOString(),
      });
    });

    socket.on("typing:start", () => {
      socket.to(consultationId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", () => {
      socket.to(consultationId).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      if (otherUserId) {
        io.of(`/consultation/${consultationId}`).emit("user:online", {
          userId: otherUserId,
          online: onlineUsers.has(otherUserId),
        });
      }
    });
  });
}
