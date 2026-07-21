import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";

import { env } from "./lib/env.js";
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import dashboardRouter from "./routes/dashboard.js";
import flaggedRouter from "./routes/flagged.js";
import healthRouter from "./routes/health.js";
import historyRouter from "./routes/history.js";
import kbRouter from "./routes/kb.js";
import settingsRouter from "./routes/settings.js";
import suggestionsRouter from "./routes/suggestions.js";
import usersRouter from "./routes/users.js";
import consultationsRouter from "./routes/consultations.js";
import appointmentsRouter from "./routes/appointments.js";
import notificationsRouter from "./routes/notifications.js";
import facilitiesRouter from "./routes/facilities.js";

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
  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/kb", kbRouter);
  app.use("/api/flagged", flaggedRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/consultations", consultationsRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/facilities", facilitiesRouter);

  app.use(errorHandler);

  return app;
}
