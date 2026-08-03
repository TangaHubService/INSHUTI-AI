import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  SESSION_COOKIE_SECRET: z
    .string()
    .min(16, "SESSION_COOKIE_SECRET must be at least 16 characters"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Optional comma-separated list of additional CORS origins beyond NEXT_PUBLIC_APP_URL.
  // Example: "https://inshuti-ai.netlify.app,https://inshuti.org"
  CORS_ALLOWED_ORIGINS: z.string().default(""),

  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Phase 9 — swappable email provider. "console" (default) logs instead of
  // sending, so local dev never needs real SMTP credentials.
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Consultation message encryption — required in production.
  MESSAGE_ENCRYPTION_KEY: process.env.NODE_ENV === "production"
    ? z.string().min(32, "MESSAGE_ENCRYPTION_KEY must be at least 32 characters")
    : z.string().min(32).default("test-encryption-key-min-32-chars!!"),

  // File uploads
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),

  // SMS provider — "stub" (default) logs instead of sending.
  SMS_PROVIDER: z.enum(["stub", "twilio"]).default("stub"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM: z.string().optional(),

  VAPID_PUBLIC_KEY: z.string().default(""),
  VAPID_PRIVATE_KEY: z.string().default(""),
  VAPID_SUBJECT: z.string().default("mailto:admin@inshuti.rw"),
  ANONYMOUS_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  GOV_AGGREGATE_MIN_COUNT: z.coerce.number().int().min(2).default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — check backend/.env against .env.example");
}

export const env = parsed.data;
