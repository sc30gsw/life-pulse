import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";

async function seedPlannedBlock(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const dateJst = addDaysJst(todayJst(), 1);
  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst,
    endHm: "07:00",
    startHm: "06:00",
  });

  return { asSelf, blockId, dateJst };
}

test("updates a planned block and derives planned minutes", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId, dateJst } = await seedPlannedBlock(t);

  await asSelf.mutation(api.mutations.blocks.update.update, {
    blockId,
    category: "reading",
    dateJst,
    endHm: "08:30",
    startHm: "07:00",
  });

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block?.category).toBe("reading");
  expect(block?.startHm).toBe("07:00");
  expect(block?.endHm).toBe("08:30");
  expect(block?.plannedMinutes).toBe(90);
});

test("rejects updating another user's block", async () => {
  const t = convexTest(schema, testModules);
  const { blockId, dateJst } = await seedPlannedBlock(t);
  const asPartner = t.withIdentity({ subject: "user_2" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.blocks.update.update, {
      blockId,
      category: "reading",
      dateJst,
      endHm: "08:30",
      startHm: "07:00",
    }),
  ).rejects.toThrow();
});

test("rejects updating a block that is not planned", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId, dateJst } = await seedPlannedBlock(t);
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });

  await expect(
    asSelf.mutation(api.mutations.blocks.update.update, {
      blockId,
      category: "reading",
      dateJst,
      endHm: "08:30",
      startHm: "07:00",
    }),
  ).rejects.toThrow();
});

test("rejects updating to a past date or invalid range", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId, dateJst } = await seedPlannedBlock(t);

  await expect(
    asSelf.mutation(api.mutations.blocks.update.update, {
      blockId,
      category: "reading",
      dateJst: "2000-01-01",
      endHm: "08:30",
      startHm: "07:00",
    }),
  ).rejects.toThrow();

  await expect(
    asSelf.mutation(api.mutations.blocks.update.update, {
      blockId,
      category: "reading",
      dateJst,
      endHm: "07:00",
      startHm: "08:30",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated update", async () => {
  const t = convexTest(schema, testModules);
  const { blockId, dateJst } = await seedPlannedBlock(t);

  await expect(
    t.mutation(api.mutations.blocks.update.update, {
      blockId,
      category: "reading",
      dateJst,
      endHm: "08:30",
      startHm: "07:00",
    }),
  ).rejects.toThrow();
});
