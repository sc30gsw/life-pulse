import { getFunctionName } from "convex/server";
import { expect, test } from "vite-plus/test";

import { api } from "~/../convex/_generated/api";
import {
  dashboardDogQuery,
  dashboardFastingQuery,
  dashboardHealthQuery,
  dashboardLiveQuery,
  dashboardPresenceQuery,
  dashboardStudyQuery,
  dashboardViewerQuery,
} from "~/features/dashboard/api/dashboard-live-query";

test("dashboardLiveQuery targets api.queries.dashboard.live.live with dateJst", () => {
  expect(dashboardLiveQuery("2026-07-07")).toEqual({
    queryKey: [
      "convexQuery",
      getFunctionName(api.queries.dashboard.live.live),
      { dateJst: "2026-07-07" },
    ],
    staleTime: Infinity,
  });
});

test("dashboardViewerQuery targets api.queries.dashboard.viewer.viewer with no args", () => {
  expect(dashboardViewerQuery()).toEqual({
    queryKey: ["convexQuery", getFunctionName(api.queries.dashboard.viewer.viewer), {}],
    staleTime: Infinity,
  });
});

test("dashboardStudyQuery targets api.queries.dashboard.study.study with dateJst", () => {
  expect(dashboardStudyQuery("2026-07-07")).toEqual({
    queryKey: [
      "convexQuery",
      getFunctionName(api.queries.dashboard.study.study),
      { dateJst: "2026-07-07" },
    ],
    staleTime: Infinity,
  });
});

test("dashboardFastingQuery targets api.queries.dashboard.fasting.fasting with no args", () => {
  expect(dashboardFastingQuery()).toEqual({
    queryKey: ["convexQuery", getFunctionName(api.queries.dashboard.fasting.fasting), {}],
    staleTime: Infinity,
  });
});

test("dashboardHealthQuery targets api.queries.dashboard.health.health with dateJst", () => {
  expect(dashboardHealthQuery("2026-07-07")).toEqual({
    queryKey: [
      "convexQuery",
      getFunctionName(api.queries.dashboard.health.health),
      { dateJst: "2026-07-07" },
    ],
    staleTime: Infinity,
  });
});

test("dashboardDogQuery targets api.queries.dashboard.dog.dog with dateJst", () => {
  expect(dashboardDogQuery("2026-07-07")).toEqual({
    queryKey: [
      "convexQuery",
      getFunctionName(api.queries.dashboard.dog.dog),
      { dateJst: "2026-07-07" },
    ],
    staleTime: Infinity,
  });
});

test("dashboardPresenceQuery targets api.queries.dashboard.presence.presence with no args", () => {
  expect(dashboardPresenceQuery()).toEqual({
    queryKey: ["convexQuery", getFunctionName(api.queries.dashboard.presence.presence), {}],
    staleTime: Infinity,
  });
});
