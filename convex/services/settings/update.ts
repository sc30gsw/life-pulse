import { Result, type Result as ResultType } from "better-result";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { DEFAULT_FASTING_MINUTES } from "../../lib/domain";
import { SettingsError } from "./errors";

type UpdateArgs = Partial<Pick<Doc<"appSettings">, "fastingDefaultMinutes">>;

export async function update(
  ctx: MutationCtx,
  args: UpdateArgs,
): Promise<ResultType<void, SettingsError>> {
  if (
    args.fastingDefaultMinutes !== undefined &&
    (!Number.isInteger(args.fastingDefaultMinutes) || args.fastingDefaultMinutes <= 0)
  ) {
    return Result.err(new SettingsError({ code: "INVALID_TARGET" }));
  }

  const settings = await ctx.db.query("appSettings").first();

  if (settings === null) {
    await ctx.db.insert("appSettings", {
      fastingDefaultMinutes: args.fastingDefaultMinutes ?? DEFAULT_FASTING_MINUTES,
    });
    return Result.ok();
  }

  await ctx.db.patch("appSettings", settings._id, {
    ...(args.fastingDefaultMinutes !== undefined && {
      fastingDefaultMinutes: args.fastingDefaultMinutes,
    }),
  });

  return Result.ok();
}
