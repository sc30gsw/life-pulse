import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedSession(
  t: ReturnType<typeof convexTest>,
  userId: Id<"appUsers">,
  overrides: { accumulatedMs?: number; dateJst: string; startedAt?: number },
) {
  return await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: overrides.accumulatedMs ?? 1_800_000,
      category: "toeic",
      dateJst: overrides.dateJst,
      endedAt: overrides.startedAt ?? 0,
      interruptionCount: 1,
      startedAt: overrides.startedAt ?? 0,
      status: "completed",
      userId,
    }),
  );
}

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.sessions.history.history, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("groups the caller's sessions by date, newest first", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  await seedSession(t, userId, { dateJst: "2026-07-05", startedAt: 2_000 });
  await seedSession(t, userId, { accumulatedMs: 600_000, dateJst: "2026-07-05", startedAt: 1_000 });
  await seedSession(t, userId, { dateJst: "2026-07-03" });
  // Outside the requested range — must not appear.
  await seedSession(t, userId, { dateJst: "2026-06-01" });

  const result = await asSelf.query(api.queries.sessions.history.history, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-07",
  });

  expect(result.days.map((day) => day.dateJst)).toEqual(["2026-07-05", "2026-07-03"]);
  // Within a day, sessions are ordered by startedAt ascending.
  expect(result.days[0]?.sessions.map((session) => session.actualMinutes)).toEqual([10, 30]);
  expect(result.days[0]?.sessions[0]?.interruptionCount).toBe(1);
  expect(result.days[0]?.sessions[0]?.status).toBe("completed");
});

test("does not include another user's sessions", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const partnerId = await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  await seedSession(t, partnerId, { dateJst: "2026-07-05" });

  const result = await asSelf.query(api.queries.sessions.history.history, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-07",
  });

  expect(result.days).toEqual([]);
});

test("rejects an inverted or too-wide range", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.query(api.queries.sessions.history.history, {
      fromDateJst: "2026-07-07",
      toDateJst: "2026-07-01",
    }),
  ).rejects.toThrow();

  await expect(
    asSelf.query(api.queries.sessions.history.history, {
      fromDateJst: "2026-01-01",
      toDateJst: "2026-03-01",
    }),
  ).rejects.toThrow();
});
