import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory } from "../../test/fixtures";

test("pauses an active session, accumulating elapsed time and logging an interruption", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);

  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    categoryId,
    dateJst: "2026-07-07",
  });

  vi.advanceTimersByTime(90_000);

  await asSelf.mutation(api.mutations.sessions.pause.pause, { reason: "dog" });

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("paused");
  expect(session?.accumulatedMs).toBe(90_000);
  expect(session?.interruptionCount).toBe(1);

  const interruptions = await t.run((ctx) =>
    ctx.db
      .query("interruptions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect(),
  );
  expect(interruptions).toHaveLength(1);
  expect(interruptions[0]?.reason).toBe("dog");
  expect(interruptions[0]?.resumedAt).toBeUndefined();

  vi.useRealTimers();
});

test("rejects pausing when there is no active session", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.sessions.pause.pause, { reason: "work" }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.sessions.pause.pause, { reason: "work" }),
  ).rejects.toThrow();
});
