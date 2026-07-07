import { PresenceCard, PresenceCardFallback } from "~/features/dashboard/components/presence-card";
import { useDashboardSelfPresence } from "~/features/dashboard/hooks/use-dashboard-self-presence";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";

const TITLE = "本人 · 自分";

export function SelfStatusCard() {
  const { onSetPresence, self, selfFlash, selfUpdatedRelativeLabel } = useDashboardSelfPresence();
  const viewer = useDashboardViewer();

  return (
    <PresenceCard
      editable={viewer.role === "self"}
      flash={selfFlash}
      onSetPresence={onSetPresence}
      presence={self}
      title={TITLE}
      updatedRelativeLabel={selfUpdatedRelativeLabel}
    />
  );
}

export function SelfStatusCardFallback() {
  return <PresenceCardFallback title={TITLE} />;
}
