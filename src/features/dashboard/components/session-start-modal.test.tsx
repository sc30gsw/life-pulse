// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { SessionStartModal } from "~/features/dashboard/components/session-start-modal";
import { renderWithMantine } from "~/test-utils";

const categoryState = vi.hoisted(() => ({
  eikaiwaCategoryId: "category_eikaiwa" as Id<"studyCategories">,
  readingCategoryId: "category_reading" as Id<"studyCategories">,
  toeicCategoryId: "category_toeic" as Id<"studyCategories">,
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => {
    const categories = [
      {
        _creationTime: 0,
        _id: categoryState.toeicCategoryId,
        archivedAt: undefined,
        name: "TOEIC",
        sortOrder: 0,
        userId: "user_1" as Id<"appUsers">,
      },
      {
        _creationTime: 0,
        _id: categoryState.eikaiwaCategoryId,
        archivedAt: undefined,
        name: "英会話",
        sortOrder: 1,
        userId: "user_1" as Id<"appUsers">,
      },
      {
        _creationTime: 0,
        _id: categoryState.readingCategoryId,
        archivedAt: undefined,
        name: "読書",
        sortOrder: 2,
        userId: "user_1" as Id<"appUsers">,
      },
    ] as Doc<"studyCategories">[];

    return { activeCategories: categories };
  },
}));

test("renders nothing visible when closed", () => {
  const { queryByText } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={vi.fn()} opened={false} />,
  );

  expect(queryByText("セッション開始")).toBeNull();
});

test("submits the default category and planned minutes when opened", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith(categoryState.toeicCategoryId, 60);
});

test("submits the category selected via the category pills", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.click(getByRole("button", { name: "英会話" }));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith(categoryState.eikaiwaCategoryId, 60);
});

test("marks only the selected category pill as pressed", async () => {
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={vi.fn()} opened />,
  );

  expect(getByRole("button", { name: "TOEIC" }).getAttribute("aria-pressed")).toBe("true");

  await user.click(getByRole("button", { name: "読書" }));

  expect(getByRole("button", { name: "読書" }).getAttribute("aria-pressed")).toBe("true");
  expect(getByRole("button", { name: "TOEIC" }).getAttribute("aria-pressed")).toBe("false");
});

test("submits undefined planned minutes when the field is cleared", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.clear(getByLabelText("目標分数(任意)"));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith(categoryState.toeicCategoryId, undefined);
});

test("submits a custom planned minutes value", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.clear(getByLabelText("目標分数(任意)"));
  await user.type(getByLabelText("目標分数(任意)"), "90");
  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith(categoryState.toeicCategoryId, 90);
});

test("calls onClose when the modal is dismissed via escape", async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  renderWithMantine(<SessionStartModal onClose={onClose} onStart={vi.fn()} opened />);

  await user.keyboard("{Escape}");

  expect(onClose).toHaveBeenCalled();
});
