import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory, insertStudyCategory } from "../../test/fixtures";

const UNKNOWN_CATEGORY_ID = "category_toeic" as Id<"studyCategories">;

test("creates an active session with the given category and dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );

  const sessionId = await asSelf.mutation(api.mutations.sessions.start.start, {
    categoryId,
    dateJst: "2026-07-07",
    plannedMinutes: 60,
  });

  const session = await t.run((ctx) => ctx.db.get("studySessions", sessionId));
  expect(session?.status).toBe("active");
  expect(session?.categoryId).toBe(categoryId);
  expect(session?.userId).toBe(userId);
  expect(session?.accumulatedMs).toBe(0);
  expect(session?.interruptionCount).toBe(0);
  expect(session?.abandonJobId).toBeDefined();
});

test("rejects starting a second session while one is active", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const eikaiwaCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, userId, "英会話", { sortOrder: 1 }),
  );

  await asSelf.mutation(api.mutations.sessions.start.start, {
    categoryId,
    dateJst: "2026-07-07",
  });

  await expect(
    asSelf.mutation(api.mutations.sessions.start.start, {
      categoryId: eikaiwaCategoryId,
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("rejects starting a second session while one is paused", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const eikaiwaCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, userId, "英会話", { sortOrder: 1 }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      categoryId,
      dateJst: "2026-07-07",
      interruptionCount: 0,
      startedAt: 0,
      status: "paused",
      userId,
    }),
  );

  await expect(
    asSelf.mutation(api.mutations.sessions.start.start, {
      categoryId: eikaiwaCategoryId,
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.sessions.start.start, {
      categoryId: UNKNOWN_CATEGORY_ID,
      dateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});
