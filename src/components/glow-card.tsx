import { Paper, type PaperProps } from "@mantine/core";
import { cn } from "cnfast";
import type { ReactNode, Ref } from "react";

import { useCursorGlow } from "~/hooks/use-cursor-glow";

type GlowCardProps = PaperProps & { children: ReactNode; ref?: Ref<HTMLDivElement> };

export function GlowCard({ children, className, ref, ...paperProps }: GlowCardProps) {
  const { glowRef, onPointerEnter, onPointerLeave, onPointerMove } =
    useCursorGlow<HTMLDivElement>();

  function setRefs(element: HTMLDivElement | null) {
    glowRef.current = element;

    if (typeof ref === "function") {
      ref(element);

      return;
    }

    if (ref != null) {
      ref.current = element;
    }
  }

  return (
    <Paper
      ref={setRefs}
      className={cn("lp-glow-card", className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      {...paperProps}
    >
      <span aria-hidden className="lp-glow-streak" />
      <span aria-hidden className="lp-glow-spot" />
      <span aria-hidden className="lp-glow-border" />
      <div className="relative z-10">{children}</div>
    </Paper>
  );
}
