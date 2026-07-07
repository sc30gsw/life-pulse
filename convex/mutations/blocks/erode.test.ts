import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("erodes a planned block with the given reason", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: "2026-07-07",
    endHm: "07:00",
    startHm: "06:00",
  });

  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block?.status).toBe("eroded");
  expect(block?.erosionReason).toBe("work");
});

test("rejects eroding a block that is not planned", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: "2026-07-07",
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" });

  await expect(
    asSelf.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "fatigue" }),
  ).rejects.toThrow();
});

test("rejects eroding another user's block", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const asPartner = t.withIdentity({ subject: "user_2" });
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

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: "2026-07-07",
    endHm: "07:00",
    startHm: "06:00",
  });

  await expect(
    asPartner.mutation(api.mutations.blocks.erode.erode, { blockId, reason: "work" }),
  ).rejects.toThrow();
});
