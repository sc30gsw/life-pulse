// @vitest-environment happy-dom
import { notifications } from "@mantine/notifications";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { DeclareBlockForm } from "~/features/study/components/declare-block-form";
import { renderWithMantine } from "~/test-utils";

const READING_CATEGORY_ID = "category_reading" as Id<"studyCategories">;

const mutationState = vi.hoisted(() => ({
  declareMutate: vi.fn(),
  updateMutate: vi.fn(),
}));

const datePickerState = vi.hoisted(() => ({
  props: [] as {
    classNames?: Record<string, unknown>;
    getDayAriaLabel: (date: string) => string;
    getDayProps: (date: string) => Record<string, unknown>;
    label: string;
    onChange: (value: string | null) => void;
    popoverProps?: Record<string, unknown>;
    renderDay: (date: string) => React.ReactNode;
    styles?: Record<string, unknown>;
    timePickerProps?: {
      format?: string;
      popoverProps?: { withinPortal?: boolean };
      styles?: Record<string, unknown>;
      withDropdown?: boolean;
    };
    value: string | null;
    weekendDays?: number[];
  }[],
}));

vi.mock("~/features/study/hooks/use-declare-block", () => ({
  useDeclareBlock: () => ({ mutate: mutationState.declareMutate }),
}));

vi.mock("~/features/study/hooks/use-update-block", () => ({
  useUpdateBlock: () => ({ mutate: mutationState.updateMutate }),
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => {
    const categories = [
      {
        _creationTime: 0,
        _id: READING_CATEGORY_ID,
        archivedAt: undefined,
        name: "読書",
        sortOrder: 0,
        userId: "user_1" as Id<"appUsers">,
      },
    ] as Doc<"studyCategories">[];

    return {
      activeCategories: categories,
      categories,
      categoriesById: new Map(categories.map((category) => [category._id, category])),
      categoryName: (categoryId: Id<"studyCategories"> | undefined) =>
        categories.find((category) => category._id === categoryId)?.name ?? "カテゴリ未設定",
      categoryOptions: () => categories,
    };
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("@mantine/dates", () => ({
  DateTimePicker: ({
    classNames,
    getDayAriaLabel,
    getDayProps,
    label,
    onChange,
    popoverProps,
    renderDay,
    styles,
    timePickerProps,
    value,
    weekendDays,
  }: {
    classNames?: Record<string, unknown>;
    getDayAriaLabel: (date: string) => string;
    getDayProps: (date: string) => Record<string, unknown>;
    label: string;
    onChange: (value: string | null) => void;
    popoverProps?: Record<string, unknown>;
    renderDay: (date: string) => React.ReactNode;
    styles?: Record<string, unknown>;
    timePickerProps?: {
      format?: string;
      popoverProps?: { withinPortal?: boolean };
      styles?: Record<string, unknown>;
      withDropdown?: boolean;
    };
    value: string | null;
    weekendDays?: number[];
  }) => {
    datePickerState.props.push({
      classNames,
      getDayAriaLabel,
      getDayProps,
      label,
      onChange,
      popoverProps,
      renderDay,
      styles,
      timePickerProps,
      value,
      weekendDays,
    });

    return (
      <button
        type="button"
        onClick={() =>
          onChange(label === "開始日時" ? "2099-01-01 06:00:00" : "2099-01-01 07:30:00")
        }
      >
        {value ?? label}
      </button>
    );
  },
}));

function buildBlock(
  overrides: Partial<Doc<"studyBlocks">> = {},
): Pick<Doc<"studyBlocks">, "_id" | "categoryId" | "dateJst" | "endHm" | "startHm"> {
  return {
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    categoryId: READING_CATEGORY_ID,
    dateJst: "2099-01-02",
    endHm: "08:00",
    startHm: "07:00",
    ...overrides,
  };
}

test("declares a block from the selected date time range", async () => {
  mutationState.declareMutate.mockClear();
  datePickerState.props = [];
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<DeclareBlockForm />);

  await user.click(getByRole("button", { name: "読書" }));
  await user.click(getByRole("button", { name: "開始日時" }));
  await user.click(getByRole("button", { name: "終了日時" }));
  await user.click(getByRole("button", { name: "枠を宣言する" }));

  expect(mutationState.declareMutate).toHaveBeenCalledWith(
    {
      categoryId: READING_CATEGORY_ID,
      dateJst: "2099-01-01",
      endHm: "07:30",
      startHm: "06:00",
    },
    expect.any(Object),
  );
});

test("passes holiday metadata to the date time picker", () => {
  datePickerState.props = [];
  renderWithMantine(<DeclareBlockForm />);
  const startPicker = datePickerState.props.find((props) => props.label === "開始日時");

  expect(startPicker?.getDayAriaLabel("2026-01-01")).toBe("2026-01-01 元日");
  expect(startPicker?.getDayAriaLabel("2026-01-06")).toBe("2026-01-06");
  expect(startPicker?.getDayProps("2026-01-01")).toMatchObject({ title: "元日" });
  expect(startPicker?.getDayProps("2026-01-06")).toMatchObject({ style: { color: "var(--tx)" } });
  expect(startPicker?.getDayProps("2026-07-11")).toMatchObject({
    style: { color: "var(--blue)" },
  });
  expect(startPicker?.classNames).toMatchObject({
    monthsListControl: "lp-dtp-months-list-control",
    submitButton: "lp-dtp-submit",
    timeInput: "lp-dtp-time-input",
    yearsListControl: "lp-dtp-years-list-control",
  });
  expect(startPicker?.weekendDays).toEqual([0]);
  expect(startPicker?.styles).toMatchObject({
    calendarHeaderLevel: { color: "var(--tx)" },
    input: {
      backgroundColor: "var(--inset)",
      borderColor: "var(--bd2)",
      color: "var(--tx)",
    },
    monthsListControl: { color: "var(--tx)" },
    placeholder: { color: "color-mix(in oklab, var(--tx) 72%, var(--dim))" },
    timeInput: { color: "var(--tx)" },
    weekday: { color: "var(--faint)" },
    yearsListControl: { color: "var(--tx)" },
  });
  expect(startPicker?.popoverProps).toMatchObject({
    styles: {
      dropdown: {
        backgroundColor: "var(--panel)",
        borderColor: "var(--bd2)",
        color: "var(--tx)",
      },
    },
  });
  expect(startPicker?.timePickerProps).toMatchObject({
    classNames: {
      control: "lp-dtp-time-control",
      dropdown: "lp-dtp-time-dropdown",
      field: "lp-dtp-time-field",
      fieldsGroup: "lp-dtp-time-fields-group",
      fieldsRoot: "lp-dtp-time-fields-root",
    },
    popoverProps: { withinPortal: false },
    styles: {
      control: { color: "var(--tx)" },
      dropdown: {
        backgroundColor: "var(--panel)",
        borderColor: "var(--bd2)",
        color: "var(--tx)",
      },
      field: { color: "var(--bg)" },
      fieldsGroup: { color: "var(--bg)" },
      fieldsRoot: { color: "var(--bg)" },
    },
    withDropdown: true,
  });
  expect(startPicker?.timePickerProps).not.toHaveProperty("format");

  const { getByText } = renderWithMantine(<>{startPicker?.renderDay("2026-01-01")}</>);
  expect(getByText("元日")).toBeDefined();
});

test("updates an existing block with the block id", async () => {
  mutationState.updateMutate.mockClear();
  datePickerState.props = [];
  const onDone = vi.fn();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(
    <DeclareBlockForm block={buildBlock()} onDone={onDone} />,
  );

  await user.click(getByRole("button", { name: "2099-01-02 07:00:00" }));
  await user.click(getByRole("button", { name: "2099-01-02 08:00:00" }));
  await user.click(getByRole("button", { name: "予定を更新する" }));

  expect(mutationState.updateMutate).toHaveBeenCalledWith(
    {
      blockId: "block_1",
      categoryId: READING_CATEGORY_ID,
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
  datePickerState.props = [];
  vi.mocked(notifications.show).mockClear();
  const user = userEvent.setup();

  const { getByRole } = renderWithMantine(<DeclareBlockForm />);

  await user.click(getByRole("button", { name: "開始日時" }));
  await user.click(getByRole("button", { name: "終了日時" }));
  await user.click(getByRole("button", { name: "枠を宣言する" }));

  const options = mutationState.declareMutate.mock.calls[0]?.[1] as { onError: () => void };
  options.onError();
  expect(notifications.show).toHaveBeenCalledWith(
    expect.objectContaining({ message: "枠の宣言に失敗しました" }),
  );
});
