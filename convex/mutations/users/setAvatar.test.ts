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

async function storeFile(t: ReturnType<typeof convexTest>, content: string) {
  return await t.run((ctx) => ctx.storage.store(new Blob([content])));
}

test("sets the caller's own avatarStorageId", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const storageId = await storeFile(t, "avatar-1");

  await asSelf.mutation(api.mutations.users.setAvatar.setAvatar, { storageId });

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows[0]?.avatarStorageId).toBe(storageId);
});

test("deletes the previous avatar file after replacing it", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const firstStorageId = await storeFile(t, "avatar-1");
  const secondStorageId = await storeFile(t, "avatar-2");

  await asSelf.mutation(api.mutations.users.setAvatar.setAvatar, { storageId: firstStorageId });
  await asSelf.mutation(api.mutations.users.setAvatar.setAvatar, { storageId: secondStorageId });

  const remaining = await t.run((ctx) => ctx.storage.get(firstStorageId));
  expect(remaining).toBeNull();
});

test("acting as the partner never changes the other user's avatar", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asPartner = t.withIdentity({ subject: "user_2" });
  const storageId = await storeFile(t, "avatar-partner");

  await asPartner.mutation(api.mutations.users.setAvatar.setAvatar, { storageId });

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
  expect(selfRows[0]?.avatarStorageId).toBeUndefined();
  expect(partnerRows[0]?.avatarStorageId).toBe(storageId);
});
