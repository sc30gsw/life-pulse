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

test("removes the caller's avatar and deletes the storage file", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const storageId = await storeFile(t, "avatar-1");

  await asSelf.mutation(api.mutations.users.setAvatar.setAvatar, { storageId });
  await asSelf.mutation(api.mutations.users.removeAvatar.removeAvatar, {});

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  const remaining = await t.run((ctx) => ctx.storage.get(storageId));
  expect(rows[0]?.avatarStorageId).toBeUndefined();
  expect(remaining).toBeNull();
});

test("removing an unset avatar succeeds without changing the caller", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.mutation(api.mutations.users.removeAvatar.removeAvatar, {});

  const rows = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .collect(),
  );
  expect(rows[0]?.avatarStorageId).toBeUndefined();
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

test("acting as the partner only removes the partner avatar", async () => {
  const t = convexTest(schema, testModules);
  await seedUsers(t);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const asPartner = t.withIdentity({ subject: "user_2" });
  const selfStorageId = await storeFile(t, "avatar-self");
  const partnerStorageId = await storeFile(t, "avatar-partner");

  await asSelf.mutation(api.mutations.users.setAvatar.setAvatar, { storageId: selfStorageId });
  await asPartner.mutation(api.mutations.users.setAvatar.setAvatar, {
    storageId: partnerStorageId,
  });
  await asPartner.mutation(api.mutations.users.removeAvatar.removeAvatar, {});

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
  const selfFileExists = await t.run(
    async (ctx) => (await ctx.storage.get(selfStorageId)) !== null,
  );
  const partnerFile = await t.run((ctx) => ctx.storage.get(partnerStorageId));
  expect(selfRows[0]?.avatarStorageId).toBe(selfStorageId);
  expect(partnerRows[0]?.avatarStorageId).toBeUndefined();
  expect(selfFileExists).toBe(true);
  expect(partnerFile).toBeNull();
});
