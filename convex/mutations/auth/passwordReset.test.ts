import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { internal } from "../../_generated/api";
import schema from "../../schema";
import { PASSWORD_RESET_TTL_MS } from "../../services/auth/constants";
import { testModules } from "../../test.setup";

const NOW = 1_800_000_000_000;
const EMAIL = "self@example.com";

async function seedAuthUser(t: ReturnType<typeof convexTest>) {
  return await t.run((ctx) => ctx.db.insert("users", { email: EMAIL }));
}

test("consumePasswordResetToken returns the target account once", async () => {
  const t = convexTest(schema, testModules);
  const authUserId = await seedAuthUser(t);

  await t.mutation(internal.mutations.auth.createPasswordResetToken.createPasswordResetToken, {
    authUserId,
    email: EMAIL,
    now: NOW,
    tokenHash: "token",
  });

  await expect(
    t.mutation(internal.mutations.auth.consumePasswordResetToken.consumePasswordResetToken, {
      now: NOW + 1,
      tokenHash: "token",
    }),
  ).resolves.toEqual({ ok: true, token: { authUserId, email: EMAIL } });

  await expect(
    t.mutation(internal.mutations.auth.consumePasswordResetToken.consumePasswordResetToken, {
      now: NOW + 2,
      tokenHash: "token",
    }),
  ).resolves.toEqual({ code: "RESET_TOKEN_INVALID", ok: false });
});

test("consumePasswordResetToken rejects expired tokens", async () => {
  const t = convexTest(schema, testModules);
  const authUserId = await seedAuthUser(t);

  await t.mutation(internal.mutations.auth.createPasswordResetToken.createPasswordResetToken, {
    authUserId,
    email: EMAIL,
    now: NOW,
    tokenHash: "expired",
  });

  await expect(
    t.mutation(internal.mutations.auth.consumePasswordResetToken.consumePasswordResetToken, {
      now: NOW + PASSWORD_RESET_TTL_MS + 1,
      tokenHash: "expired",
    }),
  ).resolves.toEqual({ code: "RESET_TOKEN_EXPIRED", ok: false });
});
