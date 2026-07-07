import { PresenceCard, PresenceCardFallback } from "~/features/dashboard/components/presence-card";
import { useDashboardSelfPresence } from "~/features/dashboard/hooks/use-dashboard-self-presence";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";

const FALLBACK_TITLE = "本人";

export function SelfStatusCard() {
  const { onSetPresence, self, selfFlash, selfUpdatedRelativeLabel } = useDashboardSelfPresence();
  const viewer = useDashboardViewer();
  const title = viewer.role === "self" ? "本人" : "パートナー";

  return (
    <PresenceCard
      editable={viewer.role === "self"}
      flash={selfFlash}
      onSetPresence={onSetPresence}
      presence={self}
      title={title}
      updatedRelativeLabel={selfUpdatedRelativeLabel}
    />
  );
}

export function SelfStatusCardFallback() {
  return <PresenceCardFallback title={FALLBACK_TITLE} />;
}
