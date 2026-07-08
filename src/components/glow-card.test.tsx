// @vitest-environment happy-dom
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vite-plus/test";

import { GlowCard } from "~/components/glow-card";
import { renderWithMantine } from "~/test-utils";

test("renders its children", () => {
  const { getByText } = renderWithMantine(<GlowCard>hello</GlowCard>);

  expect(getByText("hello")).toBeDefined();
});

test("passes its root element through ref", () => {
  const cardRef = createRef<HTMLDivElement>();
  const { container } = renderWithMantine(<GlowCard ref={cardRef}>hello</GlowCard>);
  const card = container.querySelector(".lp-glow-card");

  expect(cardRef.current).toBe(card);
});

test("lights up the cursor-follow glow on pointer enter/leave and tracks the pointer on move", async () => {
  const user = userEvent.setup();
  const { container } = renderWithMantine(<GlowCard>hello</GlowCard>);
  // MantineProvider injects a <style> element as the container's first child,
  // so query the card by its glow class rather than assuming firstChild.
  const card = container.querySelector(".lp-glow-card") as HTMLElement;

  expect(card.style.getPropertyValue("--gop")).toBe("");

  await user.hover(card);
  expect(card.style.getPropertyValue("--gop")).toBe("1");

  fireEvent.pointerMove(card, { clientX: 42, clientY: 17 });
  expect(card.style.getPropertyValue("--mx")).toBe("42px");
  expect(card.style.getPropertyValue("--my")).toBe("17px");

  await user.unhover(card);
  expect(card.style.getPropertyValue("--gop")).toBe("0");
});

test("disconnects the ResizeObserver on unmount", () => {
  const disconnectSpy = vi.spyOn(ResizeObserver.prototype, "disconnect");
  const { unmount } = renderWithMantine(<GlowCard>hello</GlowCard>);

  unmount();

  expect(disconnectSpy).toHaveBeenCalled();
});
