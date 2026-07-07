import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { PendingComponent } from "~/components/layouts/pending";
import { BoardHeader } from "~/features/dashboard/components/board-header";
import { DogCard, DogCardFallback } from "~/features/dashboard/components/dog-card";
import {
  HealthMetricsGrid,
  HealthMetricsGridFallback,
} from "~/features/dashboard/components/health-metrics-grid";
import { LiveStrip } from "~/features/dashboard/components/live-strip";
import { PartnerCard, PartnerCardFallback } from "~/features/dashboard/components/partner-card";
import {
  SelfStatusCard,
  SelfStatusCardFallback,
} from "~/features/dashboard/components/self-status-card";
import {
  SessionFastingCard,
  SessionFastingCardFallback,
} from "~/features/dashboard/components/session-fasting-card";

export const Route = createFileRoute("/_authenticated/")({
  component: () => (
    <Suspense fallback={<PendingComponent />}>
      <Home />
    </Suspense>
  ),
});

function Home() {
  return (
    <div className="min-h-dvh px-4 py-5 pb-16 sm:px-8 sm:py-6">
      <BoardHeader />
      <LiveStrip />
      <main className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <section className="flex min-w-0 flex-col gap-4 lg:flex-3">
          <Suspense fallback={<SessionFastingCardFallback />}>
            <SessionFastingCard sessionFlash={false} />
          </Suspense>
          <Suspense fallback={<HealthMetricsGridFallback />}>
            <HealthMetricsGrid />
          </Suspense>
        </section>
        <section className="flex min-w-0 flex-col gap-4 lg:flex-2">
          <Suspense fallback={<SelfStatusCardFallback />}>
            <SelfStatusCard />
          </Suspense>
          <Suspense fallback={<PartnerCardFallback />}>
            <PartnerCard />
          </Suspense>
          <Suspense fallback={<DogCardFallback />}>
            <DogCard />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
