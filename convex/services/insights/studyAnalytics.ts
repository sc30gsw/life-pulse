import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { addDaysJst, assertAnalyticsRange } from "../../lib/dateRange";

type DateJst = Doc<"studyBlocks">["dateJst"];
type RangeArgs = Record<"fromDateJst" | "toDateJst", DateJst>;
type ErosionReason = NonNullable<Doc<"studyBlocks">["erosionReason"]>;
type InterruptionReason = Doc<"interruptions">["reason"];

const EROSION_REASONS = [
  "work",
  "fatigue",
  "interruption",
  "other",
] as const satisfies readonly ErosionReason[];
const INTERRUPTION_REASONS = [
  "work",
  "dog",
  "chore",
  "other",
] as const satisfies readonly InterruptionReason[];

type CountMap<TKey extends string> = Record<TKey, number>;

export async function studyAnalytics(ctx: QueryCtx, user: Doc<"appUsers">, args: RangeArgs) {
  assertAnalyticsRange(args.fromDateJst, args.toDateJst);

  const [blocks, sessions] = await Promise.all([
    ctx.db
      .query("studyBlocks")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
      )
      .collect(),
    ctx.db
      .query("studySessions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("dateJst", args.fromDateJst).lte("dateJst", args.toDateJst),
      )
      .collect(),
  ]);

  const interruptions = await Promise.all(
    sessions.map(async (session) =>
      ctx.db
        .query("interruptions")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect(),
    ),
  );
  const interruptionsByDate = new Map<DateJst, CountMap<InterruptionReason>>();

  for (const [index, rows] of interruptions.entries()) {
    const dateJst = sessions[index]?.dateJst;
    if (dateJst === undefined) {
      continue;
    }

    const counts = interruptionsByDate.get(dateJst) ?? emptyCounts(INTERRUPTION_REASONS);
    for (const row of rows) {
      counts[row.reason] += 1;
    }
    interruptionsByDate.set(dateJst, counts);
  }

  const days = enumerateDates(args.fromDateJst, args.toDateJst).map((dateJst) => {
    const dayBlocks = blocks.filter((block) => block.dateJst === dateJst);
    const countedBlocks = dayBlocks.filter((block) => block.status !== "rescheduled");
    const plannedMinutes = countedBlocks.reduce((sum, block) => sum + block.plannedMinutes, 0);
    const defendedMinutes = countedBlocks
      .filter((block) => block.status === "done")
      .reduce((sum, block) => sum + block.plannedMinutes, 0);
    const erosionReasons = emptyCounts(EROSION_REASONS);

    for (const block of countedBlocks) {
      if (block.erosionReason !== undefined) {
        erosionReasons[block.erosionReason] += 1;
      }
    }

    return {
      dateJst,
      defendedMinutes,
      defenseRate: plannedMinutes === 0 ? null : defendedMinutes / plannedMinutes,
      erosionReasons,
      interruptionReasons: interruptionsByDate.get(dateJst) ?? emptyCounts(INTERRUPTION_REASONS),
      plannedMinutes,
    };
  });

  return { days };
}

function emptyCounts<const TKeys extends readonly string[]>(keys: TKeys): CountMap<TKeys[number]> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as CountMap<TKeys[number]>;
}

function enumerateDates(fromDateJst: DateJst, toDateJst: DateJst) {
  const dates: DateJst[] = [];
  let current = fromDateJst;

  while (current <= toDateJst) {
    dates.push(current);
    current = addDaysJst(current, 1);
  }

  return dates;
}
