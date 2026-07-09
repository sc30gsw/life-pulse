import { v } from "convex/values";

import {
  BLOCK_STATUS_VALUES,
  DOG_TASK_MOVE_DIRECTION_VALUES,
  EROSION_REASON_VALUES,
  FASTING_PHASE_VALUES,
  FASTING_STATUS_VALUES,
  HEALTH_SOURCE_VALUES,
  INTERRUPTION_REASON_VALUES,
  PRESENCE_STATE_VALUES,
  ROLE_VALUES,
  SCHEDULED_FASTING_PHASE_VALUES,
  SESSION_STATUS_VALUES,
  STUDY_BLOCK_SOURCE_VALUES,
  WORKOUT_KIND_VALUES,
  AUTH_SECOND_FACTOR_PURPOSE_VALUES,
  AUTH_FLOW_ERROR_CODE_VALUES,
} from "./domain";

function literalUnion<T extends string>(values: readonly T[]) {
  return v.union(...values.map((value) => v.literal(value)));
}

export const creationTimeValidator = v.number();

export const roleValidator = literalUnion(ROLE_VALUES);

export const sessionStatusValidator = literalUnion(SESSION_STATUS_VALUES);

export const interruptionReasonValidator = literalUnion(INTERRUPTION_REASON_VALUES);

export const blockStatusValidator = literalUnion(BLOCK_STATUS_VALUES);

export const studyBlockSourceValidator = literalUnion(STUDY_BLOCK_SOURCE_VALUES);

export const erosionReasonValidator = literalUnion(EROSION_REASON_VALUES);

export const fastingPhaseValidator = literalUnion(FASTING_PHASE_VALUES);
export const scheduledFastingPhaseValidator = literalUnion(SCHEDULED_FASTING_PHASE_VALUES);

export const fastingStatusValidator = literalUnion(FASTING_STATUS_VALUES);
export const endedFastingStatusValidator = v.literal("ended");

export const healthSourceValidator = literalUnion(HEALTH_SOURCE_VALUES);

export const workoutKindValidator = literalUnion(WORKOUT_KIND_VALUES);

export const presenceStateValidator = literalUnion(PRESENCE_STATE_VALUES);

export const dogTaskMoveDirectionValidator = literalUnion(DOG_TASK_MOVE_DIRECTION_VALUES);

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

export const authSecondFactorPurposeValidator = literalUnion(AUTH_SECOND_FACTOR_PURPOSE_VALUES);
export const authFlowErrorCodeValidator = literalUnion(AUTH_FLOW_ERROR_CODE_VALUES);

export const authSecondFactorChallengeFieldValidators = {
  attemptCount: v.number(),
  authUserId: v.id("users"),
  codeHash: v.string(),
  consumedAt: v.optional(v.number()),
  email: v.string(),
  emailId: v.optional(v.string()),
  expiresAt: v.number(),
  purpose: authSecondFactorPurposeValidator,
  resendAvailableAt: v.number(),
  sessionId: v.id("authSessions"),
};

export const authSecondFactorSessionFieldValidators = {
  authUserId: v.id("users"),
  expiresAt: v.number(),
  sessionId: v.id("authSessions"),
  verifiedAt: v.number(),
};

export const passwordResetTokenFieldValidators = {
  authUserId: v.id("users"),
  consumedAt: v.optional(v.number()),
  email: v.string(),
  emailId: v.optional(v.string()),
  expiresAt: v.number(),
  tokenHash: v.string(),
};

export const emailChangeTokenFieldValidators = {
  authUserId: v.id("users"),
  consumedAt: v.optional(v.number()),
  emailId: v.optional(v.string()),
  expiresAt: v.number(),
  newEmail: v.string(),
  tokenHash: v.string(),
};

export const studySessionFieldValidators = {
  abandonJobId: v.optional(v.id("_scheduled_functions")),
  accumulatedMs: v.number(),
  blockId: v.optional(v.id("studyBlocks")),
  categoryId: v.id("studyCategories"),
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
  categoryId: v.id("studyCategories"),
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

export const studyCategoryFieldValidators = {
  archivedAt: v.optional(v.number()),
  name: v.string(),
  sortOrder: v.number(),
  userId: v.id("appUsers"),
};

export const studyCategoryDocumentValidator = v.object({
  _creationTime: creationTimeValidator,
  _id: v.id("studyCategories"),
  ...studyCategoryFieldValidators,
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

export const dogFieldValidators = {
  imageStorageId: v.optional(v.id("_storage")),
  name: v.string(),
};

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
