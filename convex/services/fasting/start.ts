import { ConvexError } from "convex/values";

import { internal } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { getFastingDefaultMinutes } from "../appSettings/getFastingDefaultMinutes";
import { phaseSchedule } from "./phaseSchedule";

type StartArgs = Partial<Pick<Doc<"fastingWindows">, "targetMinutes">>;

export async function start(ctx: MutationCtx, user: Doc<"appUsers">, args: StartArgs) {
  const existing = await ctx.db
    .query("fastingWindows")
    .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "fasting"))
    .first();

  if (existing !== null) {
    throw new ConvexError("FASTING_EXISTS");
  }

  if (
    args.targetMinutes !== undefined &&
    (!Number.isInteger(args.targetMinutes) || args.targetMinutes <= 0)
  ) {
    throw new ConvexError("INVALID_TARGET");
  }

  const target = args.targetMinutes ?? (await getFastingDefaultMinutes(ctx));
  const schedule = phaseSchedule(target);

  const windowId = await ctx.db.insert("fastingWindows", {
    phase: "early",
    phaseJobIds: [],
    startedAt: Date.now(),
    status: "fasting",
    targetMinutes: target,
    userId: user._id,
  });

  const jobIds = await Promise.all(
    schedule.map((entry) =>
      ctx.scheduler.runAfter(
        entry.afterMinutes * 60_000,
        internal.mutations.fasting.advancePhase.advancePhase,
        { to: entry.to, windowId },
      ),
    ),
  );

  await ctx.db.patch("fastingWindows", windowId, { phaseJobIds: jobIds });

  return windowId;
}
