import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function storeFile(t: ReturnType<typeof convexTest>, content: string) {
  return await t.run((ctx) => ctx.storage.store(new Blob([content], { type: "image/jpeg" })));
}

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const storageId = await storeFile(t, "dog-1");

  await expect(t.mutation(api.mutations.dogs.setImage.setImage, { storageId })).rejects.toThrow();
  await expect(t.mutation(api.mutations.dogs.removeImage.removeImage, {})).rejects.toThrow();
});

test("sets the singleton dog imageStorageId", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));
  const storageId = await storeFile(t, "dog-1");

  await asSelf.mutation(api.mutations.dogs.setImage.setImage, { storageId });

  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(dog?.imageStorageId).toBe(storageId);
  expect(dog?.imageUrl).not.toBeNull();
});

test("deletes the previous dog image after replacing it", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));
  const firstStorageId = await storeFile(t, "dog-1");
  const secondStorageId = await storeFile(t, "dog-2");

  await asSelf.mutation(api.mutations.dogs.setImage.setImage, { storageId: firstStorageId });
  await asSelf.mutation(api.mutations.dogs.setImage.setImage, { storageId: secondStorageId });

  const remaining = await t.run((ctx) => ctx.storage.get(firstStorageId));
  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(remaining).toBeNull();
  expect(dog?.imageStorageId).toBe(secondStorageId);
});

test("removes the dog image and deletes the storage file", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));
  const storageId = await storeFile(t, "dog-1");

  await asSelf.mutation(api.mutations.dogs.setImage.setImage, { storageId });
  await asSelf.mutation(api.mutations.dogs.removeImage.removeImage, {});

  const remaining = await t.run((ctx) => ctx.storage.get(storageId));
  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(remaining).toBeNull();
  expect(dog?.imageStorageId).toBeUndefined();
  expect(dog?.imageUrl).toBeNull();
});

test("removing an unset dog image succeeds", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  await asSelf.mutation(api.mutations.dogs.removeImage.removeImage, {});

  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(dog?.imageStorageId).toBeUndefined();
  expect(dog?.imageUrl).toBeNull();
});

test("rejects when the singleton dog profile is missing", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const storageId = await storeFile(t, "dog-1");

  await expect(
    asSelf.mutation(api.mutations.dogs.setImage.setImage, { storageId }),
  ).rejects.toThrow();
  await expect(asSelf.mutation(api.mutations.dogs.removeImage.removeImage, {})).rejects.toThrow();
});
