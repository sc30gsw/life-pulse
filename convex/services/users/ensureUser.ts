import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type EnsureUserArgs = Pick<Doc<"appUsers">, "displayName" | "role">;

export async function ensureUser(
  ctx: MutationCtx,
  authSubject: Doc<"appUsers">["authSubject"],
  args: EnsureUserArgs,
) {
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
