import { useEffect, useRef } from "react";

const FLASH_DURATION_MS = 950;

export function useRemoteUpdateFlash(fingerprint: string) {
  const elementRef = useRef<HTMLElement | null>(null);
  const previousFingerprintRef = useRef<string | null>(null);
  const suppressNextCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flashRef(element: HTMLElement | null) {
    elementRef.current = element;
  }

  function suppressNextFlash() {
    suppressNextCountRef.current += 1;

    let released = false;

    return () => {
      if (released) {
        return;
      }

      suppressNextCountRef.current = Math.max(0, suppressNextCountRef.current - 1);
      released = true;
    };
  }

  useEffect(() => {
    if (previousFingerprintRef.current === null) {
      previousFingerprintRef.current = fingerprint;

      return;
    }

    if (previousFingerprintRef.current === fingerprint) {
      return;
    }

    previousFingerprintRef.current = fingerprint;

    if (suppressNextCountRef.current > 0) {
      suppressNextCountRef.current -= 1;

      return;
    }

    const element = elementRef.current;

    if (element === null) {
      return;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    element.classList.remove("lp-flash");
    element.getBoundingClientRect();
    element.classList.add("lp-flash");

    timeoutRef.current = setTimeout(() => {
      element.classList.remove("lp-flash");
      timeoutRef.current = null;
    }, FLASH_DURATION_MS);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      element.classList.remove("lp-flash");
    };
  }, [fingerprint]);

  return { flashRef, suppressNextFlash } as const;
}
