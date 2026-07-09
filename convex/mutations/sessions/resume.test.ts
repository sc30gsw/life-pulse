import { convexTest } from "convex-test";
import { expect, test, vi } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory } from "../../test/fixtures";

test("resumes a paused session, updating lastResumedAt and the open interruption", async () => {
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

  vi.advanceTimersByTime(60_000);
  await asSelf.mutation(api.mutations.sessions.pause.pause, { reason: "chore" });

  vi.advanceTimersByTime(30_000);
  await asSelf.mutation(api.mutations.sessions.resume.resume, {});

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("active");
  expect(session?.lastResumedAt).toBe(90_000);
  expect(session?.accumulatedMs).toBe(60_000);

  const interruptions = await t.run((ctx) =>
    ctx.db
      .query("interruptions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect(),
  );
  expect(interruptions[0]?.resumedAt).toBe(90_000);

  vi.useRealTimers();
});

test("rejects resuming when there is no paused session", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(asSelf.mutation(api.mutations.sessions.resume.resume, {})).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.mutation(api.mutations.sessions.resume.resume, {})).rejects.toThrow();
});
