import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc";

import type { Doc } from "../../_generated/dataModel";

dayjsBase.extend(utc);

// Derives the JST calendar date for a workout's "at" timestamp. Pure
// function (CVX-09) shared by logWorkout/updateWorkout — mirrors the same
// dayjs().utcOffset(9) technique convex/lib/dateRange.ts's todayJst() uses
// internally (NFR-3: no new date logic, same pattern applied to an arbitrary
// instant instead of "now").
export function deriveDateJst(at: Doc<"workouts">["at"]): Doc<"workouts">["dateJst"] {
  return dayjsBase(at).utcOffset(9).format("YYYY-MM-DD");
}
