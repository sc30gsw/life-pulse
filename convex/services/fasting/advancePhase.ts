import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type AdvancePhaseArgs = {
  to: "fatburn" | "goal";
  windowId: Id<"fastingWindows">;
};

export async function advancePhase(ctx: MutationCtx, args: AdvancePhaseArgs) {
  const window = await ctx.db.get("fastingWindows", args.windowId);

  if (window === null || window.status !== "fasting") {
    return;
  }

  if (args.to === "fatburn" && window.phase !== "early") {
    return;
  }

  await ctx.db.patch("fastingWindows", window._id, { phase: args.to });
}
