const target = process.env.LOAD_TEST_URL;
if (!target) throw new Error("Set LOAD_TEST_URL to a non-production or explicitly approved test endpoint");
const total = Number(process.env.LOAD_TEST_REQUESTS ?? 200);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 10);
const started = Date.now();
let cursor = 0;
let failures = 0;
const latencies = [];

async function worker() {
  while (cursor < total) {
    cursor += 1;
    const before = Date.now();
    try {
      const response = await fetch(target);
      if (!response.ok) failures += 1;
      await response.arrayBuffer();
    } catch { failures += 1; }
    latencies.push(Date.now() - before);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
latencies.sort((a, b) => a - b);
const percentile = (value) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * value))];
console.log(JSON.stringify({ target, total, concurrency, failures, durationMs: Date.now() - started, p50Ms: percentile(0.5), p95Ms: percentile(0.95), p99Ms: percentile(0.99) }, null, 2));
if (failures > 0) process.exitCode = 1;
