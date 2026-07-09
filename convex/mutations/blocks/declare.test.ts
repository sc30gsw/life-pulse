import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertStudyCategory } from "../../test/fixtures";

const UNKNOWN_CATEGORY_ID = "category_toeic" as Id<"studyCategories">;

function tomorrowJst() {
  return addDaysJst(todayJst(), 1);
}

test("declares a planned block with server-derived plannedMinutes", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const { categoryId, userId } = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("appUsers", {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    });
    const categoryId = await insertStudyCategory(ctx, userId);
    return { categoryId, userId };
  });

  const blockId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId,
    dateJst: tomorrowJst(),
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
  const categoryId = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("appUsers", {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    });
    return await insertStudyCategory(ctx, userId);
  });

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      categoryId,
      dateJst: tomorrowJst(),
      endHm: "06:00",
      startHm: "07:00",
    }),
  ).rejects.toThrow();

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      categoryId,
      dateJst: tomorrowJst(),
      endHm: "7pm",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});

test("rejects a malformed dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const categoryId = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("appUsers", {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    });
    return await insertStudyCategory(ctx, userId);
  });

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      categoryId,
      dateJst: "today",
      endHm: "07:00",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});

test("rejects a past dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const categoryId = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("appUsers", {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    });
    return await insertStudyCategory(ctx, userId);
  });

  await expect(
    asSelf.mutation(api.mutations.blocks.declare.declare, {
      categoryId,
      dateJst: "2000-01-01",
      endHm: "07:00",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.blocks.declare.declare, {
      categoryId: UNKNOWN_CATEGORY_ID,
      dateJst: tomorrowJst(),
      endHm: "07:00",
      startHm: "06:00",
    }),
  ).rejects.toThrow();
});
