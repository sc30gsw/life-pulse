import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("ensureUser is idempotent", async () => {
  const t = convexTest(schema, testModules);
  const asUser = t.withIdentity({ subject: "user_1" });

  await asUser.mutation(api.mutations.users.ensureUser.ensureUser, {
    displayName: "本人",
    role: "self",
  });
  await asUser.mutation(api.mutations.users.ensureUser.ensureUser, {
    displayName: "本人",
    role: "self",
  });

  const viewer = await asUser.query(api.queries.users.viewer.viewer, {});
  expect(viewer?.role).toBe("self");
});
