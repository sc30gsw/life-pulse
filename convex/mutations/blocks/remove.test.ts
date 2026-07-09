import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory } from "../../test/fixtures";

async function seedPlannedBlock(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId,
    dateJst: addDaysJst(todayJst(), 1),
    endHm: "07:00",
    startHm: "06:00",
  });

  return { asSelf, blockId };
}

test("physically deletes a planned block", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedPlannedBlock(t);

  await asSelf.mutation(api.mutations.blocks.remove.remove, { blockId });

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block).toBeNull();
});

test("rejects deleting another user's block", async () => {
  const t = convexTest(schema, testModules);
  const { blockId } = await seedPlannedBlock(t);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.blocks.remove.remove, { blockId }),
  ).rejects.toThrow();
});

test("rejects deleting a block that is not planned", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedPlannedBlock(t);
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });

  await expect(asSelf.mutation(api.mutations.blocks.remove.remove, { blockId })).rejects.toThrow();
});

test("rejects an unauthenticated delete", async () => {
  const t = convexTest(schema, testModules);
  const { blockId } = await seedPlannedBlock(t);

  await expect(t.mutation(api.mutations.blocks.remove.remove, { blockId })).rejects.toThrow();
});
