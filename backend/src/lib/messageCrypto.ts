import crypto from "node:crypto";

import { env } from "./env.js";

const KEY = crypto.createHash("sha256").update(env.MESSAGE_ENCRYPTION_KEY).digest();

/** Authenticated encryption at rest. This is intentionally not described as E2EE. */
export function encryptMessage(plaintext: string): string {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return ["v2", nonce.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptMessage(payload: string): string {
  const parts = payload.split(":");
  if (parts[0] === "v2" && parts.length === 4) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(parts[1], "base64url"));
    decipher.setAuthTag(Buffer.from(parts[2], "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
  }
  if (parts.length === 2) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, Buffer.from(parts[0], "hex"));
    return Buffer.concat([decipher.update(Buffer.from(parts[1], "hex")), decipher.final()]).toString("utf8");
  }
  throw new Error("Unsupported encrypted message format");
}

/** Reads encrypted consultation messages while preserving pre-encryption legacy rows. */
export function decryptMessageForDisplay(payload: string): string {
  try {
    return decryptMessage(payload);
  } catch {
    const looksEncrypted = payload.startsWith("v2:") || /^[a-f\d]+:[a-f\d]+$/i.test(payload);
    return looksEncrypted ? "[This message could not be decrypted]" : payload;
  }
}

export function messagePreview(payload: string, maxLength = 100): string {
  try {
    return decryptMessage(payload).slice(0, maxLength);
  } catch {
    // AI conversation messages predate consultation encryption and remain
    // ordinary text, so they can safely be displayed as-is in their own chat.
    return payload.slice(0, maxLength);
  }
}
