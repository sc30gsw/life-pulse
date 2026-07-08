import type { Doc } from "../_generated/dataModel";
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

type AppSettingsFixture = Pick<
  Doc<"appSettings">,
  "demoJobId" | "demoMode" | "fastingDefaultMinutes"
>;

export function appSettings(overrides: Partial<AppSettingsFixture> = {}): AppSettingsFixture {
  return {
    demoMode: false,
    fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
    ...overrides,
  };
}
