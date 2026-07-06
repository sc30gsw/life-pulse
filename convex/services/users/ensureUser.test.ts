import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import schema from "../../schema";
import { testModules } from "../../test.setup";
import { ensureUser } from "./ensureUser";

test("creates a new appUsers row for a new authSubject", async () => {
  const t = convexTest(schema, testModules);

  await t.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.displayName).toBe("本人");
  expect(rows[0]?.role).toBe("self");
});

test("is idempotent and does not overwrite an existing row", async () => {
  const t = convexTest(schema, testModules);

  await t.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));
  await t.run((ctx) => ensureUser(ctx, "user_1", { displayName: "別名", role: "partner" }));

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows).toHaveLength(1);
  expect(rows[0]?.displayName).toBe("本人");
  expect(rows[0]?.role).toBe("self");
});
