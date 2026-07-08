import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  await expect(t.mutation(api.mutations.dogs.update.update, { name: "ポチ" })).rejects.toThrow();
});

test("self can update the dog's name", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  await asSelf.mutation(api.mutations.dogs.update.update, { name: "ポチ" });

  const dog = await asSelf.query(api.queries.dogs.get.get, {});
  expect(dog.name).toBe("ポチ");
});

test("partner can update the dog's name", async () => {
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

  await expect(
    asPartner.mutation(api.mutations.dogs.update.update, { name: "ポチ" }),
  ).resolves.toBeNull();
});

test("rejects an empty (or whitespace-only) name", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "self_1" });

  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "self_1", displayName: "本人", role: "self" }),
  );
  await t.run((ctx) => ctx.db.insert("dogs", { name: "ハマロ" }));

  await expect(
    asSelf.mutation(api.mutations.dogs.update.update, { name: "   " }),
  ).rejects.toThrow();
});
