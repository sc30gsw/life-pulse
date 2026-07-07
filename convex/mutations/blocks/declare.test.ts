import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("declares a planned block with server-derived plannedMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const userId = await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: "2026-07-07",
    endHm: "07:00",
    startHm: "06:00",
  });

  const block = await t.run((ctx) => ctx.db.get("studyBlocks", blockId));
  expect(block?.status).toBe("planned");
  expect(block?.plannedMinutes).toBe(60);
  expect(block?.source).toBe("manual");
  expect(block?.userId).toBe(userId);
});

test("rejects an inverted or malformed time range", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      category: "toeic",
      dateJst: "2026-07-07",
      endHm: "06:00",
      startHm: "07:00",
    }),
  ).rejects.toThrow();

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      category: "toeic",
      dateJst: "2026-07-07",
      endHm: "7pm",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});

test("rejects a malformed dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  await t.run((ctx) =>
    ctx.db.insert("appUsers", { authSubject: "user_1", displayName: "本人", role: "self" }),
  );

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      category: "toeic",
      dateJst: "today",
      endHm: "07:00",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.blocks.declare.declare, {
      category: "toeic",
      dateJst: "2026-07-07",
      endHm: "07:00",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});
