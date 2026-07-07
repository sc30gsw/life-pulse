import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import { addDaysJst, todayJst } from "../../lib/dateRange";
import schema from "../../schema";
import { testModules } from "../../test.setup";

test("returns planned future blocks through 30 days sorted by date then start time", async () => {
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

  const today = todayJst();
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: today,
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "reading",
    dateJst: addDaysJst(today, 1),
    endHm: "09:00",
    startHm: "08:00",
  });
  const erodedId = await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: addDaysJst(today, 1),
    endHm: "07:00",
    startHm: "06:00",
  });
  await asSelf.mutation(api.mutations.blocks.erode.erode, { blockId: erodedId, reason: "work" });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "eikaiwa",
    dateJst: addDaysJst(today, 30),
    endHm: "11:00",
    startHm: "10:00",
  });
  await asSelf.mutation(api.mutations.blocks.declare.declare, {
    category: "other",
    dateJst: addDaysJst(today, 31),
    endHm: "12:00",
    startHm: "11:00",
  });
  await asPartner.mutation(api.mutations.blocks.declare.declare, {
    category: "toeic",
    dateJst: addDaysJst(today, 1),
    endHm: "13:00",
    startHm: "12:00",
  });

  const blocks = await asSelf.query(api.queries.blocks.upcoming.upcoming, { todayJst: today });

  expect(blocks.map((block) => `${block.dateJst} ${block.startHm} ${block.category}`)).toEqual([
    `${addDaysJst(today, 1)} 08:00 reading`,
    `${addDaysJst(today, 30)} 10:00 eikaiwa`,
  ]);
});

test("rejects an unauthenticated upcoming query", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.query(api.queries.blocks.upcoming.upcoming, { todayJst: todayJst() }),
  ).rejects.toThrow();
});
