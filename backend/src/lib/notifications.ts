import nodemailer, { type Transporter } from "nodemailer";

import { prisma } from "./prisma.js";
import { env } from "./env.js";
import { decodeNotificationPrefs } from "./notificationPrefs.js";
import type { NotificationType } from "./constants.js";

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

// Default provider — logs instead of sending, so local dev and CI never need
// real SMTP credentials. Swap via EMAIL_PROVIDER=smtp (see SmtpEmailProvider).
class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email:console] to=${message.to} subject="${message.subject}"\n${message.body}`);
  }
}

class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter;
  private from: string;

  constructor() {
    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_FROM) {
      throw new Error("EMAIL_PROVIDER=smtp requires SMTP_HOST, SMTP_PORT, and SMTP_FROM to be set");
    }
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    this.from = env.SMTP_FROM;
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({ from: this.from, to: message.to, subject: message.subject, text: message.body });
  }
}

const emailProvider: EmailProvider = env.EMAIL_PROVIDER === "smtp" ? new SmtpEmailProvider() : new ConsoleEmailProvider();

// SMS: stub interface only. Wire to a real Rwandan SMS gateway once the
// client confirms which provider they've contracted (Phase 9 spec) — do not
// guess a vendor in the meantime.
interface SmsProvider {
  send(to: string, body: string): Promise<void>;
}

class StubSmsProvider implements SmsProvider {
  async send(to: string, body: string): Promise<void> {
    console.log(`[sms:stub] to=${to} body="${body}" (no SMS gateway configured yet)`);
  }
}

const smsProvider: SmsProvider = new StubSmsProvider();

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return;

  const channels = decodeNotificationPrefs(user.notificationPrefs)[params.type];

  if (channels.IN_APP) {
    await prisma.notification.create({
      data: { userId: user.id, type: params.type, title: params.title, body: params.body },
    });
  }

  if (channels.EMAIL) {
    try {
      await emailProvider.send({ to: user.email, subject: params.title, body: params.body });
    } catch (err) {
      console.error(`[notifications] email send failed for user ${user.id}:`, err);
    }
  }

  if (channels.SMS && user.phone) {
    try {
      await smsProvider.send(user.phone, `${params.title}: ${params.body}`);
    } catch (err) {
      console.error(`[notifications] sms send failed for user ${user.id}:`, err);
    }
  }
}

export async function queueAppointmentReminder(appointmentId: string): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { professional: { include: { user: true } } },
  });
  if (!appointment) return;

  await notifyUser({
    userId: appointment.userId,
    type: "APPOINTMENT_REMINDER",
    title: "Appointment reminder",
    body: `You have an appointment with ${appointment.professional.user.name} on ${appointment.requestedTime.toLocaleString()}.`,
  });
}
