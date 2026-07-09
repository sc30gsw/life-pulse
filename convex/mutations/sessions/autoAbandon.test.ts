import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api, internal } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory } from "../../test/fixtures";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

test("the scheduled job abandons a session left active for 6 hours", async () => {
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

  await t.finishAllScheduledFunctions(vi.runAllTimers);

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("abandoned");
  expect(session?.endedAt).toBe(SIX_HOURS_MS);

  vi.useRealTimers();
});

test("is a no-op when the session is already completed", async () => {
  const t = convexTest(schema, testModules);
  const { categoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const sessionId = await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 1_000,
      categoryId,
      dateJst: "2026-07-07",
      endedAt: 1_000,
      interruptionCount: 0,
      startedAt: 0,
      status: "completed",
      userId,
    }),
  );

  await t.mutation(internal.mutations.sessions.autoAbandon.autoAbandon, { sessionId });

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("completed");
  expect(session?.accumulatedMs).toBe(1_000);
});

test("is a no-op when the session no longer exists", async () => {
  const t = convexTest(schema, testModules);
  const { categoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const sessionId = await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      categoryId,
      dateJst: "2026-07-07",
      interruptionCount: 0,
      startedAt: 0,
      status: "active",
      userId,
    }),
  );
  await t.run((ctx) => ctx.db.delete("studySessions", sessionId));

  await expect(
    t.mutation(internal.mutations.sessions.autoAbandon.autoAbandon, { sessionId }),
  ).resolves.not.toThrow();
});
