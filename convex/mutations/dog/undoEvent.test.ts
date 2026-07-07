import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import schema from "../../schema";
import { ensureUser } from "../../services/users/ensureUser";
import { testModules } from "../../test.setup";

test("removes the event and allows the same kind to be logged again", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  const eventId = await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  await asSelf.mutation(api.mutations.dog.undoEvent.undoEvent, {
    dateJst: "2026-07-06",
    eventId,
  });

  const events = await t.run((ctx) =>
    ctx.db
      .query("dogEvents")
      .withIndex("by_date", (q) => q.eq("dateJst", "2026-07-06"))
      .collect(),
  );
  expect(events).toHaveLength(0);

  await expect(
    asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
      dateJst: "2026-07-06",
      kind: "walk_am",
    }),
  ).resolves.toBeDefined();
});

test("rejects undo when dateJst does not match the event's actual date", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  const eventId = await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  await expect(
    asSelf.mutation(api.mutations.dog.undoEvent.undoEvent, {
      dateJst: "2026-07-07",
      eventId,
    }),
  ).rejects.toThrow();
});

test("a different authenticated user can undo an event logged by the caller (no ownership check)", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });
  const asPartner = t.withIdentity({ subject: "partner_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));
  await asPartner.run((ctx) =>
    ensureUser(ctx, "partner_1", { displayName: "パートナー", role: "partner" }),
  );

  const eventId = await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  await asPartner.mutation(api.mutations.dog.undoEvent.undoEvent, {
    dateJst: "2026-07-06",
    eventId,
  });

  const events = await t.run((ctx) =>
    ctx.db
      .query("dogEvents")
      .withIndex("by_date", (q) => q.eq("dateJst", "2026-07-06"))
      .collect(),
  );
  expect(events).toHaveLength(0);
});

test("rejects an unauthenticated call", async () => {
  const t = convexTest(schema, testModules);
  const asSelf = t.withIdentity({ subject: "user_1" });

  await asSelf.run((ctx) => ensureUser(ctx, "user_1", { displayName: "本人", role: "self" }));

  const eventId = await asSelf.mutation(api.mutations.dog.logEvent.logEvent, {
    dateJst: "2026-07-06",
    kind: "walk_am",
  });

  await expect(
    t.mutation(api.mutations.dog.undoEvent.undoEvent, {
      dateJst: "2026-07-06",
      eventId,
    }),
  ).rejects.toThrow();
});
