import { PresenceCard, PresenceCardFallback } from "~/features/dashboard/components/presence-card";
import { useDashboardPresence } from "~/features/dashboard/hooks/use-dashboard-presence";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";

const TITLE = "パートナー · 妻";

export function PartnerCard() {
  const { onSetPresence, partner, partnerFlash, partnerUpdatedRelativeLabel } =
    useDashboardPresence();
  const viewer = useDashboardViewer();

  return (
    <PresenceCard
      editable={viewer.role === "partner"}
      flash={partnerFlash}
      onSetPresence={onSetPresence}
      presence={partner}
      title={TITLE}
      updatedRelativeLabel={partnerUpdatedRelativeLabel}
    />
  );
}

export function PartnerCardFallback() {
  return <PresenceCardFallback title={TITLE} />;
}
