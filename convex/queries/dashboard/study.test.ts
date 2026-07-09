import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory, insertStudyCategory } from "../../test/fixtures";

const DATE_JST = "2026-07-07";

test("study rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.study.study, { dateJst: DATE_JST })).rejects.toThrow();
});

test("study returns self-scoped session, blocks, and completed minutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const { categoryId: toeicCategoryId, userId: selfId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "self_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const readingCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, selfId, "読書", { sortOrder: 1 }),
  );

  const sessionId = await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      categoryId: toeicCategoryId,
      dateJst: DATE_JST,
      interruptionCount: 0,
      lastResumedAt: 1000,
      startedAt: 1000,
      status: "active",
      userId: selfId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 1_800_000,
      categoryId: readingCategoryId,
      dateJst: DATE_JST,
      endedAt: 2000,
      interruptionCount: 0,
      startedAt: 1000,
      status: "completed",
      userId: selfId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studyBlocks", {
      categoryId: toeicCategoryId,
      dateJst: DATE_JST,
      endHm: "06:30",
      plannedMinutes: 30,
      source: "manual",
      startHm: "06:00",
      status: "planned",
      userId: selfId,
    }),
  );

  const result = await asSelf.query(api.queries.dashboard.study.study, { dateJst: DATE_JST });

  expect(result.session?._id).toBe(sessionId);
  expect(result.blocks).toHaveLength(1);
  expect(result.todayActualMinutes).toBe(30);
});

test("study degrades without a self appUser", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  const study = await asPartner.query(api.queries.dashboard.study.study, { dateJst: DATE_JST });

  expect(study.session).toBeNull();
  expect(study.blocks).toEqual([]);
  expect(study.todayActualMinutes).toBe(0);
});
