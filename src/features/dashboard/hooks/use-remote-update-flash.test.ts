// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { useRemoteUpdateFlash } from "~/features/dashboard/hooks/use-remote-update-flash";

afterEach(() => {
  vi.useRealTimers();
});

test("does not flash on the initial fingerprint", () => {
  vi.useFakeTimers();
  const element = document.createElement("div");
  const { result } = renderHook(({ fingerprint }) => useRemoteUpdateFlash(fingerprint), {
    initialProps: { fingerprint: "initial" },
  });

  act(() => {
    result.current.flashRef(element);
  });

  expect(element.classList.contains("lp-flash")).toBe(false);
});

test("adds and removes the flash class when the fingerprint changes", () => {
  vi.useFakeTimers();
  const element = document.createElement("div");
  const { rerender, result } = renderHook(({ fingerprint }) => useRemoteUpdateFlash(fingerprint), {
    initialProps: { fingerprint: "initial" },
  });

  act(() => {
    result.current.flashRef(element);
  });

  rerender({ fingerprint: "remote-update" });

  expect(element.classList.contains("lp-flash")).toBe(true);

  act(() => {
    vi.advanceTimersByTime(950);
  });

  expect(element.classList.contains("lp-flash")).toBe(false);
});

test("suppresses the next fingerprint change for a local mutation", () => {
  vi.useFakeTimers();
  const element = document.createElement("div");
  const { rerender, result } = renderHook(({ fingerprint }) => useRemoteUpdateFlash(fingerprint), {
    initialProps: { fingerprint: "initial" },
  });

  act(() => {
    result.current.flashRef(element);
  });

  act(() => {
    result.current.suppressNextFlash();
  });

  rerender({ fingerprint: "local-update" });

  expect(element.classList.contains("lp-flash")).toBe(false);

  rerender({ fingerprint: "remote-update" });

  expect(element.classList.contains("lp-flash")).toBe(true);
});

test("releasing suppression lets the next change flash", () => {
  vi.useFakeTimers();
  const element = document.createElement("div");
  const { rerender, result } = renderHook(({ fingerprint }) => useRemoteUpdateFlash(fingerprint), {
    initialProps: { fingerprint: "initial" },
  });

  act(() => {
    result.current.flashRef(element);
  });

  const releaseSuppression = result.current.suppressNextFlash();

  act(() => {
    releaseSuppression();
  });
  rerender({ fingerprint: "remote-update" });

  expect(element.classList.contains("lp-flash")).toBe(true);
});
