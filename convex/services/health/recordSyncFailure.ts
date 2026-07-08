import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function recordSyncFailure(ctx: MutationCtx, args: Pick<Doc<"syncLogs">, "message">) {
  await ctx.db.insert("syncLogs", {
    at: Date.now(),
    ok: false,
    source: "garmin",
    // Omit the key entirely rather than passing `message: undefined` — see
    // the note in upsertFromSync.ts on `undefined` field-value semantics.
    ...(args.message !== undefined ? { message: args.message } : {}),
  });
}
