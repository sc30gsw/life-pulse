import { createFileRoute } from "@tanstack/react-router";

import { UserMenu } from "~/features/auth/components/user-menu";
import { BoardHeader } from "~/features/dashboard/components/board-header";
import { BoardToast } from "~/features/dashboard/components/board-toast";
import { DogCard } from "~/features/dashboard/components/dog-card";
import { HealthMetricsGrid } from "~/features/dashboard/components/health-metrics-grid";
import { LiveStrip } from "~/features/dashboard/components/live-strip";
import { PartnerCard } from "~/features/dashboard/components/partner-card";
import { SessionFastingCard } from "~/features/dashboard/components/session-fasting-card";
import { useDemoBoard } from "~/features/dashboard/hooks/use-demo-board";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const board = useDemoBoard();

  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <BoardHeader
        clockDateLabel={board.clockDateLabel}
        clockTime={board.clockTime}
        isDemoRunning={board.isDemoRunning}
        onSetPerspective={board.onSetPerspective}
        onToggleDemo={board.onToggleDemo}
        onToggleTheme={board.onToggleTheme}
        perspective={board.perspective}
        theme={board.theme}
        userMenuSlot={<UserMenu />}
      />
      <LiveStrip lastSyncRelativeLabel={board.lastSyncRelativeLabel} />
      <main className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <section className="flex min-w-0 flex-col gap-4 lg:flex-[3]">
          <SessionFastingCard
            declarationActualMinutes={board.declarationActualMinutes}
            declarationActualPercent={board.declarationActualPercent}
            declarationTotalMinutes={board.declarationTotalMinutes}
            declarations={board.fixture.declarations}
            fasting={board.fasting}
            fastingElapsedLabel={board.fastingElapsedLabel}
            fastingFlash={board.fastingFlash}
            fastingRemainLabel={board.fastingRemainLabel}
            fastingRingPercent={board.fastingRingPercent}
            isSelfView={board.perspective === "self"}
            onCompleteSession={board.onCompleteSession}
            onPauseSession={board.onPauseSession}
            onResumeSession={board.onResumeSession}
            onStartSession={board.onStartSession}
            session={board.fixture.session}
            sessionElapsedLabel={board.sessionElapsedLabel}
            sessionFlash={board.sessionFlash}
            sessionGoalLabel={board.sessionGoalLabel}
            sessionProgressPercent={board.sessionProgressPercent}
          />
          <HealthMetricsGrid metrics={board.fixture.metrics} />
        </section>
        <section className="flex min-w-0 flex-col gap-4 lg:flex-[2]">
          <PartnerCard
            isPartnerView={board.perspective === "partner"}
            onSetPresence={board.onSetPartnerPresence}
            partner={board.fixture.partner}
            partnerFlash={board.partnerFlash}
            partnerUpdatedRelativeLabel={board.partnerUpdatedRelativeLabel}
          />
          <DogCard
            dogCare={board.fixture.dogCare}
            dogFlash={board.dogFlash}
            dogName={board.fixture.dogName}
            onToggle={board.onToggleDogCare}
          />
        </section>
      </main>
      <BoardToast toasts={board.toasts} />
    </div>
  );
}
