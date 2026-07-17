import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./lib/env.js";
import healthRouter from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/health", healthRouter);

  return app;
}
