import crypto from "node:crypto";
import { type Server as SocketIOServer } from "socket.io";

import { prisma } from "./prisma.js";
import { deserializeToken } from "./userAuth.js";
import { env } from "./env.js";

const ENCRYPTION_KEY = env.MESSAGE_ENCRYPTION_KEY;
const TOKEN_COOKIE = "inshuti_user_token";

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

    const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
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

    socket.join(consultationId);

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
      });
    });
  });
}
