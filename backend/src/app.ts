import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";

import { env } from "./lib/env.js";
import { rateLimiter } from "./lib/rateLimiter.js";
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
import { adminUsersRouter, adminAdminsRouter } from "./routes/adminUsers.js";
import governmentRouter from "./routes/government.js";
import uploadsRouter from "./routes/uploads.js";
import monitoringRouter, { incrementRequestCounter, incrementErrorCounter } from "./routes/monitoring.js";
import reportsRouter from "./routes/reports.js";
import auditLogsRouter from "./routes/auditLogs.js";
import contactRouter from "./routes/contact.js";
import publicKbRouter from "./routes/publicKb.js";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  incrementErrorCounter();
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

  // Request counting for monitoring
  app.use((_req, _res, next) => { incrementRequestCounter(); next(); });

  // Global rate limit: 100 req/min per IP
  app.use(rateLimiter({ windowMs: 60_000, max: 100 }));

  // Stricter rate limit on auth and chat
  app.use("/api/auth", rateLimiter({ windowMs: 60_000, max: 10 }));
  app.use("/api/chat", rateLimiter({ windowMs: 60_000, max: 20 }));
  app.use("/api/users/register", rateLimiter({ windowMs: 60_000, max: 5 }));
  app.use("/api/users/forgot-password", rateLimiter({ windowMs: 60_000, max: 3 }));

  // Legacy /api/* routes (backward compatible)
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
  app.use("/api/admin/users", adminUsersRouter);
  app.use("/api/admin/admins", adminAdminsRouter);
  app.use("/api/government", governmentRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/monitoring", monitoringRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/audit-logs", auditLogsRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/library", publicKbRouter);

  // Versioned /api/v1/* routes
  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/chat", chatRouter);
  app.use("/api/v1/history", historyRouter);
  app.use("/api/v1/suggestions", suggestionsRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/kb", kbRouter);
  app.use("/api/v1/flagged", flaggedRouter);
  app.use("/api/v1/settings", settingsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/consultations", consultationsRouter);
  app.use("/api/v1/appointments", appointmentsRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/facilities", facilitiesRouter);
  app.use("/api/v1/admin/users", adminUsersRouter);
  app.use("/api/v1/admin/admins", adminAdminsRouter);
  app.use("/api/v1/government", governmentRouter);
  app.use("/api/v1/uploads", uploadsRouter);
  app.use("/api/v1/monitoring", monitoringRouter);
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/audit-logs", auditLogsRouter);
  app.use("/api/v1/contact", contactRouter);
  app.use("/api/v1/library", publicKbRouter);

  app.use(errorHandler);

  return app;
}
