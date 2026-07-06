import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { PendingComponent } from "~/components/layouts/pending";
import { UserMenu, UserMenuFallback } from "~/features/auth/components/user-menu";
import { dashboardLiveQuery } from "~/features/dashboard/api/dashboard-live-query";
import { BoardHeader } from "~/features/dashboard/components/board-header";
import { BoardToast } from "~/features/dashboard/components/board-toast";
import { DogCard } from "~/features/dashboard/components/dog-card";
import { HealthMetricsGrid } from "~/features/dashboard/components/health-metrics-grid";
import { LiveStrip } from "~/features/dashboard/components/live-strip";
import { PartnerCard } from "~/features/dashboard/components/partner-card";
import { SessionFastingCard } from "~/features/dashboard/components/session-fasting-card";
import { useLiveBoard } from "~/features/dashboard/hooks/use-live-board";
import { todayJst } from "~/utils/date-jst";

export const Route = createFileRoute("/_authenticated/")({
  component: () => (
    <Suspense fallback={<PendingComponent />}>
      <Home />
    </Suspense>
  ),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(dashboardLiveQuery(todayJst())),
});

function Home() {
  const board = useLiveBoard();

  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <BoardHeader
        clockDateLabel={board.clockDateLabel}
        clockTime={board.clockTime}
        onToggleTheme={board.onToggleTheme}
        theme={board.theme}
        userMenuSlot={
          <Suspense fallback={<UserMenuFallback />}>
            <UserMenu />
          </Suspense>
        }
      />
      <LiveStrip lastSyncRelativeLabel={board.lastSyncRelativeLabel} />
      <main className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <section className="flex min-w-0 flex-col gap-4 lg:flex-3">
          <SessionFastingCard
            declarationActualMinutes={board.declarationActualMinutes}
            declarationActualPercent={board.declarationActualPercent}
            declarationTotalMinutes={board.declarationTotalMinutes}
            declarations={board.declarations}
            fasting={board.fasting}
            fastingElapsedLabel={board.fastingElapsedLabel}
            fastingFlash={board.fastingFlash}
            fastingRemainLabel={board.fastingRemainLabel}
            fastingRingPercent={board.fastingRingPercent}
            isSelfView={board.isSelfView}
            onCompleteSession={() => {}}
            onPauseSession={() => {}}
            onResumeSession={() => {}}
            onStartSession={() => {}}
            session={board.session}
            sessionElapsedLabel={board.sessionElapsedLabel}
            sessionFlash={board.sessionFlash}
            sessionGoalLabel={board.sessionGoalLabel}
            sessionProgressPercent={board.sessionProgressPercent}
          />
          <HealthMetricsGrid metrics={board.metrics} />
        </section>
        <section className="flex min-w-0 flex-col gap-4 lg:flex-2">
          <PartnerCard
            isPartnerView={board.isPartnerView}
            onSetPresence={board.onSetPresence}
            partner={board.partner}
            partnerFlash={board.partnerFlash}
            partnerUpdatedRelativeLabel={board.partnerUpdatedRelativeLabel}
          />
          <DogCard
            dogCare={board.dogCare}
            dogFlash={board.dogFlash}
            dogName={board.dogName}
            onToggle={board.onToggleDogCare}
          />
        </section>
      </main>
      <BoardToast toasts={board.toasts} />
    </div>
  );
}
