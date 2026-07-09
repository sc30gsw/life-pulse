import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { partnerIdentity, partnerUser, selfIdentity, selfUser } from "../../test/fixtures";

test("fasting rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.fasting.fasting, {})).rejects.toThrow();
});

test("fasting returns the active self fasting window", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity(selfIdentity());

  const selfId = await t.run((ctx) => ctx.db.insert("appUsers", selfUser()));
  const fastingId = await t.run((ctx) =>
    ctx.db.insert("fastingWindows", {
      phase: "fatburn",
      phaseJobIds: [],
      startedAt: 1000,
      status: "fasting",
      targetMinutes: DEFAULT_FASTING_MINUTES,
      userId: selfId,
    }),
  );

  const fasting = await asSelf.query(api.queries.dashboard.fasting.fasting, {});

  expect(fasting?._id).toBe(fastingId);
  expect(fasting?.phase).toBe("fatburn");
});

test("fasting degrades without a self appUser", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity(partnerIdentity());

  await t.run((ctx) => ctx.db.insert("appUsers", partnerUser()));

  const fasting = await asPartner.query(api.queries.dashboard.fasting.fasting, {});

  expect(fasting).toBeNull();
});
