import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("fasting rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.fasting.fasting, {})).rejects.toThrow();
});

test("fasting returns the active self fasting window", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  const selfId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const fastingId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "fatburn",
      phaseJobIds: [],
      startedAt: 1000,
      status: "fasting",
      targetMinutes: 960,
      userId: selfId,
    }),
  );

  const fasting = await asSelf.query(api.queries.dashboard.fasting.fasting, {});

  expect(fasting?._id).toBe(fastingId);
  expect(fasting?.phase).toBe("fatburn");
});

test("fasting degrades without a self appUser", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  const fasting = await asPartner.query(api.queries.dashboard.fasting.fasting, {});

  expect(fasting).toBeNull();
});
