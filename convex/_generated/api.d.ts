/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_garmin_client from "../actions/garmin/client.js";
import type * as actions_garmin_syncDaily from "../actions/garmin/syncDaily.js";
import type * as actions_users_updateEmail from "../actions/users/updateEmail.js";
import type * as actions_users_updatePassword from "../actions/users/updatePassword.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dateRange from "../lib/dateRange.js";
import type * as lib_demoConstants from "../lib/demoConstants.js";
import type * as lib_domain from "../lib/domain.js";
import type * as lib_hm from "../lib/hm.js";
import type * as lib_passwordRequirements from "../lib/passwordRequirements.js";
import type * as lib_validators from "../lib/validators.js";
import type * as mutations_blocks_declare from "../mutations/blocks/declare.js";
import type * as mutations_blocks_decline from "../mutations/blocks/decline.js";
import type * as mutations_blocks_erode from "../mutations/blocks/erode.js";
import type * as mutations_blocks_remove from "../mutations/blocks/remove.js";
import type * as mutations_blocks_reschedule from "../mutations/blocks/reschedule.js";
import type * as mutations_blocks_undoDecline from "../mutations/blocks/undoDecline.js";
import type * as mutations_blocks_update from "../mutations/blocks/update.js";
import type * as mutations_demo_setDemoMode from "../mutations/demo/setDemoMode.js";
import type * as mutations_demo_tick from "../mutations/demo/tick.js";
import type * as mutations_dog_logEvent from "../mutations/dog/logEvent.js";
import type * as mutations_dog_undoEvent from "../mutations/dog/undoEvent.js";
import type * as mutations_dogTasks_archive from "../mutations/dogTasks/archive.js";
import type * as mutations_dogTasks_create from "../mutations/dogTasks/create.js";
import type * as mutations_dogTasks_move from "../mutations/dogTasks/move.js";
import type * as mutations_dogTasks_rename from "../mutations/dogTasks/rename.js";
import type * as mutations_dogTasks_seed from "../mutations/dogTasks/seed.js";
import type * as mutations_dogs_generateImageUploadUrl from "../mutations/dogs/generateImageUploadUrl.js";
import type * as mutations_dogs_setImage from "../mutations/dogs/setImage.js";
import type * as mutations_dogs_update from "../mutations/dogs/update.js";
import type * as mutations_fasting_advancePhase from "../mutations/fasting/advancePhase.js";
import type * as mutations_fasting_end from "../mutations/fasting/end.js";
import type * as mutations_fasting_start from "../mutations/fasting/start.js";
import type * as mutations_health_deleteWorkout from "../mutations/health/deleteWorkout.js";
import type * as mutations_health_logWorkout from "../mutations/health/logWorkout.js";
import type * as mutations_health_recordSyncFailure from "../mutations/health/recordSyncFailure.js";
import type * as mutations_health_requestGarminSync from "../mutations/health/requestGarminSync.js";
import type * as mutations_health_updateWorkout from "../mutations/health/updateWorkout.js";
import type * as mutations_health_upsertFromSync from "../mutations/health/upsertFromSync.js";
import type * as mutations_health_upsertManual from "../mutations/health/upsertManual.js";
import type * as mutations_partnerStatus_setStatus from "../mutations/partnerStatus/setStatus.js";
import type * as mutations_sessions_autoAbandon from "../mutations/sessions/autoAbandon.js";
import type * as mutations_sessions_complete from "../mutations/sessions/complete.js";
import type * as mutations_sessions_pause from "../mutations/sessions/pause.js";
import type * as mutations_sessions_resume from "../mutations/sessions/resume.js";
import type * as mutations_sessions_start from "../mutations/sessions/start.js";
import type * as mutations_settings_update from "../mutations/settings/update.js";
import type * as mutations_studyCategories_archive from "../mutations/studyCategories/archive.js";
import type * as mutations_studyCategories_create from "../mutations/studyCategories/create.js";
import type * as mutations_studyCategories_move from "../mutations/studyCategories/move.js";
import type * as mutations_studyCategories_remove from "../mutations/studyCategories/remove.js";
import type * as mutations_studyCategories_rename from "../mutations/studyCategories/rename.js";
import type * as mutations_studyCategories_restore from "../mutations/studyCategories/restore.js";
import type * as mutations_users_applyEmailChange from "../mutations/users/applyEmailChange.js";
import type * as mutations_users_generateAvatarUploadUrl from "../mutations/users/generateAvatarUploadUrl.js";
import type * as mutations_users_setAvatar from "../mutations/users/setAvatar.js";
import type * as mutations_users_updateDisplayName from "../mutations/users/updateDisplayName.js";
import type * as queries_blocks_todayWithSuggestions from "../queries/blocks/todayWithSuggestions.js";
import type * as queries_blocks_upcoming from "../queries/blocks/upcoming.js";
import type * as queries_dashboard_dog from "../queries/dashboard/dog.js";
import type * as queries_dashboard_fasting from "../queries/dashboard/fasting.js";
import type * as queries_dashboard_health from "../queries/dashboard/health.js";
import type * as queries_dashboard_live from "../queries/dashboard/live.js";
import type * as queries_dashboard_presence from "../queries/dashboard/presence.js";
import type * as queries_dashboard_selfPresence from "../queries/dashboard/selfPresence.js";
import type * as queries_dashboard_study from "../queries/dashboard/study.js";
import type * as queries_dashboard_viewer from "../queries/dashboard/viewer.js";
import type * as queries_dog_history from "../queries/dog/history.js";
import type * as queries_dogTasks_list from "../queries/dogTasks/list.js";
import type * as queries_dogs_get from "../queries/dogs/get.js";
import type * as queries_fasting_history from "../queries/fasting/history.js";
import type * as queries_health_lastSync from "../queries/health/lastSync.js";
import type * as queries_health_range from "../queries/health/range.js";
import type * as queries_health_workoutList from "../queries/health/workoutList.js";
import type * as queries_health_workouts from "../queries/health/workouts.js";
import type * as queries_insights_correlations from "../queries/insights/correlations.js";
import type * as queries_sessions_history from "../queries/sessions/history.js";
import type * as queries_settings_get from "../queries/settings/get.js";
import type * as queries_studyCategories_list from "../queries/studyCategories/list.js";
import type * as queries_users_getEmailForCaller from "../queries/users/getEmailForCaller.js";
import type * as queries_users_viewer from "../queries/users/viewer.js";
import type * as services_appSettings_getFastingDefaultMinutes from "../services/appSettings/getFastingDefaultMinutes.js";
import type * as services_blocks_declare from "../services/blocks/declare.js";
import type * as services_blocks_decline from "../services/blocks/decline.js";
import type * as services_blocks_erode from "../services/blocks/erode.js";
import type * as services_blocks_remove from "../services/blocks/remove.js";
import type * as services_blocks_reschedule from "../services/blocks/reschedule.js";
import type * as services_blocks_suggestRescheduleSlots from "../services/blocks/suggestRescheduleSlots.js";
import type * as services_blocks_todayWithSuggestions from "../services/blocks/todayWithSuggestions.js";
import type * as services_blocks_undoDecline from "../services/blocks/undoDecline.js";
import type * as services_blocks_upcoming from "../services/blocks/upcoming.js";
import type * as services_blocks_update from "../services/blocks/update.js";
import type * as services_dashboard_dog from "../services/dashboard/dog.js";
import type * as services_dashboard_fasting from "../services/dashboard/fasting.js";
import type * as services_dashboard_health from "../services/dashboard/health.js";
import type * as services_dashboard_live from "../services/dashboard/live.js";
import type * as services_dashboard_presence from "../services/dashboard/presence.js";
import type * as services_dashboard_selfPresence from "../services/dashboard/selfPresence.js";
import type * as services_dashboard_study from "../services/dashboard/study.js";
import type * as services_dashboard_viewer from "../services/dashboard/viewer.js";
import type * as services_demo_nextDemoMetric from "../services/demo/nextDemoMetric.js";
import type * as services_demo_seedMetrics from "../services/demo/seedMetrics.js";
import type * as services_demo_setDemoMode from "../services/demo/setDemoMode.js";
import type * as services_demo_tick from "../services/demo/tick.js";
import type * as services_dog_history from "../services/dog/history.js";
import type * as services_dog_logEvent from "../services/dog/logEvent.js";
import type * as services_dog_undoEvent from "../services/dog/undoEvent.js";
import type * as services_dogTasks_archive from "../services/dogTasks/archive.js";
import type * as services_dogTasks_create from "../services/dogTasks/create.js";
import type * as services_dogTasks_list from "../services/dogTasks/list.js";
import type * as services_dogTasks_move from "../services/dogTasks/move.js";
import type * as services_dogTasks_rename from "../services/dogTasks/rename.js";
import type * as services_dogs_get from "../services/dogs/get.js";
import type * as services_dogs_setImage from "../services/dogs/setImage.js";
import type * as services_dogs_update from "../services/dogs/update.js";
import type * as services_fasting_advancePhase from "../services/fasting/advancePhase.js";
import type * as services_fasting_end from "../services/fasting/end.js";
import type * as services_fasting_history from "../services/fasting/history.js";
import type * as services_fasting_phaseSchedule from "../services/fasting/phaseSchedule.js";
import type * as services_fasting_start from "../services/fasting/start.js";
import type * as services_garmin_mapDailyMetrics from "../services/garmin/mapDailyMetrics.js";
import type * as services_health_deleteWorkout from "../services/health/deleteWorkout.js";
import type * as services_health_deriveDateJst from "../services/health/deriveDateJst.js";
import type * as services_health_lastSync from "../services/health/lastSync.js";
import type * as services_health_logWorkout from "../services/health/logWorkout.js";
import type * as services_health_mergeByDate from "../services/health/mergeByDate.js";
import type * as services_health_range from "../services/health/range.js";
import type * as services_health_recordSyncFailure from "../services/health/recordSyncFailure.js";
import type * as services_health_requestGarminSync from "../services/health/requestGarminSync.js";
import type * as services_health_updateWorkout from "../services/health/updateWorkout.js";
import type * as services_health_upsertFromSync from "../services/health/upsertFromSync.js";
import type * as services_health_upsertManual from "../services/health/upsertManual.js";
import type * as services_health_validateWorkoutAt from "../services/health/validateWorkoutAt.js";
import type * as services_health_workoutList from "../services/health/workoutList.js";
import type * as services_health_workouts from "../services/health/workouts.js";
import type * as services_insights_correlations from "../services/insights/correlations.js";
import type * as services_insights_pearson from "../services/insights/pearson.js";
import type * as services_partnerStatus_setStatus from "../services/partnerStatus/setStatus.js";
import type * as services_sessions_autoAbandon from "../services/sessions/autoAbandon.js";
import type * as services_sessions_complete from "../services/sessions/complete.js";
import type * as services_sessions_history from "../services/sessions/history.js";
import type * as services_sessions_pause from "../services/sessions/pause.js";
import type * as services_sessions_resolveCurrentSession from "../services/sessions/resolveCurrentSession.js";
import type * as services_sessions_resume from "../services/sessions/resume.js";
import type * as services_sessions_start from "../services/sessions/start.js";
import type * as services_settings_get from "../services/settings/get.js";
import type * as services_settings_update from "../services/settings/update.js";
import type * as services_studyCategories_archive from "../services/studyCategories/archive.js";
import type * as services_studyCategories_create from "../services/studyCategories/create.js";
import type * as services_studyCategories_list from "../services/studyCategories/list.js";
import type * as services_studyCategories_move from "../services/studyCategories/move.js";
import type * as services_studyCategories_remove from "../services/studyCategories/remove.js";
import type * as services_studyCategories_rename from "../services/studyCategories/rename.js";
import type * as services_studyCategories_restore from "../services/studyCategories/restore.js";
import type * as services_studyCategories_validate from "../services/studyCategories/validate.js";
import type * as services_users_applyEmailChange from "../services/users/applyEmailChange.js";
import type * as services_users_ensureUser from "../services/users/ensureUser.js";
import type * as services_users_getEmailForCaller from "../services/users/getEmailForCaller.js";
import type * as services_users_setAvatar from "../services/users/setAvatar.js";
import type * as services_users_updateDisplayName from "../services/users/updateDisplayName.js";
import type * as services_users_updateEmail from "../services/users/updateEmail.js";
import type * as services_users_updatePassword from "../services/users/updatePassword.js";
import type * as services_users_viewer from "../services/users/viewer.js";
import type * as test_fixtures from "../test/fixtures.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/garmin/client": typeof actions_garmin_client;
  "actions/garmin/syncDaily": typeof actions_garmin_syncDaily;
  "actions/users/updateEmail": typeof actions_users_updateEmail;
  "actions/users/updatePassword": typeof actions_users_updatePassword;
  auth: typeof auth;
  crons: typeof crons;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/dateRange": typeof lib_dateRange;
  "lib/demoConstants": typeof lib_demoConstants;
  "lib/domain": typeof lib_domain;
  "lib/hm": typeof lib_hm;
  "lib/passwordRequirements": typeof lib_passwordRequirements;
  "lib/validators": typeof lib_validators;
  "mutations/blocks/declare": typeof mutations_blocks_declare;
  "mutations/blocks/decline": typeof mutations_blocks_decline;
  "mutations/blocks/erode": typeof mutations_blocks_erode;
  "mutations/blocks/remove": typeof mutations_blocks_remove;
  "mutations/blocks/reschedule": typeof mutations_blocks_reschedule;
  "mutations/blocks/undoDecline": typeof mutations_blocks_undoDecline;
  "mutations/blocks/update": typeof mutations_blocks_update;
  "mutations/demo/setDemoMode": typeof mutations_demo_setDemoMode;
  "mutations/demo/tick": typeof mutations_demo_tick;
  "mutations/dog/logEvent": typeof mutations_dog_logEvent;
  "mutations/dog/undoEvent": typeof mutations_dog_undoEvent;
  "mutations/dogTasks/archive": typeof mutations_dogTasks_archive;
  "mutations/dogTasks/create": typeof mutations_dogTasks_create;
  "mutations/dogTasks/move": typeof mutations_dogTasks_move;
  "mutations/dogTasks/rename": typeof mutations_dogTasks_rename;
  "mutations/dogTasks/seed": typeof mutations_dogTasks_seed;
  "mutations/dogs/generateImageUploadUrl": typeof mutations_dogs_generateImageUploadUrl;
  "mutations/dogs/setImage": typeof mutations_dogs_setImage;
  "mutations/dogs/update": typeof mutations_dogs_update;
  "mutations/fasting/advancePhase": typeof mutations_fasting_advancePhase;
  "mutations/fasting/end": typeof mutations_fasting_end;
  "mutations/fasting/start": typeof mutations_fasting_start;
  "mutations/health/deleteWorkout": typeof mutations_health_deleteWorkout;
  "mutations/health/logWorkout": typeof mutations_health_logWorkout;
  "mutations/health/recordSyncFailure": typeof mutations_health_recordSyncFailure;
  "mutations/health/requestGarminSync": typeof mutations_health_requestGarminSync;
  "mutations/health/updateWorkout": typeof mutations_health_updateWorkout;
  "mutations/health/upsertFromSync": typeof mutations_health_upsertFromSync;
  "mutations/health/upsertManual": typeof mutations_health_upsertManual;
  "mutations/partnerStatus/setStatus": typeof mutations_partnerStatus_setStatus;
  "mutations/sessions/autoAbandon": typeof mutations_sessions_autoAbandon;
  "mutations/sessions/complete": typeof mutations_sessions_complete;
  "mutations/sessions/pause": typeof mutations_sessions_pause;
  "mutations/sessions/resume": typeof mutations_sessions_resume;
  "mutations/sessions/start": typeof mutations_sessions_start;
  "mutations/settings/update": typeof mutations_settings_update;
  "mutations/studyCategories/archive": typeof mutations_studyCategories_archive;
  "mutations/studyCategories/create": typeof mutations_studyCategories_create;
  "mutations/studyCategories/move": typeof mutations_studyCategories_move;
  "mutations/studyCategories/remove": typeof mutations_studyCategories_remove;
  "mutations/studyCategories/rename": typeof mutations_studyCategories_rename;
  "mutations/studyCategories/restore": typeof mutations_studyCategories_restore;
  "mutations/users/applyEmailChange": typeof mutations_users_applyEmailChange;
  "mutations/users/generateAvatarUploadUrl": typeof mutations_users_generateAvatarUploadUrl;
  "mutations/users/setAvatar": typeof mutations_users_setAvatar;
  "mutations/users/updateDisplayName": typeof mutations_users_updateDisplayName;
  "queries/blocks/todayWithSuggestions": typeof queries_blocks_todayWithSuggestions;
  "queries/blocks/upcoming": typeof queries_blocks_upcoming;
  "queries/dashboard/dog": typeof queries_dashboard_dog;
  "queries/dashboard/fasting": typeof queries_dashboard_fasting;
  "queries/dashboard/health": typeof queries_dashboard_health;
  "queries/dashboard/live": typeof queries_dashboard_live;
  "queries/dashboard/presence": typeof queries_dashboard_presence;
  "queries/dashboard/selfPresence": typeof queries_dashboard_selfPresence;
  "queries/dashboard/study": typeof queries_dashboard_study;
  "queries/dashboard/viewer": typeof queries_dashboard_viewer;
  "queries/dog/history": typeof queries_dog_history;
  "queries/dogTasks/list": typeof queries_dogTasks_list;
  "queries/dogs/get": typeof queries_dogs_get;
  "queries/fasting/history": typeof queries_fasting_history;
  "queries/health/lastSync": typeof queries_health_lastSync;
  "queries/health/range": typeof queries_health_range;
  "queries/health/workoutList": typeof queries_health_workoutList;
  "queries/health/workouts": typeof queries_health_workouts;
  "queries/insights/correlations": typeof queries_insights_correlations;
  "queries/sessions/history": typeof queries_sessions_history;
  "queries/settings/get": typeof queries_settings_get;
  "queries/studyCategories/list": typeof queries_studyCategories_list;
  "queries/users/getEmailForCaller": typeof queries_users_getEmailForCaller;
  "queries/users/viewer": typeof queries_users_viewer;
  "services/appSettings/getFastingDefaultMinutes": typeof services_appSettings_getFastingDefaultMinutes;
  "services/blocks/declare": typeof services_blocks_declare;
  "services/blocks/decline": typeof services_blocks_decline;
  "services/blocks/erode": typeof services_blocks_erode;
  "services/blocks/remove": typeof services_blocks_remove;
  "services/blocks/reschedule": typeof services_blocks_reschedule;
  "services/blocks/suggestRescheduleSlots": typeof services_blocks_suggestRescheduleSlots;
  "services/blocks/todayWithSuggestions": typeof services_blocks_todayWithSuggestions;
  "services/blocks/undoDecline": typeof services_blocks_undoDecline;
  "services/blocks/upcoming": typeof services_blocks_upcoming;
  "services/blocks/update": typeof services_blocks_update;
  "services/dashboard/dog": typeof services_dashboard_dog;
  "services/dashboard/fasting": typeof services_dashboard_fasting;
  "services/dashboard/health": typeof services_dashboard_health;
  "services/dashboard/live": typeof services_dashboard_live;
  "services/dashboard/presence": typeof services_dashboard_presence;
  "services/dashboard/selfPresence": typeof services_dashboard_selfPresence;
  "services/dashboard/study": typeof services_dashboard_study;
  "services/dashboard/viewer": typeof services_dashboard_viewer;
  "services/demo/nextDemoMetric": typeof services_demo_nextDemoMetric;
  "services/demo/seedMetrics": typeof services_demo_seedMetrics;
  "services/demo/setDemoMode": typeof services_demo_setDemoMode;
  "services/demo/tick": typeof services_demo_tick;
  "services/dog/history": typeof services_dog_history;
  "services/dog/logEvent": typeof services_dog_logEvent;
  "services/dog/undoEvent": typeof services_dog_undoEvent;
  "services/dogTasks/archive": typeof services_dogTasks_archive;
  "services/dogTasks/create": typeof services_dogTasks_create;
  "services/dogTasks/list": typeof services_dogTasks_list;
  "services/dogTasks/move": typeof services_dogTasks_move;
  "services/dogTasks/rename": typeof services_dogTasks_rename;
  "services/dogs/get": typeof services_dogs_get;
  "services/dogs/setImage": typeof services_dogs_setImage;
  "services/dogs/update": typeof services_dogs_update;
  "services/fasting/advancePhase": typeof services_fasting_advancePhase;
  "services/fasting/end": typeof services_fasting_end;
  "services/fasting/history": typeof services_fasting_history;
  "services/fasting/phaseSchedule": typeof services_fasting_phaseSchedule;
  "services/fasting/start": typeof services_fasting_start;
  "services/garmin/mapDailyMetrics": typeof services_garmin_mapDailyMetrics;
  "services/health/deleteWorkout": typeof services_health_deleteWorkout;
  "services/health/deriveDateJst": typeof services_health_deriveDateJst;
  "services/health/lastSync": typeof services_health_lastSync;
  "services/health/logWorkout": typeof services_health_logWorkout;
  "services/health/mergeByDate": typeof services_health_mergeByDate;
  "services/health/range": typeof services_health_range;
  "services/health/recordSyncFailure": typeof services_health_recordSyncFailure;
  "services/health/requestGarminSync": typeof services_health_requestGarminSync;
  "services/health/updateWorkout": typeof services_health_updateWorkout;
  "services/health/upsertFromSync": typeof services_health_upsertFromSync;
  "services/health/upsertManual": typeof services_health_upsertManual;
  "services/health/validateWorkoutAt": typeof services_health_validateWorkoutAt;
  "services/health/workoutList": typeof services_health_workoutList;
  "services/health/workouts": typeof services_health_workouts;
  "services/insights/correlations": typeof services_insights_correlations;
  "services/insights/pearson": typeof services_insights_pearson;
  "services/partnerStatus/setStatus": typeof services_partnerStatus_setStatus;
  "services/sessions/autoAbandon": typeof services_sessions_autoAbandon;
  "services/sessions/complete": typeof services_sessions_complete;
  "services/sessions/history": typeof services_sessions_history;
  "services/sessions/pause": typeof services_sessions_pause;
  "services/sessions/resolveCurrentSession": typeof services_sessions_resolveCurrentSession;
  "services/sessions/resume": typeof services_sessions_resume;
  "services/sessions/start": typeof services_sessions_start;
  "services/settings/get": typeof services_settings_get;
  "services/settings/update": typeof services_settings_update;
  "services/studyCategories/archive": typeof services_studyCategories_archive;
  "services/studyCategories/create": typeof services_studyCategories_create;
  "services/studyCategories/list": typeof services_studyCategories_list;
  "services/studyCategories/move": typeof services_studyCategories_move;
  "services/studyCategories/remove": typeof services_studyCategories_remove;
  "services/studyCategories/rename": typeof services_studyCategories_rename;
  "services/studyCategories/restore": typeof services_studyCategories_restore;
  "services/studyCategories/validate": typeof services_studyCategories_validate;
  "services/users/applyEmailChange": typeof services_users_applyEmailChange;
  "services/users/ensureUser": typeof services_users_ensureUser;
  "services/users/getEmailForCaller": typeof services_users_getEmailForCaller;
  "services/users/setAvatar": typeof services_users_setAvatar;
  "services/users/updateDisplayName": typeof services_users_updateDisplayName;
  "services/users/updateEmail": typeof services_users_updateEmail;
  "services/users/updatePassword": typeof services_users_updatePassword;
  "services/users/viewer": typeof services_users_viewer;
  "test/fixtures": typeof test_fixtures;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
