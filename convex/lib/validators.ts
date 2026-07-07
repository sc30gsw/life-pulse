import { v } from "convex/values";

export const roleValidator = v.union(v.literal("self"), v.literal("partner"));

export const categoryValidator = v.union(
  v.literal("eikaiwa"),
  v.literal("toeic"),
  v.literal("reading"),
  v.literal("other"),
);

export const sessionStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("abandoned"),
);

export const interruptionReasonValidator = v.union(
  v.literal("work"),
  v.literal("dog"),
  v.literal("chore"),
  v.literal("other"),
);

export const blockStatusValidator = v.union(
  v.literal("planned"),
  v.literal("done"),
  v.literal("eroded"),
  v.literal("rescheduled"),
  v.literal("declined"),
);

export const erosionReasonValidator = v.union(
  v.literal("work"),
  v.literal("fatigue"),
  v.literal("interruption"),
  v.literal("other"),
);

export const fastingPhaseValidator = v.union(
  v.literal("early"),
  v.literal("fatburn"),
  v.literal("goal"),
);

export const dogEventKindValidator = v.union(
  v.literal("walk_am"),
  v.literal("walk_pm"),
  v.literal("meal_am"),
  v.literal("meal_noon"),
  v.literal("meal_pm"),
  v.literal("meds"),
  v.literal("toilet"),
  v.literal("brush_teeth"),
  v.literal("other"),
);

export const healthSourceValidator = v.union(
  v.literal("garmin"),
  v.literal("manual"),
  v.literal("demo"),
);

export const workoutKindValidator = v.union(
  v.literal("hiit"),
  v.literal("walk"),
  v.literal("other"),
);

export const presenceStateValidator = v.union(
  v.literal("home"),
  v.literal("office"),
  v.literal("commuting_home"),
  v.literal("out"),
  v.literal("sleeping"),
);
