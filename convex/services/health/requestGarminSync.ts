import { internal } from "../../_generated/api";
import type { MutationCtx } from "../../_generated/server";

export async function requestGarminSync(ctx: MutationCtx) {
  await ctx.scheduler.runAfter(0, internal.actions.garmin.syncDaily.syncDaily, {});
}
