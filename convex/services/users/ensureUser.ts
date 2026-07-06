import type { Infer } from "convex/values";

import type { MutationCtx } from "../../_generated/server";
import type { roleValidator } from "../../lib/validators";

type EnsureUserArgs = {
  displayName: string;
  role: Infer<typeof roleValidator>;
};

export async function ensureUser(ctx: MutationCtx, authSubject: string, args: EnsureUserArgs) {
  const existing = await ctx.db
    .query("appUsers")
    .withIndex("by_subject", (q) => q.eq("authSubject", authSubject))
    .unique();

  if (existing !== null) {
    return;
  }

  await ctx.db.insert("appUsers", {
    authSubject,
    displayName: args.displayName,
    role: args.role,
  });
}
