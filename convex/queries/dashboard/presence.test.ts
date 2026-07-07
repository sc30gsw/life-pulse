import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("presence rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.presence.presence, {})).rejects.toThrow();
});

test("presence returns the partner presence status", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
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
    ctx.db.insert("presence", {
      etaHm: "20:30",
      state: "commuting_home",
      updatedAt: 1000,
      userId: partnerId,
    }),
  );

  const presence = await asSelf.query(api.queries.dashboard.presence.presence, {});

  expect(presence).toEqual({ etaHm: "20:30", state: "commuting_home", updatedAt: 1000 });
});
