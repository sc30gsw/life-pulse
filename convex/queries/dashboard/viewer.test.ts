import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("viewer rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(t.query(api.queries.dashboard.viewer.viewer, {})).rejects.toThrow();
});

test("viewer returns the authenticated app user", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  const viewer = await asSelf.query(api.queries.dashboard.viewer.viewer, {});

  expect(viewer).toEqual({ displayName: "本人", role: "self" });
});
