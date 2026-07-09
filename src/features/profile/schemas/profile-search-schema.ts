import * as v from "valibot";

export const defaultProfileSearchParams = {
  emailChangeToken: undefined,
} as const satisfies Record<string, string | undefined>;

export const ProfileSearchSchema = v.object({
  emailChangeToken: v.optional(v.string()),
});
