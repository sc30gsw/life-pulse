import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("completes an active session, finalizing accumulatedMs and endedAt", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);

  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    category: "toeic",
    dateJst: "2026-07-07",
  });

  vi.advanceTimersByTime(120_000);
  await asSelf.mutation(api.mutations.sessions.complete.complete, {});

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("completed");
  expect(session?.accumulatedMs).toBe(120_000);
  expect(session?.endedAt).toBe(120_000);

  vi.useRealTimers();
});

test("completes a paused session using the already-accumulated time", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);

  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    category: "toeic",
    dateJst: "2026-07-07",
  });

  vi.advanceTimersByTime(60_000);
  await asSelf.mutation(api.mutations.sessions.pause.pause, { reason: "work" });

  vi.advanceTimersByTime(999_999);
  await asSelf.mutation(api.mutations.sessions.complete.complete, {});

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("completed");
  expect(session?.accumulatedMs).toBe(60_000);

  vi.useRealTimers();
});

test("cancels the scheduled autoAbandon job and marks the linked block done", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  const blockId = await t.run((ctx) =>
    ctx.db.insert("studyBlocks", {
      category: "toeic",
      dateJst: "2026-07-07",
      endHm: "07:00",
      plannedMinutes: 60,
      source: "manual",
      startHm: "06:00",
      status: "planned",
      userId,
    }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    blockId,
    category: "toeic",
    dateJst: "2026-07-07",
  });

  const sessionBeforeComplete = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  const abandonJobId = sessionBeforeComplete?.abandonJobId;
  expect(abandonJobId).toBeDefined();

  await asSelf.mutation(api.mutations.sessions.complete.complete, {});

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block?.status).toBe("done");

  if (abandonJobId !== undefined) {
    const scheduledJob = await t.run((ctx) => ctx.db.system.get(abandonJobId));
    expect(scheduledJob?.state.kind).toBe("canceled");
  }
});

test("rejects completing when there is no session", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(asSelf.mutation(api.mutations.sessions.complete.complete, {})).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.sessions.complete.complete, {})).rejects.toThrow();
});
