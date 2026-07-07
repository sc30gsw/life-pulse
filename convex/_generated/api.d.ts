/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dateRange from "../lib/dateRange.js";
import type * as lib_hm from "../lib/hm.js";
import type * as lib_validators from "../lib/validators.js";
import type * as mutations_blocks_declare from "../mutations/blocks/declare.js";
import type * as mutations_blocks_erode from "../mutations/blocks/erode.js";
import type * as mutations_blocks_reschedule from "../mutations/blocks/reschedule.js";
import type * as mutations_dog_logEvent from "../mutations/dog/logEvent.js";
import type * as mutations_dog_undoEvent from "../mutations/dog/undoEvent.js";
import type * as mutations_partnerStatus_setStatus from "../mutations/partnerStatus/setStatus.js";
import type * as mutations_sessions_autoAbandon from "../mutations/sessions/autoAbandon.js";
import type * as mutations_sessions_complete from "../mutations/sessions/complete.js";
import type * as mutations_sessions_pause from "../mutations/sessions/pause.js";
import type * as mutations_sessions_resume from "../mutations/sessions/resume.js";
import type * as mutations_sessions_start from "../mutations/sessions/start.js";
import type * as queries_blocks_todayWithSuggestions from "../queries/blocks/todayWithSuggestions.js";
import type * as queries_dashboard_dog from "../queries/dashboard/dog.js";
import type * as queries_dashboard_fasting from "../queries/dashboard/fasting.js";
import type * as queries_dashboard_health from "../queries/dashboard/health.js";
import type * as queries_dashboard_live from "../queries/dashboard/live.js";
import type * as queries_dashboard_presence from "../queries/dashboard/presence.js";
import type * as queries_dashboard_study from "../queries/dashboard/study.js";
import type * as queries_dashboard_viewer from "../queries/dashboard/viewer.js";
import type * as queries_dog_history from "../queries/dog/history.js";
import type * as queries_sessions_history from "../queries/sessions/history.js";
import type * as queries_users_viewer from "../queries/users/viewer.js";
import type * as services_blocks_declare from "../services/blocks/declare.js";
import type * as services_blocks_erode from "../services/blocks/erode.js";
import type * as services_blocks_reschedule from "../services/blocks/reschedule.js";
import type * as services_blocks_suggestRescheduleSlots from "../services/blocks/suggestRescheduleSlots.js";
import type * as services_blocks_todayWithSuggestions from "../services/blocks/todayWithSuggestions.js";
import type * as services_dashboard_dog from "../services/dashboard/dog.js";
import type * as services_dashboard_fasting from "../services/dashboard/fasting.js";
import type * as services_dashboard_health from "../services/dashboard/health.js";
import type * as services_dashboard_live from "../services/dashboard/live.js";
import type * as services_dashboard_presence from "../services/dashboard/presence.js";
import type * as services_dashboard_study from "../services/dashboard/study.js";
import type * as services_dashboard_viewer from "../services/dashboard/viewer.js";
import type * as services_dog_history from "../services/dog/history.js";
import type * as services_dog_logEvent from "../services/dog/logEvent.js";
import type * as services_dog_undoEvent from "../services/dog/undoEvent.js";
import type * as services_partnerStatus_setStatus from "../services/partnerStatus/setStatus.js";
import type * as services_sessions_autoAbandon from "../services/sessions/autoAbandon.js";
import type * as services_sessions_complete from "../services/sessions/complete.js";
import type * as services_sessions_history from "../services/sessions/history.js";
import type * as services_sessions_pause from "../services/sessions/pause.js";
import type * as services_sessions_resolveCurrentSession from "../services/sessions/resolveCurrentSession.js";
import type * as services_sessions_resume from "../services/sessions/resume.js";
import type * as services_sessions_start from "../services/sessions/start.js";
import type * as services_users_ensureUser from "../services/users/ensureUser.js";
import type * as services_users_viewer from "../services/users/viewer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/dateRange": typeof lib_dateRange;
  "lib/hm": typeof lib_hm;
  "lib/validators": typeof lib_validators;
  "mutations/blocks/declare": typeof mutations_blocks_declare;
  "mutations/blocks/erode": typeof mutations_blocks_erode;
  "mutations/blocks/reschedule": typeof mutations_blocks_reschedule;
  "mutations/dog/logEvent": typeof mutations_dog_logEvent;
  "mutations/dog/undoEvent": typeof mutations_dog_undoEvent;
  "mutations/partnerStatus/setStatus": typeof mutations_partnerStatus_setStatus;
  "mutations/sessions/autoAbandon": typeof mutations_sessions_autoAbandon;
  "mutations/sessions/complete": typeof mutations_sessions_complete;
  "mutations/sessions/pause": typeof mutations_sessions_pause;
  "mutations/sessions/resume": typeof mutations_sessions_resume;
  "mutations/sessions/start": typeof mutations_sessions_start;
  "queries/blocks/todayWithSuggestions": typeof queries_blocks_todayWithSuggestions;
  "queries/dashboard/dog": typeof queries_dashboard_dog;
  "queries/dashboard/fasting": typeof queries_dashboard_fasting;
  "queries/dashboard/health": typeof queries_dashboard_health;
  "queries/dashboard/live": typeof queries_dashboard_live;
  "queries/dashboard/presence": typeof queries_dashboard_presence;
  "queries/dashboard/study": typeof queries_dashboard_study;
  "queries/dashboard/viewer": typeof queries_dashboard_viewer;
  "queries/dog/history": typeof queries_dog_history;
  "queries/sessions/history": typeof queries_sessions_history;
  "queries/users/viewer": typeof queries_users_viewer;
  "services/blocks/declare": typeof services_blocks_declare;
  "services/blocks/erode": typeof services_blocks_erode;
  "services/blocks/reschedule": typeof services_blocks_reschedule;
  "services/blocks/suggestRescheduleSlots": typeof services_blocks_suggestRescheduleSlots;
  "services/blocks/todayWithSuggestions": typeof services_blocks_todayWithSuggestions;
  "services/dashboard/dog": typeof services_dashboard_dog;
  "services/dashboard/fasting": typeof services_dashboard_fasting;
  "services/dashboard/health": typeof services_dashboard_health;
  "services/dashboard/live": typeof services_dashboard_live;
  "services/dashboard/presence": typeof services_dashboard_presence;
  "services/dashboard/study": typeof services_dashboard_study;
  "services/dashboard/viewer": typeof services_dashboard_viewer;
  "services/dog/history": typeof services_dog_history;
  "services/dog/logEvent": typeof services_dog_logEvent;
  "services/dog/undoEvent": typeof services_dog_undoEvent;
  "services/partnerStatus/setStatus": typeof services_partnerStatus_setStatus;
  "services/sessions/autoAbandon": typeof services_sessions_autoAbandon;
  "services/sessions/complete": typeof services_sessions_complete;
  "services/sessions/history": typeof services_sessions_history;
  "services/sessions/pause": typeof services_sessions_pause;
  "services/sessions/resolveCurrentSession": typeof services_sessions_resolveCurrentSession;
  "services/sessions/resume": typeof services_sessions_resume;
  "services/sessions/start": typeof services_sessions_start;
  "services/users/ensureUser": typeof services_users_ensureUser;
  "services/users/viewer": typeof services_users_viewer;
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
