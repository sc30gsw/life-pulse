import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import {
  appSettings,
  partnerIdentity,
  partnerUser,
  selfIdentity,
  selfUser,
} from "../../test/fixtures";

async function seedSelf(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity(selfIdentity());
  await t.run((ctx) => ctx.db.insert("appUsers", selfUser()));

  return asSelf;
}

test("returns defaults when no appSettings row exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);

  const settings = await asSelf.query(api.queries.settings.get.get, {});

  expect(settings).toEqual({
    fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
  });
});

test("returns the actual row when one exists", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = await seedSelf(t);
  await t.run((ctx) => ctx.db.insert("appSettings", appSettings({ fastingDefaultMinutes: 600 })));

  const settings = await asSelf.query(api.queries.settings.get.get, {});

  expect(settings).toEqual({
    fastingDefaultMinutes: 600,
  });
});

test("rejects a non-self identity", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity(partnerIdentity());
  await t.run((ctx) => ctx.db.insert("appUsers", partnerUser()));

  await expect(asPartner.query(api.queries.settings.get.get, {})).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.settings.get.get, {})).rejects.toThrow();
});
