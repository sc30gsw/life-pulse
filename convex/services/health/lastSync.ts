import type { QueryCtx } from "../../_generated/server";

export async function lastSync(ctx: QueryCtx) {
  const rows = await ctx.db.query("syncLogs").order("desc").take(1);

  return rows[0] ?? null;
}
