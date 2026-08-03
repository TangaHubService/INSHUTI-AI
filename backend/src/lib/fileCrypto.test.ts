import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { decryptFileAtRest, encryptFileAtRest } from "./fileCrypto.js";

describe("attachment encryption", () => {
  let directory = "";
  afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

  it("encrypts files on disk and decrypts only for authorized delivery", async () => {
    directory = await mkdtemp(path.join(tmpdir(), "inshuti-file-"));
    const file = path.join(directory, "voice.webm");
    const original = Buffer.from("sensitive attachment bytes");
    await writeFile(file, original);
    await encryptFileAtRest(file);
    expect((await readFile(file)).includes(original)).toBe(false);
    expect(await decryptFileAtRest(file)).toEqual(original);
  });
});
