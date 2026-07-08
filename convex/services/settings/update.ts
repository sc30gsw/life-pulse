import { ConvexError } from "convex/values";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";

type UpdateArgs = Partial<Pick<Doc<"appSettings">, "fastingDefaultMinutes">>;

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
      fastingDefaultMinutes: args.fastingDefaultMinutes ?? DEFAULT_FASTING_MINUTES,
    });
    return;
  }

  await ctx.db.patch("appSettings", settings._id, {
    ...(args.fastingDefaultMinutes !== undefined && {
      fastingDefaultMinutes: args.fastingDefaultMinutes,
    }),
  });
}
