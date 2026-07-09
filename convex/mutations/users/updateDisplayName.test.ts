import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedUsers(t: ReturnType<typeof convexTest>) {
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );
}

test("updates the caller's own displayName", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.mutation(api.mutations.users.updateDisplayName.updateDisplayName, {
    displayName: "新しい名前",
  });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows[0]?.displayName).toBe("新しい名前");
});

test("trims whitespace and rejects an empty displayName", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.mutation(api.mutations.users.updateDisplayName.updateDisplayName, {
    displayName: "  空白付き  ",
  });
  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows[0]?.displayName).toBe("空白付き");

  await expect(
    asSelf.mutation(api.mutations.users.updateDisplayName.updateDisplayName, {
      displayName: "   ",
    }),
  ).rejects.toThrow();
});

test("acting as the partner never changes the other user's displayName", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asPartner = t.withIdentity({ subject: "user_2" });

  await asPartner.mutation(api.mutations.users.updateDisplayName.updateDisplayName, {
    displayName: "パートナー新名",
  });

  const selfRows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  const partnerRows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_2"))
      .collect(),
  );
  expect(selfRows[0]?.displayName).toBe("本人");
  expect(partnerRows[0]?.displayName).toBe("パートナー新名");
});
