import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { ensureUser } from "../../services/users/ensureUser";
import { testModules } from "../../test.setup";

test("inserts a dogEvents row for the caller with the given kind and dateJst", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  const user = await t.run((ctx) =>
    ctx.db
      .query("appUsers")
      .withIndex("by_subject", (q) => q.eq("authSubject", "user_1"))
      .unique(),
  );
  const events = await t.run((ctx) =>
    ctx.db
      .query("dogEvents")
      .withIndex("by_date", (q) => q.eq("dateJst", "2026-07-06"))
      .collect(),
  );

  expect(events).toHaveLength(1);
  expect(events[0]?.kind).toBe("walk_am");
  expect(events[0]?.dateJst).toBe("2026-07-06");
  expect(events[0]?.byUserId).toBe(user?._id);
});

test("rejects logging the same kind twice on the same day", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  await expect(
    asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
      dateJst: "2026-07-06",
      kind: "walk_am",
    }),
  ).rejects.toThrow();
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);

  await expect(
    t.mutation(api.mutations.dog.logEvent.logEvent, {
      dateJst: "2026-07-06",
      kind: "walk_am",
    }),
  ).rejects.toThrow();
});
