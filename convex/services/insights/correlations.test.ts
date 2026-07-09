import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory } from "../../test/fixtures";

const FROM = "2026-06-10";
const TO = "2026-06-12";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "self_1" });
  const { categoryId, userId: selfId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(
      ctx,
      { authSubject: "self_1", displayName: "本人", role: "self" },
      "読書",
    ),
  );

  return { asSelf, categoryId, selfId };
}

test("joins health, study minutes, and hiitPrevDay per day in range", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, categoryId, selfId } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 70,
      dateJst: "2026-06-10",
      sleepScore: 80,
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 1_800_000,
      categoryId,
      dateJst: "2026-06-10",
      interruptionCount: 0,
      status: "completed",
      startedAt: 0,
      userId: selfId,
    }),
  );
  // an active (non-completed) session on the same day must not count.
  await t.run((ctx) =>
    ctx.db.insert("studySessions", {
      accumulatedMs: 0,
      categoryId,
      dateJst: "2026-06-10",
      interruptionCount: 0,
      status: "active",
      startedAt: 0,
      userId: selfId,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 0,
      dateJst: "2026-06-10",
      durationMinutes: 20,
      kind: "hiit",
    }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.days).toHaveLength(3);
  expect(result.days[0]).toMatchObject({
    bodyBattery: 70,
    dateJst: "2026-06-10",
    hiitPrevDay: false,
    sleepScore: 80,
    studyMinutes: 30,
  });
  // day after the hiit workout should have hiitPrevDay = true
  expect(result.days[1]).toMatchObject({ dateJst: "2026-06-11", hiitPrevDay: true });
  // no health/study data on 06-11/06-12: defaults
  expect(result.days[1]?.sleepScore).toBeUndefined();
  expect(result.days[1]?.studyMinutes).toBe(0);
});

test("excludes a day from the pairwise correlation when sleepScore is missing", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, categoryId, selfId } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-06-10",
      sleepScore: 80,
      source: "manual",
      syncedAt: 0,
    }),
  );
  // 06-11: no healthMetrics row at all → sleepScore missing, excluded from n
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-06-12",
      sleepScore: 60,
      source: "manual",
      syncedAt: 0,
    }),
  );
  for (const dateJst of ["2026-06-10", "2026-06-11", "2026-06-12"]) {
    await t.run((ctx) =>
      ctx.db.insert("studySessions", {
        accumulatedMs: 600_000,
        categoryId,
        dateJst,
        interruptionCount: 0,
        status: "completed",
        startedAt: 0,
        userId: selfId,
      }),
    );
  }

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.sleepVsStudy.n).toBe(2);
});

test("counts a day with studyMinutes 0 as a valid pair", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  for (const dateJst of ["2026-06-10", "2026-06-11", "2026-06-12"]) {
    await t.run((ctx) =>
      ctx.db.insert("healthMetrics", { dateJst, sleepScore: 70, source: "manual", syncedAt: 0 }),
    );
  }
  // no studySessions at all → every day has studyMinutes 0, still a valid pair

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.sleepVsStudy.n).toBe(3);
  expect(result.days.every((day) => day.studyMinutes === 0)).toBe(true);
});

test("ignores legacy demo health rows", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-06-10",
      sleepScore: 60,
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      dateJst: "2026-06-10",
      sleepScore: 95,
      source: "demo",
      syncedAt: 1,
    }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.days[0]?.sleepScore).toBe(60);
});

test("hiitPrevDay is true on the first day of the range when hiit occurred the day before", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 0,
      dateJst: "2026-06-09", // day before FROM
      durationMinutes: 20,
      kind: "hiit",
    }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.days[0]).toMatchObject({ dateJst: FROM, hiitPrevDay: true });
});

test("compares bodyBattery averages across hiitPrevDay groups, null avg when a group is empty", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  // 06-09 hiit → 06-10 hiitPrevDay=true, bodyBattery=80
  await t.run((ctx) =>
    ctx.db.insert("workouts", { at: 0, dateJst: "2026-06-09", durationMinutes: 20, kind: "hiit" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 80,
      dateJst: "2026-06-10",
      source: "manual",
      syncedAt: 0,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 40,
      dateJst: "2026-06-11",
      source: "manual",
      syncedAt: 0,
    }),
  );
  // 06-12 no bodyBattery → excluded from both groups
  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", { dateJst: "2026-06-12", source: "manual", syncedAt: 0 }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.hiitNextDayBb.withHiit).toEqual({ avg: 80, n: 1 });
  expect(result.hiitNextDayBb.withoutHiit).toEqual({ avg: 40, n: 1 });
});

test("returns null avg when the withHiit group is empty", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("healthMetrics", {
      bodyBattery: 50,
      dateJst: "2026-06-10",
      source: "manual",
      syncedAt: 0,
    }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.hiitNextDayBb.withHiit).toEqual({ avg: null, n: 0 });
});

test("counts workoutKindBreakdown only for workouts inside the requested range", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf } = await seedSelf(t);

  await t.run((ctx) =>
    ctx.db.insert("workouts", {
      at: 0,
      dateJst: "2026-06-09", // before FROM: used for hiitPrevDay, excluded from breakdown
      durationMinutes: 20,
      kind: "hiit",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("workouts", { at: 0, dateJst: "2026-06-10", durationMinutes: 30, kind: "walk" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("workouts", { at: 0, dateJst: "2026-06-11", durationMinutes: 10, kind: "walk" }),
  );

  const result = await asSelf.query(api.queries.insights.correlations.correlations, {
    fromDateJst: FROM,
    toDateJst: TO,
  });

  expect(result.workoutKindBreakdown).toEqual([{ count: 2, kind: "walk" }]);
});

test("rejects a partner (non-self) caller", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.query(api.queries.insights.correlations.correlations, {
      fromDateJst: FROM,
      toDateJst: TO,
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.insights.correlations.correlations, {
      fromDateJst: FROM,
      toDateJst: TO,
    }),
  ).rejects.toThrow();
});
