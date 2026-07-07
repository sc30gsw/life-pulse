import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

type DogArgs = Pick<Doc<"dogEvents">, "dateJst">;

export async function dog(ctx: QueryCtx, args: DogArgs) {
  const settings = await ctx.db.query("appSettings").first();
  const dogName = settings?.dogName ?? "ハマロ";

  const rawEvents = await ctx.db
    .query("dogEvents")
    .withIndex("by_date", (q) => q.eq("dateJst", args.dateJst))
    .collect();

  const eventsWithActor = await Promise.all(
    rawEvents.map(async (event) => {
      const byUser = await ctx.db.get("appUsers", event.byUserId);

      // A missing appUsers row means the actor was deleted after logging the
      // event; drop it rather than surfacing a broken reference on the board.
      if (byUser === null) {
        return null;
      }

      return {
        at: event.at,
        byDisplayName: byUser.displayName,
        byRole: byUser.role,
        id: event._id,
        kind: event.kind,
      };
    }),
  );

  const events = eventsWithActor.filter((event) => event !== null);

  return { dogName, events };
}
