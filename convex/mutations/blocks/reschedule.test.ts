import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/date-range";
import schema from "../../schema";
import { testModules } from "../../test.setup";

function tomorrowJst() {
  return addDaysJst(todayJst(), 1);
}

async function seedErodedBlock(t: ReturnType<typeof convexTest>) {
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

  return { asSelf, blockId };
}

test("reschedules an eroded block into a new linked planned block", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedErodedBlock(t);

  const newBlockId = await asSelf.mutation(api.mutations.blocks.reschedule.reschedule, {
    blockId,
    endHm: "14:00",
    startHm: "13:00",
  });

  const original = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  const replacement = await t.run((ctx) => ctx.db.get("studyBlocks", newBlockId));

  expect(original?.status).toBe("rescheduled");
  expect(original?.rescheduledToId).toBe(newBlockId);
  expect(replacement?.status).toBe("planned");
  expect(replacement?.category).toBe("toeic");
  expect(replacement?.plannedMinutes).toBe(60);
  expect(replacement?.source).toBe("manual");
});

test("rejects rescheduling a block that is not eroded", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedErodedBlock(t);

  await asSelf.mutation(api.mutations.blocks.reschedule.reschedule, {
    blockId,
    endHm: "14:00",
    startHm: "13:00",
  });

  // The original is now "rescheduled" — a second reschedule must be rejected.
  await expect(
    asSelf.mutation(api.mutations.blocks.reschedule.reschedule, {
      blockId,
      endHm: "16:00",
      startHm: "15:00",
    }),
  ).rejects.toThrow();
});

test("rejects an invalid time range", async () => {
  const t = convexTest(schema, testModules);
  const { asSelf, blockId } = await seedErodedBlock(t);

  await expect(
    asSelf.mutation(api.mutations.blocks.reschedule.reschedule, {
      blockId,
      endHm: "13:00",
      startHm: "14:00",
    }),
  ).rejects.toThrow();
});
