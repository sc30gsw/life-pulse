import { v } from "convex/values";

export const creationTimeValidator = v.number();

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

export const studyBlockSourceValidator = v.union(v.literal("manual"), v.literal("suggested"));

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

export const fastingStatusValidator = v.union(v.literal("fasting"), v.literal("ended"));
export const endedFastingStatusValidator = v.literal("ended");

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

export const appUserFieldValidators = {
  avatarStorageId: v.optional(v.id("_storage")),
  authSubject: v.string(),
  displayName: v.string(),
  role: roleValidator,
};

export const appUserDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("appUsers"),
  ...appUserFieldValidators,
});

export const studySessionFieldValidators = {
  abandonJobId: v.optional(v.id("_scheduled_functions")),
  accumulatedMs: v.number(),
  blockId: v.optional(v.id("studyBlocks")),
  category: categoryValidator,
  dateJst: v.string(),
  endedAt: v.optional(v.number()),
  interruptionCount: v.number(),
  lastResumedAt: v.optional(v.number()),
  plannedMinutes: v.optional(v.number()),
  startedAt: v.number(),
  status: sessionStatusValidator,
  userId: v.id("appUsers"),
};

export const studySessionDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("studySessions"),
  ...studySessionFieldValidators,
});

export const interruptionFieldValidators = {
  pausedAt: v.number(),
  reason: interruptionReasonValidator,
  resumedAt: v.optional(v.number()),
  sessionId: v.id("studySessions"),
};

export const studyBlockFieldValidators = {
  category: categoryValidator,
  dateJst: v.string(),
  endHm: v.string(),
  erosionReason: v.optional(erosionReasonValidator),
  plannedMinutes: v.number(),
  rescheduledToId: v.optional(v.id("studyBlocks")),
  source: studyBlockSourceValidator,
  startHm: v.string(),
  status: blockStatusValidator,
  userId: v.id("appUsers"),
};

export const studyBlockDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("studyBlocks"),
  ...studyBlockFieldValidators,
});

export const fastingWindowFieldValidators = {
  actualMinutes: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  phase: fastingPhaseValidator,
  phaseJobIds: v.array(v.id("_scheduled_functions")),
  startedAt: v.number(),
  status: fastingStatusValidator,
  targetMinutes: v.number(),
  userId: v.id("appUsers"),
};

export const fastingWindowDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("fastingWindows"),
  ...fastingWindowFieldValidators,
});

export const dogFieldValidators = { name: v.string() };

export const dogDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("dogs"),
  ...dogFieldValidators,
});

export const dogTaskFieldValidators = {
  archivedAt: v.optional(v.number()),
  name: v.string(),
  sortOrder: v.number(),
};

export const dogTaskDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("dogTasks"),
  ...dogTaskFieldValidators,
});

export const dogEventFieldValidators = {
  at: v.number(),
  byUserId: v.id("appUsers"),
  dateJst: v.string(),
  note: v.optional(v.string()),
  taskId: v.id("dogTasks"),
};

export const dogEventDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("dogEvents"),
  ...dogEventFieldValidators,
});

export const healthMetricFieldValidators = {
  bodyBattery: v.optional(v.number()),
  dateJst: v.string(),
  hrv: v.optional(v.number()),
  restingHr: v.optional(v.number()),
  sleepMinutes: v.optional(v.number()),
  sleepScore: v.optional(v.number()),
  source: healthSourceValidator,
  steps: v.optional(v.number()),
  syncedAt: v.number(),
};

export const healthMetricDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("healthMetrics"),
  ...healthMetricFieldValidators,
});

export const workoutFieldValidators = {
  at: v.number(),
  dateJst: v.string(),
  durationMinutes: v.number(),
  kind: workoutKindValidator,
  perceivedIntensity: v.optional(v.number()),
};

export const workoutDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("workouts"),
  ...workoutFieldValidators,
});

export const presenceFieldValidators = {
  etaHm: v.optional(v.string()),
  state: presenceStateValidator,
  updatedAt: v.number(),
  userId: v.id("appUsers"),
};

export const presenceDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("presence"),
  ...presenceFieldValidators,
});

export const syncLogFieldValidators = {
  at: v.number(),
  message: v.optional(v.string()),
  ok: v.boolean(),
  source: v.string(),
};

export const syncLogDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("syncLogs"),
  ...syncLogFieldValidators,
});

export const appSettingsFieldValidators = {
  demoJobId: v.optional(v.id("_scheduled_functions")),
  demoMode: v.boolean(),
  fastingDefaultMinutes: v.number(),
};
