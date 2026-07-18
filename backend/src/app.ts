import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";

import { env } from "./lib/env.js";
import chatRouter from "./routes/chat.js";
import healthRouter from "./routes/health.js";
import historyRouter from "./routes/history.js";
import suggestionsRouter from "./routes/suggestions.js";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

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
  app.use("/api/chat", chatRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/suggestions", suggestionsRouter);

  app.use(errorHandler);

  return app;
}
