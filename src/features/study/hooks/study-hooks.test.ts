import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useSessionHistory } from "~/features/study/hooks/use-session-history";
import { useStudyBlocks } from "~/features/study/hooks/use-study-blocks";
import { useUpcomingBlocks } from "~/features/study/hooks/use-upcoming-blocks";

const hookState = vi.hoisted(() => ({
  erodeMutate: vi.fn(),
  removeMutate: vi.fn(),
  rescheduleMutate: vi.fn(),
  startMutate: vi.fn(),
}));

vi.mock("@mantine/modals", () => ({
  modals: { openConfirmModal: vi.fn() },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("@tanstack/react-query", () => ({
  useSuspenseQuery: vi.fn(),
}));

vi.mock("~/features/study/hooks/use-study-clock", () => ({
  useStudyClock: () => ({ dateJst: "2099-01-01", nowHm: "06:00" }),
}));

vi.mock("~/features/study/hooks/use-erode-block", () => ({
  useErodeBlock: () => ({ mutate: hookState.erodeMutate }),
}));

vi.mock("~/features/study/hooks/use-remove-block", () => ({
  useRemoveBlock: () => ({ mutate: hookState.removeMutate }),
}));

vi.mock("~/features/study/hooks/use-reschedule-block", () => ({
  useRescheduleBlock: () => ({ mutate: hookState.rescheduleMutate }),
}));

vi.mock("~/features/study/hooks/use-start-session", () => ({
  useStartSession: () => ({ mutate: hookState.startMutate }),
}));

function buildBlock(overrides: Partial<Doc<"studyBlocks">> = {}): Doc<"studyBlocks"> {
  return {
    _creationTime: 1,
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    category: "toeic",
    dateJst: "2099-01-01",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    userId: "user_1" as Doc<"studyBlocks">["userId"],
    ...overrides,
  };
}

test("returns session history query data", () => {
  vi.mocked(useSuspenseQuery).mockReturnValueOnce({ data: [{ dateJst: "2099-01-01" }] } as never);

  expect(useSessionHistory()).toEqual([{ dateJst: "2099-01-01" }]);
});

test("study block actions call mutations and surface outcomes", () => {
  vi.mocked(useSuspenseQuery).mockReturnValueOnce({
    data: { blocks: [buildBlock()], suggestions: ["08:00"] },
  } as never);
  hookState.erodeMutate.mockClear();
  hookState.rescheduleMutate.mockClear();
  hookState.startMutate.mockClear();
  vi.mocked(notifications.show).mockClear();

  const result = useStudyBlocks();

  result.onErode("block_1" as Doc<"studyBlocks">["_id"], "work");
  const erodeOptions = hookState.erodeMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
  erodeOptions.onSuccess();
  expect(hookState.erodeMutate).toHaveBeenCalledWith(
    { blockId: "block_1", reason: "work" },
    expect.any(Object),
  );

  result.onReschedule(buildBlock(), "08:00");
  expect(hookState.rescheduleMutate).toHaveBeenCalledWith(
    { blockId: "block_1", endHm: "09:00", startHm: "08:00" },
    expect.any(Object),
  );

  result.onReschedule(buildBlock(), "bad");
  expect(hookState.rescheduleMutate).toHaveBeenCalledTimes(1);

  result.onStartFromBlock(buildBlock({ category: "unknown" }));
  const startOptions = hookState.startMutate.mock.calls[0]?.[1] as {
    onError: (error: unknown) => void;
  };
  startOptions.onError(new ConvexError("SESSION_EXISTS"));
  expect(hookState.startMutate).toHaveBeenCalledWith(
    { blockId: "block_1", category: "other", dateJst: "2099-01-01", plannedMinutes: 60 },
    expect.any(Object),
  );
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ message: "進行中のセッションがあります" }),
  );
});

test("upcoming cancellation opens a confirm modal and deletes on confirm", () => {
  vi.mocked(useSuspenseQuery).mockReturnValueOnce({ data: [buildBlock()] } as never);
  hookState.removeMutate.mockClear();
  vi.mocked(modals.openConfirmModal).mockClear();
  vi.mocked(notifications.show).mockClear();

  const result = useUpcomingBlocks();
  result.onCancel(buildBlock());

  const modalOptions = vi.mocked(modals.openConfirmModal).mock.calls[0]?.[0] as {
    onConfirm: () => void;
  };
  modalOptions.onConfirm();
  const removeOptions = hookState.removeMutate.mock.calls[0]?.[1] as {
    onError: () => void;
    onSuccess: () => void;
  };
  removeOptions.onSuccess();
  removeOptions.onError();

  expect(hookState.removeMutate).toHaveBeenCalledWith({ blockId: "block_1" }, expect.any(Object));
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ message: "予定枠をキャンセルしました" }),
  );
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ message: "予定枠のキャンセルに失敗しました" }),
  );
});
