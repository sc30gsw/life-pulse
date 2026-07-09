import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { expect, test, vi } from "vite-plus/test";

import { useDeclareBlock } from "~/features/study/hooks/use-declare-block";
import { useErodeBlock } from "~/features/study/hooks/use-erode-block";
import { useRemoveBlock } from "~/features/study/hooks/use-remove-block";
import { useRescheduleBlock } from "~/features/study/hooks/use-reschedule-block";
import { useStartSession } from "~/features/study/hooks/use-start-session";
import { useUpdateBlock } from "~/features/study/hooks/use-update-block";

vi.mock("@convex-dev/react-query", () => ({
  useConvexMutation: vi.fn((fn) => ({ convexFn: fn })),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn((options) => ({ options })),
}));

test("wraps study mutations with TanStack mutation objects", () => {
  vi.mocked(useConvexMutation).mockClear();
  vi.mocked(useMutation).mockClear();

  const hooks = [
    useDeclareBlock(),
    useErodeBlock(),
    useRemoveBlock(),
    useRescheduleBlock(),
    useStartSession(),
    useUpdateBlock(),
  ];

  expect(hooks).toHaveLength(6);
  expect(useConvexMutation).toHaveBeenCalledTimes(6);
  expect(useMutation).toHaveBeenCalledTimes(6);
  for (const hook of hooks) {
    expect(hook).toEqual({
      options: { mutationFn: expect.any(Function) },
    });
  }
});
