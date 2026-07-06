import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type SetStatusArgs = Pick<Doc<"presence">, "state" | "etaHm">;

export async function setStatus(ctx: MutationCtx, user: Doc<"appUsers">, args: SetStatusArgs) {
  // etaHm is only meaningful while commuting home; every other state clears it.
  const etaHm = args.state === "commuting_home" ? args.etaHm : undefined;

  const existing = await ctx.db
    .query("presence")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();

  if (existing !== null) {
    await ctx.db.patch("presence", existing._id, {
      state: args.state,
      etaHm,
      updatedAt: Date.now(),
    });
    return;
  }

  await ctx.db.insert("presence", {
    userId: user._id,
    state: args.state,
    etaHm,
    updatedAt: Date.now(),
  });
}
