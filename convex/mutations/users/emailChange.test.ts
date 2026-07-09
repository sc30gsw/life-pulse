import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { convexTest } from "convex-test";
import type { WithoutSystemFields } from "convex/server";
import { expect, test } from "vite-plus/test";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import schema from "../../schema";
import { EMAIL_CHANGE_TTL_MS } from "../../services/auth/constants";
import { testModules } from "../../test.setup";

const AUTH_ROUND_TRIP_TIMEOUT_MS = 60_000;
const NOW = 1_800_000_000_000;
const SELF_EMAIL = "self@example.com";
const SELF_PASSWORD = "OldPassw0rd1";
const PARTNER_EMAIL = "partner@example.com";
const PARTNER_PASSWORD = "PartnerPassw0rd1";

type SeedProfile = Pick<WithoutSystemFields<Doc<"users">>, "email"> &
  Pick<WithoutSystemFields<Doc<"appUsers">>, "displayName" | "role">;
type AuthEmail = NonNullable<Doc<"users">["email"]>;
type AuthPasswordSecret = Parameters<typeof createAccount>[1]["account"]["secret"];

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
  "confirmEmailChangeTokenAndApply updates the auth email SSoT and consumes the token once",
  async () => {
    const t = convexTest(schema, testModules);
    const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");

    await t.mutation(internal.mutations.users.createEmailChangeToken.createEmailChangeToken, {
      authUserId: selfId,
      newEmail: "new-self@example.com",
      now: NOW,
      tokenHash: "token",
    });

    await t.mutation(
      internal.mutations.users.confirmEmailChangeTokenAndApply.confirmEmailChangeTokenAndApply,
      { authUserId: selfId, now: NOW + 1, tokenHash: "token" },
    );

    const updatedUser = await t.run((ctx) => ctx.db.get("users", selfId));
    expect(updatedUser?.email).toBe("new-self@example.com");

    await expect(
      t.action((ctx) =>
        retrieveByEmail(
          ctx as unknown as Parameters<typeof retrieveByEmail>[0],
          "new-self@example.com",
          SELF_PASSWORD,
        ),
      ),
    ).resolves.toBeDefined();

    await expect(
      t.mutation(
        internal.mutations.users.confirmEmailChangeTokenAndApply.confirmEmailChangeTokenAndApply,
        { authUserId: selfId, now: NOW + 2, tokenHash: "token" },
      ),
    ).rejects.toThrow("EMAIL_CHANGE_TOKEN_INVALID");
  },
  AUTH_ROUND_TRIP_TIMEOUT_MS,
);

test("confirmEmailChangeTokenAndApply rejects tokens owned by another auth user", async () => {
  const t = convexTest(schema, testModules);
  const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");
  const partnerId = await seedAccount(t, PARTNER_EMAIL, PARTNER_PASSWORD, "パートナー", "partner");

  await t.mutation(internal.mutations.users.createEmailChangeToken.createEmailChangeToken, {
    authUserId: selfId,
    newEmail: "new-self@example.com",
    now: NOW,
    tokenHash: "owned-by-self",
  });

  await expect(
    t.mutation(
      internal.mutations.users.confirmEmailChangeTokenAndApply.confirmEmailChangeTokenAndApply,
      { authUserId: partnerId, now: NOW + 1, tokenHash: "owned-by-self" },
    ),
  ).rejects.toThrow("EMAIL_CHANGE_TOKEN_NOT_OWNED");

  const selfUser = await t.run((ctx) => ctx.db.get("users", selfId));
  expect(selfUser?.email).toBe(SELF_EMAIL);
});

test("confirmEmailChangeTokenAndApply rejects expired tokens without applying email changes", async () => {
  const t = convexTest(schema, testModules);
  const selfId = await seedAccount(t, SELF_EMAIL, SELF_PASSWORD, "本人", "self");

  await t.mutation(internal.mutations.users.createEmailChangeToken.createEmailChangeToken, {
    authUserId: selfId,
    newEmail: "new-self@example.com",
    now: NOW,
    tokenHash: "expired",
  });

  await expect(
    t.mutation(
      internal.mutations.users.confirmEmailChangeTokenAndApply.confirmEmailChangeTokenAndApply,
      { authUserId: selfId, now: NOW + EMAIL_CHANGE_TTL_MS + 1, tokenHash: "expired" },
    ),
  ).rejects.toThrow("EMAIL_CHANGE_TOKEN_EXPIRED");

  const selfUser = await t.run((ctx) => ctx.db.get("users", selfId));
  expect(selfUser?.email).toBe(SELF_EMAIL);
});
