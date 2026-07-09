import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";

export async function getFastingDefaultMinutes(ctx: QueryCtx | MutationCtx) {
  const row = await ctx.db.query("appSettings").first();

  return row?.fastingDefaultMinutes ?? DEFAULT_FASTING_MINUTES;
}
