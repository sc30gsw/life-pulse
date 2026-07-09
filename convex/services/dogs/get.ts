import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function get(ctx: QueryCtx | MutationCtx) {
  return await ctx.db.query("dogs").unique();
}
