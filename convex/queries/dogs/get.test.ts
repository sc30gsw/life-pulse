import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  await expect(t.query(api.queries.dogs.get.get, {})).rejects.toThrow();
});

test("self can get the singleton dog profile", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(dog?.name).toBe("ハマロ");
  expect(dog?.imageUrl).toBeNull();
});

test("partner can get the singleton dog profile", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "partner_1",
      displayName: "パートナー",
      role: "partner",
    }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  const dog = await asPartner.query(api.queries.dogs.get.get, {});
  expect(dog?.name).toBe("ハマロ");
});

test("returns a signed image URL when imageStorageId is set", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  const imageStorageId = await t.run((ctx) =>
    ctx.storage.store(new Blob(["dog"], { type: "image/jpeg" })),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { imageStorageId, name: "ハマロ" }));

  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(dog?.imageStorageId).toBe(imageStorageId);
  expect(dog?.imageUrl).not.toBeNull();
});

test("returns null if the singleton dog document is missing", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );

  await expect(asSelf.query(api.queries.dogs.get.get, {})).resolves.toBeNull();
});
