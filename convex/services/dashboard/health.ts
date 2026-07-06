import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

type HealthArgs = Pick<Doc<"healthMetrics">, "dateJst">;

export async function health(ctx: QueryCtx, args: HealthArgs) {
  const rows = await ctx.db
    .query("healthMetrics")
    .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
    .collect();

  return rows.find((row) => row.source !== "demo") ?? null;
}
