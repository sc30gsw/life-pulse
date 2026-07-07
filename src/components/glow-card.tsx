import { Paper, type PaperProps } from "@mantine/core";
import { cn } from "cnfast";
import type { ReactNode } from "react";

import { useCursorGlow } from "~/hooks/use-cursor-glow";

type GlowCardProps = PaperProps & Record<"children", ReactNode>;

export function GlowCard({ children, className, ...paperProps }: GlowCardProps) {
  const { glowRef, onPointerEnter, onPointerLeave, onPointerMove } =
    useCursorGlow<HTMLDivElement>();

  return (
    <Paper
      ref={glowRef}
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
