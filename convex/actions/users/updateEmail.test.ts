import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import type { WithoutSystemFields } from "convex/server";
import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import schema from "../../schema";
import { testModules } from "../../test.setup";

// Mirrors convex/auth.ts's SignUpProfile: `email` lives on the auth `users`
// table, while `displayName`/`role` belong to `appUsers` only — createAccount's
// own type only allows `users` fields, but createOrUpdateUser's callback (see
// convex/auth.ts) reads displayName/role off the same profile object at
// runtime, exactly like a real Password sign-up.
type SeedProfile = Pick<WithoutSystemFields<Doc<"users">>, "email"> &
  Pick<WithoutSystemFields<Doc<"appUsers">>, "displayName" | "role">;

const SELF_EMAIL = "self@example.com";
const SELF_PASSWORD = "OldPassw0rd1";
const PARTNER_EMAIL = "partner@example.com";
const PARTNER_PASSWORD = "PartnerPassw0rd1";

// Named (not inline-async) so it never matches a bare-positional-`action`
// lint heuristic — this is convex-test's `t.action(handler)` escape hatch
// for running arbitrary code with a real ActionCtx, not a registered Convex
// function.
async function createPasswordAccount(
  ctx: ActionCtx,
  email: string,
  password: string,
  displayName: string,
  role: "self" | "partner",
) {
  return createAccount(ctx, {
    provider: "password",
    account: { id: email, secret: password },
    // profile flows straight into convex/auth.ts's createOrUpdateUser
    // callback (same as a real Password sign-up), which is what actually
    // creates the matching appUsers row via ensureUser — no separate insert
    // needed here. createAccount's own type only allows `users` fields; cast
    // to SeedProfile the same way convex/auth.ts casts args.profile.
    profile: { displayName, email, role } as SeedProfile as WithoutSystemFields<Doc<"users">>,
  });
}

async function retrieveByEmail(ctx: ActionCtx, email: string, password: string) {
  return retrieveAccount(ctx, {
    provider: "password",
    account: { id: email, secret: password },
  });
}

// Seeds a real @convex-dev/auth `users` + `authAccounts` row (via
// createAccount, the same primitive the Password provider itself uses),
// which in turn creates the matching appUsers row through the same
// createOrUpdateUser callback a real sign-up goes through — so updateEmail's
// getEmailForCaller/applyEmailChange round-trip against real auth tables,
// not fake identity strings.
async function seedAccount(
  t: ReturnType<typeof convexTest>,
  email: string,
  password: string,
  displayName: string,
  role: "self" | "partner",
) {
  const { user } = await t.action((ctx: ActionCtx) =>
    createPasswordAccount(ctx, email, password, displayName, role),
  );
  return user._id;
}

test("updateEmail changes the caller's own email and login credential together", async () => {
  const t = convexTest(schema, testModules);
  const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");
  const asSelf = t.withIdentity({ subject: selfId });

  await asSelf.action(api.actions.users.updateEmail.updateEmail, {
    currentPassword: SELF_PASSWORD,
    newEmail: "new-self@example.com",
  });

  const updatedUser = await t.run((ctx) => ctx.db.get("users", selfId));
  expect(updatedUser?.email).toBe("new-self@example.com");

  // New email + same password now authenticates...
  await expect(
    t.action((ctx: ActionCtx) => retrieveByEmail(ctx, "new-self@example.com", SELF_PASSWORD)),
  ).resolves.toBeDefined();

  // ...and the OLD email no longer resolves to any account at all.
  await expect(
    t.action((ctx: ActionCtx) => retrieveByEmail(ctx, SELF_EMAIL, SELF_PASSWORD)),
  ).rejects.toThrow();
});

test("rejects an incorrect currentPassword and leaves the account untouched", async () => {
  const t = convexTest(schema, testModules);
  const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");
  const asSelf = t.withIdentity({ subject: selfId });

  await expect(
    asSelf.action(api.actions.users.updateEmail.updateEmail, {
      currentPassword: "totally-wrong-password",
      newEmail: "new-self@example.com",
    }),
  ).rejects.toThrow();

  const untouchedUser = await t.run((ctx) => ctx.db.get("users", selfId));
  expect(untouchedUser?.email).toBe(SELF_EMAIL);
});

test("acting as the partner never changes another user's email", async () => {
  const t = convexTest(schema, testModules);
  const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");
  const partnerId = await seedAccount(t, PARTNER_EMAIL, PARTNER_PASSWORD, "パートナー", "partner");
  const asPartner = t.withIdentity({ subject: partnerId });

  await asPartner.action(api.actions.users.updateEmail.updateEmail, {
    currentPassword: PARTNER_PASSWORD,
    newEmail: "new-partner@example.com",
  });

  const selfUser = await t.run((ctx) => ctx.db.get("users", selfId));
  const partnerUser = await t.run((ctx) => ctx.db.get("users", partnerId));
  expect(selfUser?.email).toBe(SELF_EMAIL);
  expect(partnerUser?.email).toBe("new-partner@example.com");
});
