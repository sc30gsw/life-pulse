import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("selfPresence rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.selfPresence.selfPresence, {})).rejects.toThrow();
});

test("selfPresence returns the self user's presence status", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  await t.run((ctx) =>
    ctx.db.insert("presence", {
      etaHm: "20:30",
      state: "commuting_home",
      updatedAt: 1000,
      userId: selfId,
    }),
  );

  const presence = await asPartner.query(api.queries.dashboard.selfPresence.selfPresence, {});

  expect(presence).toEqual({ etaHm: "20:30", state: "commuting_home", updatedAt: 1000 });
});

test("selfPresence returns null when no self appUser exists", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  const presence = await asPartner.query(api.queries.dashboard.selfPresence.selfPresence, {});

  expect(presence).toBeNull();
});
