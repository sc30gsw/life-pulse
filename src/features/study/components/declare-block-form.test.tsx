// @vitest-environment happy-dom
import { notifications } from "@mantine/notifications";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { DeclareBlockForm } from "~/features/study/components/declare-block-form";
import { renderWithMantine } from "~/test-utils";

const mutationState = vi.hoisted(() => ({
  declareMutate: vi.fn(),
  updateMutate: vi.fn(),
}));

const datePickerState = vi.hoisted(() => ({
  props: null as null | {
    getDayAriaLabel: (date: string) => string;
    getDayProps: (date: string) => Record<string, unknown>;
    onChange: (value: [string | null, string | null]) => void;
    renderDay: (date: string) => React.ReactNode;
    value: [string | null, string | null];
  },
}));

vi.mock("~/features/study/hooks/use-declare-block", () => ({
  useDeclareBlock: () => ({ mutate: mutationState.declareMutate }),
}));

vi.mock("~/features/study/hooks/use-update-block", () => ({
  useUpdateBlock: () => ({ mutate: mutationState.updateMutate }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("@mantine/dates", () => ({
  DateTimePicker: ({
    getDayAriaLabel,
    getDayProps,
    onChange,
    renderDay,
    value,
  }: {
    getDayAriaLabel: (date: string) => string;
    getDayProps: (date: string) => Record<string, unknown>;
    onChange: (value: [string | null, string | null]) => void;
    renderDay: (date: string) => React.ReactNode;
    value: [string | null, string | null];
  }) => {
    datePickerState.props = { getDayAriaLabel, getDayProps, onChange, renderDay, value };

    return (
      <button
        type="button"
        onClick={() => onChange(["2099-01-01 06:00:00", "2099-01-01 07:30:00"])}
      >
        {value[0] ?? "日時を選択"}
      </button>
    );
  },
}));

function buildBlock(
  overrides: Partial<Doc<"studyBlocks">> = {},
): Pick<Doc<"studyBlocks">, "_id" | "category" | "dateJst" | "endHm" | "startHm"> {
  return {
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    category: "reading",
    dateJst: "2099-01-02",
    endHm: "08:00",
    startHm: "07:00",
    ...overrides,
  };
}

test("declares a block from the selected date time range", async () => {
  mutationState.declareMutate.mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<DeclareBlockForm />);

  await user.click(getByRole("button", { name: "読書" }));
  await user.click(getByRole("button", { name: "日時を選択" }));
  await user.click(getByRole("button", { name: "枠を宣言する" }));

  expect(mutationState.declareMutate).toHaveBeenCalledWith(
    {
      category: "reading",
      dateJst: "2099-01-01",
      endHm: "07:30",
      startHm: "06:00",
    },
    expect.any(Object),
  );
});

test("passes holiday metadata to the date time picker", () => {
  renderWithMantine(<DeclareBlockForm />);

  expect(datePickerState.props?.getDayAriaLabel("2026-01-01")).toBe("2026-01-01 元日");
  expect(datePickerState.props?.getDayAriaLabel("2026-01-06")).toBe("2026-01-06");
  expect(datePickerState.props?.getDayProps("2026-01-01")).toMatchObject({ title: "元日" });
  expect(datePickerState.props?.getDayProps("2026-01-06")).toEqual({});

  const { getByText } = renderWithMantine(<>{datePickerState.props?.renderDay("2026-01-01")}</>);
  expect(getByText("元日")).toBeDefined();
});

test("updates an existing block with the block id", async () => {
  mutationState.updateMutate.mockClear();
  const onDone = vi.fn();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(
    <DeclareBlockForm block={buildBlock()} onDone={onDone} />,
  );

  await user.click(getByRole("button", { name: "2099-01-02 07:00:00" }));
  await user.click(getByRole("button", { name: "予定を更新する" }));

  expect(mutationState.updateMutate).toHaveBeenCalledWith(
    {
      blockId: "block_1",
      category: "reading",
      dateJst: "2099-01-01",
      endHm: "07:30",
      startHm: "06:00",
    },
    expect.any(Object),
  );

  const options = mutationState.updateMutate.mock.calls[0]?.[1] as { onSuccess: () => void };
  options.onSuccess();
  expect(onDone).toHaveBeenCalled();
});

test("shows an error notification when declaration fails", async () => {
  mutationState.declareMutate.mockClear();
  vi.mocked(notifications.show).mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<DeclareBlockForm />);

  await user.click(getByRole("button", { name: "日時を選択" }));
  await user.click(getByRole("button", { name: "枠を宣言する" }));

  const options = mutationState.declareMutate.mock.calls[0]?.[1] as { onError: () => void };
  options.onError();
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ message: "枠の宣言に失敗しました" }),
  );
});
