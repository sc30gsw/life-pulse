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
import type * as lib_validators from "../lib/validators.js";
import type * as mutations_dog_logEvent from "../mutations/dog/logEvent.js";
import type * as mutations_dog_undoEvent from "../mutations/dog/undoEvent.js";
import type * as mutations_partnerStatus_setStatus from "../mutations/partnerStatus/setStatus.js";
import type * as queries_dashboard_dog from "../queries/dashboard/dog.js";
import type * as queries_dashboard_fasting from "../queries/dashboard/fasting.js";
import type * as queries_dashboard_health from "../queries/dashboard/health.js";
import type * as queries_dashboard_live from "../queries/dashboard/live.js";
import type * as queries_dashboard_presence from "../queries/dashboard/presence.js";
import type * as queries_dashboard_study from "../queries/dashboard/study.js";
import type * as queries_dashboard_viewer from "../queries/dashboard/viewer.js";
import type * as queries_users_viewer from "../queries/users/viewer.js";
import type * as services_dashboard_dog from "../services/dashboard/dog.js";
import type * as services_dashboard_fasting from "../services/dashboard/fasting.js";
import type * as services_dashboard_health from "../services/dashboard/health.js";
import type * as services_dashboard_live from "../services/dashboard/live.js";
import type * as services_dashboard_presence from "../services/dashboard/presence.js";
import type * as services_dashboard_study from "../services/dashboard/study.js";
import type * as services_dashboard_viewer from "../services/dashboard/viewer.js";
import type * as services_dog_logEvent from "../services/dog/logEvent.js";
import type * as services_dog_undoEvent from "../services/dog/undoEvent.js";
import type * as services_partnerStatus_setStatus from "../services/partnerStatus/setStatus.js";
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
  "lib/validators": typeof lib_validators;
  "mutations/dog/logEvent": typeof mutations_dog_logEvent;
  "mutations/dog/undoEvent": typeof mutations_dog_undoEvent;
  "mutations/partnerStatus/setStatus": typeof mutations_partnerStatus_setStatus;
  "queries/dashboard/dog": typeof queries_dashboard_dog;
  "queries/dashboard/fasting": typeof queries_dashboard_fasting;
  "queries/dashboard/health": typeof queries_dashboard_health;
  "queries/dashboard/live": typeof queries_dashboard_live;
  "queries/dashboard/presence": typeof queries_dashboard_presence;
  "queries/dashboard/study": typeof queries_dashboard_study;
  "queries/dashboard/viewer": typeof queries_dashboard_viewer;
  "queries/users/viewer": typeof queries_users_viewer;
  "services/dashboard/dog": typeof services_dashboard_dog;
  "services/dashboard/fasting": typeof services_dashboard_fasting;
  "services/dashboard/health": typeof services_dashboard_health;
  "services/dashboard/live": typeof services_dashboard_live;
  "services/dashboard/presence": typeof services_dashboard_presence;
  "services/dashboard/study": typeof services_dashboard_study;
  "services/dashboard/viewer": typeof services_dashboard_viewer;
  "services/dog/logEvent": typeof services_dog_logEvent;
  "services/dog/undoEvent": typeof services_dog_undoEvent;
  "services/partnerStatus/setStatus": typeof services_partnerStatus_setStatus;
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
