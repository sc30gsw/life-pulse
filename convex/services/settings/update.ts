import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../appSettings/getFastingDefaultMinutes";

// Matches services/dashboard/dog.ts's no-appSettings-row fallback.
const DEFAULT_DOG_NAME = "ハマロ";

type UpdateArgs = Partial<Pick<Doc<"appSettings">, "dogName" | "fastingDefaultMinutes">>;

export async function update(ctx: MutationCtx, args: UpdateArgs) {
  if (
    args.fastingDefaultMinutes !== undefined &&
    (!Number.isInteger(args.fastingDefaultMinutes) || args.fastingDefaultMinutes <= 0)
  ) {
    throw new ConvexError("INVALID_TARGET");
  }

  const settings = await ctx.db.query("appSettings").first();

  if (settings === null) {
    await ctx.db.insert("appSettings", {
      demoMode: false,
      dogName: args.dogName ?? DEFAULT_DOG_NAME,
      fastingDefaultMinutes: args.fastingDefaultMinutes ?? DEFAULT_FASTING_MINUTES,
    });
    return;
  }

  await ctx.db.patch("appSettings", settings._id, {
    ...(args.dogName !== undefined && { dogName: args.dogName }),
    ...(args.fastingDefaultMinutes !== undefined && {
      fastingDefaultMinutes: args.fastingDefaultMinutes,
    }),
  });
}
