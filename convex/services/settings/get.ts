import type { QueryCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";

export async function get(ctx: QueryCtx) {
  const settings = await ctx.db.query("appSettings").first();

  if (settings === null) {
    return {
      fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
    };
  }

  return {
    fastingDefaultMinutes: settings.fastingDefaultMinutes,
  };
}
