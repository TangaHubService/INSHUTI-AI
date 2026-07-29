import http from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { setupConsultationSocket } from "./lib/consultationSocket.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [env.NEXT_PUBLIC_APP_URL, ...env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)],
    credentials: true,
  },
});

setupConsultationSocket(io);

server.listen(env.PORT, () => {
  console.log(`inshuti backend listening on http://localhost:${env.PORT}`);
});
