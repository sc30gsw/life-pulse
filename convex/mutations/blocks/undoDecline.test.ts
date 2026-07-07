import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/date-range";
import schema from "../../schema";
import { testModules } from "../../test.setup";

function tomorrowJst() {
  return addDaysJst(todayJst(), 1);
}

async function seedDeclinedBlock(t: ReturnType<typeof convexTest>) {
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: tomorrowJst(),
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });
  await asSelf.mutation(api.mutations.blocks.decline.decline, { blockId });

  return { asSelf, blockId };
}

test("undoes a declined block back to eroded", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedDeclinedBlock(t);

  await asSelf.mutation(api.mutations.blocks.undoDecline.undoDecline, { blockId });

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block?.status).toBe("eroded");
  expect(block?.erosionReason).toBe("work");
});

test("rejects undoing a block that is not declined", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: tomorrowJst(),
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });

  await expect(
    asSelf.mutation(api.mutations.blocks.undoDecline.undoDecline, { blockId }),
  ).rejects.toThrow();
});

test("rejects undoing another user's block", async () => {
  const t = convexTest(schema, testModules);
  const asPartner = t.withIdentity({ subject: "user_2" });
  const { blockId } = await seedDeclinedBlock(t);
  await t.run((ctx) =>
    ctx.db.insert("appUsers", {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  await expect(
    asPartner.mutation(api.mutations.blocks.undoDecline.undoDecline, { blockId }),
  ).rejects.toThrow();
});
