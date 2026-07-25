import { env } from "./env.js";

interface SmsMessage {
  to: string;
  body: string;
}

interface SmsProvider {
  send(message: SmsMessage): Promise<void>;
}

class StubSmsProvider implements SmsProvider {
  async send(message: SmsMessage): Promise<void> {
    console.log(`[sms:stub] to=${message.to} body="${message.body}" (no SMS gateway configured yet)`);
  }
}

class TwilioSmsProvider implements SmsProvider {
  private baseUrl: string;
  private auth: string;

  constructor() {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM) {
      throw new Error("SMS_PROVIDER=twilio requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM");
    }
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
    this.auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  }

  async send(message: SmsMessage): Promise<void> {
    const body = new URLSearchParams({ To: message.to, From: env.TWILIO_FROM!, Body: message.body });
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { Authorization: `Basic ${this.auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Twilio SMS failed (${res.status}): ${text}`);
    }
  }
}

const provider: SmsProvider = env.SMS_PROVIDER === "twilio" ? new TwilioSmsProvider() : new StubSmsProvider();

export async function sendSms(to: string, body: string): Promise<void> {
  await provider.send({ to, body });
}
