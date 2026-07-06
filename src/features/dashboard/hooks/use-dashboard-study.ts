import { useSuspenseQuery } from "@tanstack/react-query";

import { dashboardStudyQuery } from "~/features/dashboard/api/dashboard-study-query";
import { useBoardClock } from "~/features/dashboard/hooks/use-board-clock";
import {
  deriveSessionElapsedMs,
  formatElapsedClock,
  toDeclarationItems,
} from "~/features/dashboard/utils/format";

const MINUTE_MS = 60_000;

export function useDashboardStudy() {
  const { dateJst, nowMs } = useBoardClock();
  const study = useSuspenseQuery(dashboardStudyQuery(dateJst)).data;
  const declarations = toDeclarationItems(study.blocks);
  const sessionElapsedMs = deriveSessionElapsedMs(study.session, nowMs);
  const goalMinutes = study.session?.plannedMinutes ?? 0;
  const declarationTotalMinutes = declarations.reduce((sum, item) => sum + item.plannedMinutes, 0);
  const inProgressMinutes =
    study.session !== null &&
    (study.session.status === "active" || study.session.status === "paused")
      ? Math.round(sessionElapsedMs / MINUTE_MS)
      : 0;
  const declarationActualMinutes = study.todayActualMinutes + inProgressMinutes;

  return {
    declarationActualMinutes,
    declarationActualPercent:
      declarationTotalMinutes > 0
        ? Math.min(100, Math.round((declarationActualMinutes / declarationTotalMinutes) * 100))
        : 0,
    declarationTotalMinutes,
    declarations,
    session: study.session,
    sessionElapsedMs,
    sessionElapsedLabel: formatElapsedClock(sessionElapsedMs),
    sessionGoalLabel: `${goalMinutes}分`,
    sessionProgressPercent:
      goalMinutes > 0
        ? Math.min(100, Math.round((sessionElapsedMs / MINUTE_MS / goalMinutes) * 100))
        : 0,
  } as const;
}
