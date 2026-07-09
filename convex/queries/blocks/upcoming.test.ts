import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";
import { insertAppUserWithStudyCategory, insertStudyCategory } from "../../test/fixtures";

test("returns planned future blocks through 30 days sorted by date then start time", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const asPartner = t.withIdentity({ subject: "user_2" });
  const { categoryId: toeicCategoryId, userId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_1",
      displayName: "本人",
      role: "self",
    }),
  );
  const readingCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, userId, "読書", { sortOrder: 1 }),
  );
  const eikaiwaCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, userId, "英会話", { sortOrder: 2 }),
  );
  const otherCategoryId = await t.run((ctx) =>
    insertStudyCategory(ctx, userId, "その他", { sortOrder: 3 }),
  );
  const { categoryId: partnerCategoryId } = await t.run((ctx) =>
    insertAppUserWithStudyCategory(ctx, {
      authSubject: "user_2",
      displayName: "パートナー",
      role: "partner",
    }),
  );

  const today = todayJst();
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId: toeicCategoryId,
    dateJst: today,
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId: readingCategoryId,
    dateJst: addDaysJst(today, 1),
    endHm: "09:00",
    startHm: "08:00",
  });
  const erodedId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId: toeicCategoryId,
    dateJst: addDaysJst(today, 1),
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId: erodedId, reason: "work" });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId: eikaiwaCategoryId,
    dateJst: addDaysJst(today, 30),
    endHm: "11:00",
    startHm: "10:00",
  });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    categoryId: otherCategoryId,
    dateJst: addDaysJst(today, 31),
    endHm: "12:00",
    startHm: "11:00",
  });
  await asPartner.mutation(api.mutations.blocks.declare.declare, {
    categoryId: partnerCategoryId,
    dateJst: addDaysJst(today, 1),
    endHm: "13:00",
    startHm: "12:00",
  });

  const blocks = await asSelf.query(api.queries.blocks.upcoming.upcoming, { todayJst: today });

  expect(blocks.map((block) => `${block.dateJst} ${block.startHm} ${block.categoryId}`)).toEqual([
    `${addDaysJst(today, 1)} 08:00 ${readingCategoryId}`,
    `${addDaysJst(today, 30)} 10:00 ${eikaiwaCategoryId}`,
  ]);
});

test("rejects an unauthenticated upcoming query", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.blocks.upcoming.upcoming, { todayJst: todayJst() }),
  ).rejects.toThrow();
});
