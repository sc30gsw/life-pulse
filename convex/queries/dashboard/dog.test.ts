import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const DATE_JST = "2026-07-07";

test("dog rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.dog.dog, { dateJst: DATE_JST })).rejects.toThrow();
});

test("dog returns dog name and actor display names for date events", async () => {
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
    ctx.db.insert("appSettings", {
      demoMode: false,
      dogName: "ポチ",
      fastingDefaultMinutes: 960,
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 1000,
      byUserId: selfId,
      dateJst: DATE_JST,
      kind: "walk_am",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("dogEvents", {
      at: 2000,
      byUserId: partnerId,
      dateJst: DATE_JST,
      kind: "meal_am",
    }),
  );

  const dog = await asSelf.query(api.queries.dashboard.dog.dog, { dateJst: DATE_JST });

  expect(dog.dogName).toBe("ポチ");
  const eventsByKind = Object.fromEntries(dog.events.map((event) => [event.kind, event]));
  expect(eventsByKind.walk_am?.byDisplayName).toBe("本人");
  expect(eventsByKind.meal_am?.byDisplayName).toBe("パートナー");
});
