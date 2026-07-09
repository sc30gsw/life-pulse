// @vitest-environment happy-dom
import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";

const { useConvexMutationMock, useMutationMock } = vi.hoisted(() => ({
  useConvexMutationMock: vi.fn(() => vi.fn()),
  useMutationMock: vi.fn((opts: unknown) => opts),
}));

vi.mock("@convex-dev/react-query", () => ({
  useConvexMutation: useConvexMutationMock,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
}));

const { useUndoDogEvent } = await import("~/features/dashboard/hooks/use-undo-dog-event");
const { api } = await import("~/../convex/_generated/api");

function useHookUnderTest() {
  return useUndoDogEvent();
}

test("wires useConvexMutation(api.mutations.dog.undoEvent.undoEvent) into useMutation", () => {
  renderHook(useHookUnderTest);

  expect(useConvexMutationMock).toHaveBeenCalledWith(api.mutations.dog.undoEvent.undoEvent);
  expect(useMutationMock).toHaveBeenCalledWith({ mutationFn: expect.any(Function) });
});
