import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../_generated/api";
import schema from "../schema";
import { testModules } from "../test.setup";
import { requireSelf, requireUser } from "./auth";

test("requireUser throws when unauthenticated", async () => {
  const t = convexTest(schema, testModules);
  await expect(t.run((ctx) => requireUser(ctx))).rejects.toThrow();
});

test("requireSelf throws for a partner identity", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await asPartner.mutation(api.mutations.users.ensureUser.ensureUser, {
    displayName: "パートナー",
    role: "partner",
  });

  await expect(asPartner.run((ctx) => requireSelf(ctx))).rejects.toThrow();
});
