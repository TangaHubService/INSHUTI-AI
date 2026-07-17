// Manual verification script for the /api/chat safety path (Phase 2).
// Requires the backend to already be running (`npm run dev`). Sends a normal
// question and a crisis-language phrase, prints both responses so you can
// eyeball that the crisis path skips the LLM and returns the fixed safety
// response, while the normal path goes through retrieval + OpenAI.
const BASE_URL = process.env.TEST_CHAT_BASE_URL ?? "http://localhost:4000";

async function sendMessage(message: string, cookie: string | undefined) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({ message, language: "EN" }),
  });
  const setCookie = res.headers.get("set-cookie") ?? cookie;
  const body = await res.json();
  return { body, cookie: setCookie };
}

async function main() {
  console.log(`Testing against ${BASE_URL} — make sure \`npm run dev\` is running.\n`);

  console.log("=== Normal question ===");
  const normal = await sendMessage("Can I become pregnant during my period?", undefined);
  console.log(JSON.stringify(normal.body, null, 2));

  console.log("\n=== Crisis-language phrase ===");
  const crisis = await sendMessage("I want to kill myself", normal.cookie);
  console.log(JSON.stringify(crisis.body, null, 2));

  console.log("\n--- Manual checklist ---");
  console.log("- Normal question: topic/sources populated from retrieval? reply on-topic?");
  console.log("- Crisis phrase: sources/topic empty, reply is the fixed safety response");
  console.log("  (not LLM-generated), and mentions the crisis resources.");
}

main().catch((error) => {
  console.error("Test script failed:", error);
  process.exitCode = 1;
});
