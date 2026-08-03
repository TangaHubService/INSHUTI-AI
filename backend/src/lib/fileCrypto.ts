import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import { env } from "./env.js";

const MAGIC = Buffer.from("INSHUTI1");
const KEY = crypto.createHash("sha256").update(env.MESSAGE_ENCRYPTION_KEY).digest();

export async function encryptFileAtRest(filePath: string): Promise<void> {
  const plaintext = await readFile(filePath);
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  await writeFile(filePath, Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), ciphertext]), { mode: 0o600 });
}

export async function decryptFileAtRest(filePath: string): Promise<Buffer> {
  const payload = await readFile(filePath);
  if (!payload.subarray(0, MAGIC.length).equals(MAGIC)) return payload;
  const nonceStart = MAGIC.length;
  const tagStart = nonceStart + 12;
  const ciphertextStart = tagStart + 16;
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, payload.subarray(nonceStart, tagStart));
  decipher.setAuthTag(payload.subarray(tagStart, ciphertextStart));
  return Buffer.concat([decipher.update(payload.subarray(ciphertextStart)), decipher.final()]);
}
