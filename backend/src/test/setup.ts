import { vi, beforeAll } from "vitest";

process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "test-jwt-secret-at-least-16-chars";
process.env.SESSION_COOKIE_SECRET = "test-session-secret-at-least-16";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.MESSAGE_ENCRYPTION_KEY = "test-encryption-key-min-32-chars!!";
process.env.NODE_ENV = "test";

// ── Prisma mock ──────────────────────────────────────────────
const mockQueryMethods = () => ({
  findUnique: vi.fn().mockReturnValue(null),
  findFirst: vi.fn().mockReturnValue(null),
  findMany: vi.fn().mockReturnValue([]),
  create: vi.fn().mockImplementation((args) => ({ id: "mock-id", createdAt: new Date(), ...(args.data ?? {}) })),
  update: vi.fn().mockImplementation((args) => args.data ?? {}),
  delete: vi.fn().mockReturnValue({}),
  deleteMany: vi.fn().mockReturnValue({ count: 0 }),
  count: vi.fn().mockReturnValue(0),
  upsert: vi.fn().mockImplementation((args) => args.create ?? {}),
  aggregate: vi.fn().mockReturnValue({ _count: 0, _avg: null, _sum: null, _min: null, _max: null }),
  groupBy: vi.fn().mockReturnValue([]),
  findFirstOrThrow: vi.fn().mockReturnValue({}),
  findUniqueOrThrow: vi.fn().mockReturnValue({}),
});

const allModels = [
  "topic", "article", "conversation", "message", "flaggedItem",
  "adminUser", "crisisResource", "user", "healthcareProfessional",
  "governmentUser", "consultation", "appointment", "notification",
  "healthFacility", "appSettings", "contactInquiry", "auditLog", "fileAttachment",
];

const mockPrisma = Object.fromEntries(
  allModels.map((model) => [model, mockQueryMethods()]),
);
mockPrisma.$connect = vi.fn();
mockPrisma.$disconnect = vi.fn();
mockPrisma.$on = vi.fn();
mockPrisma.$use = vi.fn();
mockPrisma.$transaction = vi.fn((arg: unknown) => {
  if (Array.isArray(arg)) return Promise.resolve(arg.map(() => ({ count: 0 })));
  if (typeof arg === "function") return Promise.resolve(arg(mockPrisma));
  return Promise.resolve({ count: 0 });
});

vi.mock("../lib/prisma.js", () => ({ prisma: mockPrisma }));

beforeAll(async () => {
  // Prisma is mocked in tests — no real DB connection needed.
});
