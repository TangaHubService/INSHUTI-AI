import http from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { setupConsultationSocket } from "./lib/consultationSocket.js";
import { setupGroupCallSocket } from "./lib/groupCallSocket.js";
import { processDueAppointmentReminders } from "./lib/notifications.js";
import { purgeExpiredAnonymousConversations } from "./lib/retention.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [env.NEXT_PUBLIC_APP_URL, ...env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)],
    credentials: true,
  },
});

setupConsultationSocket(io);
setupGroupCallSocket(io);

const reminderTimer = setInterval(() => {
  void processDueAppointmentReminders().catch((error) => console.error("appointment reminder worker failed", error));
}, 60_000);
reminderTimer.unref();
void processDueAppointmentReminders().catch((error) => console.error("appointment reminder worker failed", error));
const retentionTimer = setInterval(() => {
  void purgeExpiredAnonymousConversations().catch((error) => console.error("retention worker failed", error));
}, 24 * 60 * 60 * 1000);
retentionTimer.unref();
void purgeExpiredAnonymousConversations().catch((error) => console.error("retention worker failed", error));

server.listen(env.PORT, () => {
  console.log(`inshuti backend listening on http://localhost:${env.PORT}`);
});
