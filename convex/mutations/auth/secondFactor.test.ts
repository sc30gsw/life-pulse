import { convexTest } from "convex-test";
import { expect, test } from "vite-plus/test";

import { api, internal } from "../../_generated/api";
import { requireUser } from "../../lib/auth";
import { AUTH_SECOND_FACTOR_SIGNIN_PURPOSE } from "../../lib/domain";
import schema from "../../schema";
import {
  SECOND_FACTOR_MAX_ATTEMPTS,
  SECOND_FACTOR_OTP_TTL_MS,
  SECOND_FACTOR_RESEND_COOLDOWN_MS,
} from "../../services/auth/constants";
import { testModules } from "../../test.setup";

const NOW = 1_800_000_000_000;
const EMAIL = "self@example.com";

async function seedAuthSession(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const authUserId = await ctx.db.insert("users", { email: EMAIL });
    const sessionId = await ctx.db.insert("authSessions", {
      expirationTime: NOW + SECOND_FACTOR_OTP_TTL_MS,
      userId: authUserId,
    });

    await ctx.db.insert("appUsers", {
      authSubject: authUserId,
      displayName: "本人",
      role: "self",
    });

    return { authUserId, sessionId };
  });
}

test("createSecondFactorChallenge blocks resend until cooldown elapses", async () => {
  const t = convexTest(schema, testModules);
  const { authUserId, sessionId } = await seedAuthSession(t);

  await t.mutation(
    internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge,
    {
      authUserId,
      codeHash: "first",
      email: EMAIL,
      now: NOW,
      purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
      sessionId,
    },
  );

  await expect(
    t.mutation(internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge, {
      authUserId,
      codeHash: "second",
      email: EMAIL,
      now: NOW + SECOND_FACTOR_RESEND_COOLDOWN_MS - 1,
      purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
      sessionId,
    }),
  ).rejects.toThrow("OTP_RESEND_WAIT");
});

test("verifySecondFactorChallenge records verified state for the auth session", async () => {
  const t = convexTest(schema, testModules);
  const { authUserId, sessionId } = await seedAuthSession(t);
  const asSession = t.withIdentity({ subject: `${authUserId}|${sessionId}` });

  await t.mutation(
    internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge,
    {
      authUserId,
      codeHash: "correct",
      email: EMAIL,
      now: Date.now(),
      purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
      sessionId,
    },
  );

  await t.mutation(
    internal.mutations.auth.verifySecondFactorChallenge.verifySecondFactorChallenge,
    {
      authUserId,
      codeHash: "correct",
      now: Date.now(),
      sessionId,
    },
  );

  await expect(
    asSession.query(api.queries.auth.secondFactorStatus.secondFactorStatus, {}),
  ).resolves.toEqual({ required: true, resendAvailableAt: null, verified: true });
});

test("secondFactorStatus returns the resend availability from the active challenge", async () => {
  const t = convexTest(schema, testModules);
  const { authUserId, sessionId } = await seedAuthSession(t);
  const asSession = t.withIdentity({ subject: `${authUserId}|${sessionId}` });

  await t.mutation(
    internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge,
    {
      authUserId,
      codeHash: "correct",
      email: EMAIL,
      now: NOW,
      purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
      sessionId,
    },
  );

  await expect(
    asSession.query(api.queries.auth.secondFactorStatus.secondFactorStatus, {}),
  ).resolves.toEqual({
    required: true,
    resendAvailableAt: NOW + SECOND_FACTOR_RESEND_COOLDOWN_MS,
    verified: false,
  });
});

test("verifySecondFactorChallenge caps invalid attempts", async () => {
  const t = convexTest(schema, testModules);
  const { authUserId, sessionId } = await seedAuthSession(t);

  await t.mutation(
    internal.mutations.auth.createSecondFactorChallenge.createSecondFactorChallenge,
    {
      authUserId,
      codeHash: "correct",
      email: EMAIL,
      now: NOW,
      purpose: AUTH_SECOND_FACTOR_SIGNIN_PURPOSE,
      sessionId,
    },
  );

  for (let attempt = 0; attempt < SECOND_FACTOR_MAX_ATTEMPTS; attempt += 1) {
    await expect(
      t.mutation(internal.mutations.auth.verifySecondFactorChallenge.verifySecondFactorChallenge, {
        authUserId,
        codeHash: `wrong-${attempt}`,
        now: NOW,
        sessionId,
      }),
    ).resolves.toEqual({ code: "OTP_INVALID", ok: false });
  }

  await expect(
    t.mutation(internal.mutations.auth.verifySecondFactorChallenge.verifySecondFactorChallenge, {
      authUserId,
      codeHash: "still-wrong",
      now: NOW,
      sessionId,
    }),
  ).resolves.toEqual({ code: "OTP_ATTEMPTS_EXCEEDED", ok: false });
});

test("requireUser rejects session subjects until second factor is verified", async () => {
  const t = convexTest(schema, testModules);
  const { authUserId, sessionId } = await seedAuthSession(t);
  const asSession = t.withIdentity({ subject: `${authUserId}|${sessionId}` });

  await expect(asSession.run((ctx) => requireUser(ctx))).rejects.toThrow("SECOND_FACTOR_REQUIRED");

  await t.run((ctx) =>
    ctx.db.insert("authSecondFactorSessions", {
      authUserId,
      expiresAt: Date.now() + 60_000,
      sessionId,
      verifiedAt: Date.now(),
    }),
  );

  await expect(asSession.run((ctx) => requireUser(ctx))).resolves.toMatchObject({
    _id: expect.any(String),
    authSubject: authUserId,
  });
});
