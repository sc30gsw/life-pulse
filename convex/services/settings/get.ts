import type { QueryCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../appSettings/getFastingDefaultMinutes";

// Matches services/dashboard/dog.ts's no-appSettings-row fallback.
const DEFAULT_DOG_NAME = "ハマロ";

export async function get(ctx: QueryCtx) {
  const settings = await ctx.db.query("appSettings").first();

  if (settings === null) {
    return {
      demoMode: false,
      dogName: DEFAULT_DOG_NAME,
      fastingDefaultMinutes: DEFAULT_FASTING_MINUTES,
    };
  }

  return {
    demoMode: settings.demoMode,
    dogName: settings.dogName,
    fastingDefaultMinutes: settings.fastingDefaultMinutes,
  };
}
