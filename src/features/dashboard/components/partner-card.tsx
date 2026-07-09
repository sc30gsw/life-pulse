import { PresenceCard, PresenceCardFallback } from "~/features/dashboard/components/presence-card";
import { useDashboardPresence } from "~/features/dashboard/hooks/use-dashboard-presence";
import { useDashboardViewer } from "~/features/dashboard/hooks/use-dashboard-viewer";

const FALLBACK_TITLE = "パートナー";

export function PartnerCard() {
  const { onSetPresence, partner, partnerFlashRef, partnerUpdatedRelativeLabel } =
    useDashboardPresence();
  const viewer = useDashboardViewer();
  const title = viewer.role === "partner" ? "本人" : "パートナー";

  return (
    <PresenceCard
      editable={viewer.role === "partner"}
      flashRef={partnerFlashRef}
      onSetPresence={onSetPresence}
      presence={partner}
      title={title}
      updatedRelativeLabel={partnerUpdatedRelativeLabel}
    />
  );
}

export function PartnerCardFallback() {
  return <PresenceCardFallback title={FALLBACK_TITLE} />;
}
