import type { MutationCtx, QueryCtx } from "../../_generated/server";

export const DEFAULT_FASTING_MINUTES = 960;

export async function getFastingDefaultMinutes(ctx: QueryCtx | MutationCtx) {
  const row = await ctx.db.query("appSettings").first();

  return row?.fastingDefaultMinutes ?? DEFAULT_FASTING_MINUTES;
}
