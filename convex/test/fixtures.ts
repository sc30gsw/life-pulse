import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../lib/domain";

export const SELF_AUTH_SUBJECT = "self_1";
export const PARTNER_AUTH_SUBJECT = "partner_1";

export function selfIdentity() {
  return { subject: SELF_AUTH_SUBJECT };
}

export function partnerIdentity() {
  return { subject: PARTNER_AUTH_SUBJECT };
}

type AppUserFixture = Pick<Doc<"appUsers">, "authSubject" | "displayName" | "role">;

export function selfUser(overrides: Partial<AppUserFixture> = {}): AppUserFixture {
  return {
    authSubject: SELF_AUTH_SUBJECT,
    displayName: "本人",
    role: "self",
    ...overrides,
  };
}

export function partnerUser(overrides: Partial<AppUserFixture> = {}): AppUserFixture {
  return {
    authSubject: PARTNER_AUTH_SUBJECT,
    displayName: "パートナー",
    role: "partner",
    ...overrides,
  };
}

type AppSettingsFixture = Pick<Doc<"appSettings">, "fastingDefaultMinutes">;

export function appSettings(overrides: Partial<AppSettingsFixture> = {}): AppSettingsFixture {
  return {
    fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
    ...overrides,
  };
}

export async function insertAppUser(ctx: MutationCtx, user: AppUserFixture = selfUser()) {
  return await ctx.db.insert("appUsers", user);
}

export async function insertStudyCategory(
  ctx: MutationCtx,
  userId: Id<"appUsers">,
  name = "TOEIC",
  overrides: Partial<Pick<Doc<"studyCategories">, "archivedAt" | "sortOrder">> = {},
) {
  return await ctx.db.insert("studyCategories", {
    archivedAt: undefined,
    name,
    sortOrder: 0,
    userId,
    ...overrides,
  });
}

export async function insertAppUserWithStudyCategory(
  ctx: MutationCtx,
  user: AppUserFixture = selfUser(),
  categoryName = "TOEIC",
) {
  const userId = await insertAppUser(ctx, user);
  const categoryId = await insertStudyCategory(ctx, userId, categoryName);

  return { categoryId, userId };
}
