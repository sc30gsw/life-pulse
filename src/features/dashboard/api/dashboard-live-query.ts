import { convexQuery } from "@convex-dev/react-query";
import type { FunctionArgs } from "convex/server";

import { api } from "~/../convex/_generated/api";

type LiveQueryArgs = FunctionArgs<typeof api.queries.dashboard.live.live>;
type DogQueryArgs = FunctionArgs<typeof api.queries.dashboard.dog.dog>;
type HealthQueryArgs = FunctionArgs<typeof api.queries.dashboard.health.health>;
type StudyQueryArgs = FunctionArgs<typeof api.queries.dashboard.study.study>;

export function dashboardLiveQuery(dateJst: LiveQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.live.live, { dateJst });
}

export function dashboardViewerQuery() {
  return convexQuery(api.queries.dashboard.viewer.viewer, {});
}

export function dashboardStudyQuery(dateJst: StudyQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.study.study, { dateJst });
}

export function dashboardFastingQuery() {
  return convexQuery(api.queries.dashboard.fasting.fasting, {});
}

export function dashboardHealthQuery(dateJst: HealthQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.health.health, { dateJst });
}

export function dashboardDogQuery(dateJst: DogQueryArgs["dateJst"]) {
  return convexQuery(api.queries.dashboard.dog.dog, { dateJst });
}

export function dashboardPresenceQuery() {
  return convexQuery(api.queries.dashboard.presence.presence, {});
}
