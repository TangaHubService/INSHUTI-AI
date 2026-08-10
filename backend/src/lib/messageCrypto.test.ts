import { describe, expect, it } from "vitest";

import { decryptMessage, decryptMessageForDisplay, encryptMessage } from "./messageCrypto.js";

describe("consultation message encryption", () => {
  it("round trips with authenticated AES-GCM", () => {
    const encrypted = encryptMessage("private health message");
    expect(encrypted).toMatch(/^v2:/);
    expect(encrypted).not.toContain("private health message");
    expect(decryptMessage(encrypted)).toBe("private health message");
  });

  it("rejects tampering", () => {
    const encrypted = encryptMessage("private health message");
    const parts = encrypted.split(":");
    const ciphertext = Buffer.from(parts[3], "base64url");
    ciphertext[0] ^= 1;
    parts[3] = ciphertext.toString("base64url");
    const tampered = parts.join(":");
    expect(() => decryptMessage(tampered)).toThrow();
    expect(decryptMessageForDisplay(tampered)).toBe("[This message could not be decrypted]");
  });

  it("keeps legacy plaintext consultation messages readable", () => {
    expect(decryptMessageForDisplay("A message saved before encryption was enabled.")).toBe(
      "A message saved before encryption was enabled.",
    );
  });
});
