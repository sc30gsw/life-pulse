import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { convexTest } from "convex-test";
import type { WithoutSystemFields } from "convex/server";
import { expect, test } from "vite-plus/test";

import { api } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import schema from "../../schema";
import { testModules } from "../../test.setup";

const AUTH_ROUND_TRIP_TIMEOUT_MS = 60_000;

// Mirrors convex/auth.ts's SignUpProfile: `email` lives on the auth `users`
// table, while `displayName`/`role` belong to `appUsers` only — createAccount's
// own type only allows `users` fields, but createOrUpdateUser's callback (see
// convex/auth.ts) reads displayName/role off the same profile object at
// runtime, exactly like a real Password sign-up.
type SeedProfile = Pick<WithoutSystemFields<Doc<"users">>, "email"> &
  Pick<WithoutSystemFields<Doc<"appUsers">>, "displayName" | "role">;
type AuthEmail = NonNullable<Doc<"users">["email"]>;
type AuthPasswordSecret = Parameters<typeof createAccount>[1]["account"]["secret"];

const SELF_EMAIL = "self@example.com";
const SELF_OLD_PASSWORD = "OldPassw0rd1";
const SELF_NEW_PASSWORD = "NewPassw0rd1";
const PARTNER_EMAIL = "partner@example.com";
const PARTNER_PASSWORD = "PartnerPassw0rd1";

// Named (not inline-async) so it never matches a bare-positional-`action`
// lint heuristic — this is convex-test's `t.action(handler)` escape hatch
// for running arbitrary code with a real ActionCtx, not a registered Convex
// function.
async function createPasswordAccount(
  ctx: Parameters<typeof createAccount>[0],
  email: AuthEmail,
  password: AuthPasswordSecret,
  displayName: Doc<"appUsers">["displayName"],
  role: Doc<"appUsers">["role"],
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

async function retrieveByEmail(
  ctx: Parameters<typeof retrieveAccount>[0],
  email: AuthEmail,
  password: AuthPasswordSecret,
) {
  return retrieveAccount(ctx, {
    provider: "password",
    account: { id: email, secret: password },
  });
}

// Seeds a real @convex-dev/auth `users` + `authAccounts` row (via
// createAccount, the same primitive the Password provider itself uses),
// which in turn creates the matching appUsers row through the same
// createOrUpdateUser callback a real sign-up goes through — so
// updatePassword's getEmailForCaller/modifyAccountCredentials round-trip
// against real auth tables, not fake identity strings.
async function seedAccount(
  t: ReturnType<typeof convexTest>,
  email: AuthEmail,
  password: AuthPasswordSecret,
  displayName: Doc<"appUsers">["displayName"],
  role: Doc<"appUsers">["role"],
) {
  const { user } = await t.action((ctx) =>
    createPasswordAccount(
      ctx as unknown as Parameters<typeof createPasswordAccount>[0],
      email,
      password,
      displayName,
      role,
    ),
  );
  return user._id;
}

test(
  "updatePassword rotates the caller's own credential",
  async () => {
    const t = convexTest(schema, testModules);
    const selfId = await seedAccount(t, SELF_EMAIL, SELF_OLD_PASSWORD, "本人", "self");
    const asSelf = t.withIdentity({ subject: selfId });

    await asSelf.action(api.actions.users.updatePassword.updatePassword, {
      currentPassword: SELF_OLD_PASSWORD,
      newPassword: SELF_NEW_PASSWORD,
    });

    // Sign-in with the NEW password now succeeds...
    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          SELF_EMAIL,
          SELF_NEW_PASSWORD,
        ),
      ),
    ).resolves.toBeDefined();

    // ...and sign-in with the OLD password fails afterward.
    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          SELF_EMAIL,
          SELF_OLD_PASSWORD,
        ),
      ),
    ).rejects.toThrow();
  },
  AUTH_ROUND_TRIP_TIMEOUT_MS,
);

test(
  "rejects an incorrect currentPassword and leaves the credential untouched",
  async () => {
    const t = convexTest(schema, testModules);
    const selfId = await seedAccount(t, SELF_EMAIL, SELF_OLD_PASSWORD, "本人", "self");
    const asSelf = t.withIdentity({ subject: selfId });

    await expect(
      asSelf.action(api.actions.users.updatePassword.updatePassword, {
        currentPassword: "totally-wrong-password",
        newPassword: SELF_NEW_PASSWORD,
      }),
    ).rejects.toThrow();

    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          SELF_EMAIL,
          SELF_OLD_PASSWORD,
        ),
      ),
    ).resolves.toBeDefined();
  },
  AUTH_ROUND_TRIP_TIMEOUT_MS,
);

test(
  "rejects a newPassword that fails the shared password requirements",
  async () => {
    const t = convexTest(schema, testModules);
    const selfId = await seedAccount(t, SELF_EMAIL, SELF_OLD_PASSWORD, "本人", "self");
    const asSelf = t.withIdentity({ subject: selfId });

    await expect(
      asSelf.action(api.actions.users.updatePassword.updatePassword, {
        currentPassword: SELF_OLD_PASSWORD,
        newPassword: "short1A",
      }),
    ).rejects.toThrow();

    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          SELF_EMAIL,
          SELF_OLD_PASSWORD,
        ),
      ),
    ).resolves.toBeDefined();
  },
  AUTH_ROUND_TRIP_TIMEOUT_MS,
);

test(
  "acting as the partner never changes another user's password",
  async () => {
    const t = convexTest(schema, testModules);
    await seedAccount(t, SELF_EMAIL, SELF_OLD_PASSWORD, "本人", "self");
    const partnerId = await seedAccount(
      t,
      PARTNER_EMAIL,
      PARTNER_PASSWORD,
      "パートナー",
      "partner",
    );
    const asPartner = t.withIdentity({ subject: partnerId });

    await asPartner.action(api.actions.users.updatePassword.updatePassword, {
      currentPassword: PARTNER_PASSWORD,
      newPassword: "PartnerNewPassw0rd1",
    });

    // The self user's original password still works — untouched by the
    // partner's own password change.
    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          SELF_EMAIL,
          SELF_OLD_PASSWORD,
        ),
      ),
    ).resolves.toBeDefined();
  },
  AUTH_ROUND_TRIP_TIMEOUT_MS,
);
