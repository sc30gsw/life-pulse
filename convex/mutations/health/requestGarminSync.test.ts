import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects a partner (non-self) caller", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.health.requestGarminSync.requestGarminSync, {}),
  ).rejects.toThrow();
});
