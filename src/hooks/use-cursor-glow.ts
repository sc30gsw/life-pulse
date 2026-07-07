import { useEffect, useRef } from "react";

// Cursor-tracking glow (GlowCard, see src/components/glow-card.tsx). Caches the
// element's rect via ResizeObserver instead of recomputing getBoundingClientRect
// on every pointermove — see docs/design/live-board.md.
export function useCursorGlow<T extends HTMLElement>() {
  const glowRef = useRef<T>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = glowRef.current;

    if (el === null) {
      return;
    }

    rectRef.current = el.getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      rectRef.current = el.getBoundingClientRect();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  function onPointerMove(event: React.PointerEvent<T>) {
    const rect = rectRef.current;

    if (rect === null) {
      return;
    }

    glowRef.current?.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    glowRef.current?.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function onPointerEnter() {
    glowRef.current?.style.setProperty("--gop", "1");
  }

  function onPointerLeave() {
    glowRef.current?.style.setProperty("--gop", "0");
  }

  return { glowRef, onPointerEnter, onPointerLeave, onPointerMove } as const;
}
