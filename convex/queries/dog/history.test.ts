import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.dog.history.history, {
      fromDateJst: "2026-07-01",
      toDateJst: "2026-07-07",
    }),
  ).rejects.toThrow();
});

test("groups events by date, newest first, with resolved actor names", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const partnerId = await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 2000,
      byUserId: partnerId,
      dateJst: "2026-07-05",
      kind: "meal_pm",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 1000,
      byUserId: selfId,
      dateJst: "2026-07-05",
      kind: "walk_am",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", { at: 500, byUserId: selfId, dateJst: "2026-07-03", kind: "meds" }),
  );
  // Outside the requested range — must not appear in the result.
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 100,
      byUserId: selfId,
      dateJst: "2026-06-01",
      kind: "toilet",
    }),
  );

  const result = await asSelf.query(api.queries.dog.history.history, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-07",
  });

  expect(result.days).toHaveLength(2);
  expect(result.days[0]?.dateJst).toBe("2026-07-05");
  expect(result.days[1]?.dateJst).toBe("2026-07-03");
  // Within-day events are ordered ascending by `at`.
  expect(result.days[0]?.events.map((event) => event.kind)).toEqual(["walk_am", "meal_pm"]);
  expect(result.days[0]?.events[0]?.byDisplayName).toBe("本人");
  expect(result.days[0]?.events[1]?.byDisplayName).toBe("パートナー");
  expect(result.summary).toEqual({
    eventCount: 3,
    hasOlderDays: false,
    olderDayCount: 0,
    totalDayCount: 2,
  });
});

test("limits history to recent days by default and includes older days on request", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  for (const [index, dateJst] of ["2026-07-07", "2026-07-06", "2026-07-05"].entries()) {
    await t.run((ctx) =>
      ctx.db.insert("dogEvents", {
        at: index + 1,
        byUserId: selfId,
        dateJst,
        kind: "walk_am",
      }),
    );
  }

  const initial = await asSelf.query(api.queries.dog.history.history, {
    fromDateJst: "2026-07-01",
    toDateJst: "2026-07-07",
  });
  const expanded = await asSelf.query(api.queries.dog.history.history, {
    fromDateJst: "2026-07-01",
    includeOlderDays: true,
    toDateJst: "2026-07-07",
  });

  expect(initial.days.map((day) => day.dateJst)).toEqual(["2026-07-07", "2026-07-06"]);
  expect(initial.summary).toEqual({
    eventCount: 3,
    hasOlderDays: true,
    olderDayCount: 1,
    totalDayCount: 3,
  });
  expect(expanded.days.map((day) => day.dateJst)).toEqual([
    "2026-07-07",
    "2026-07-06",
    "2026-07-05",
  ]);
});

test("rejects when fromDateJst is after toDateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.query(api.queries.dog.history.history, {
      fromDateJst: "2026-07-07",
      toDateJst: "2026-07-01",
    }),
  ).rejects.toThrow();
});

test("rejects a range wider than 31 days", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.query(api.queries.dog.history.history, {
      fromDateJst: "2026-01-01",
      toDateJst: "2026-03-01",
    }),
  ).rejects.toThrow();
});

test("allows a range of exactly 31 days", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  const result = await asSelf.query(api.queries.dog.history.history, {
    fromDateJst: "2026-06-01",
    toDateJst: "2026-07-02",
  });

  expect(result.days).toEqual([]);
});
