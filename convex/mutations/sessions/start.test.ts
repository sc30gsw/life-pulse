import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("creates an active session with the given category and dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    category: "toeic",
    dateJst: "2026-07-07",
    plannedMinutes: 60,
  });

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("active");
  expect(session?.category).toBe("toeic");
  expect(session?.userId).toBe(userId);
  expect(session?.accumulatedMs).toBe(0);
  expect(session?.interruptionCount).toBe(0);
  expect(session?.abandonJobId).toBeDefined();
});

test("rejects starting a second session while one is active", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await asSelf.mutation(api.mutations.sessions.start.start, {
    category: "toeic",
    dateJst: "2026-07-07",
  });

  await expect(
    asSelf.mutation(api.mutations.sessions.start.start, {
      category: "eikaiwa",
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("rejects starting a second session while one is paused", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      category: "toeic",
      dateJst: "2026-07-07",
      interruptionCount: 0,
      startedAt: 0,
      status: "paused",
      userId,
    }),
  );

  await expect(
    asSelf.mutation(api.mutations.sessions.start.start, {
      category: "eikaiwa",
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.sessions.start.start, {
      category: "toeic",
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});
