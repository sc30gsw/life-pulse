// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Id } from "~/../convex/_generated/dataModel";
import { DeclarationCard } from "~/features/dashboard/components/declaration-card";
import { renderWithMantine } from "~/test-utils";

const categoryIds = vi.hoisted(() => ({
  eikaiwa: "category_eikaiwa" as Id<"studyCategories">,
  other: "category_other" as Id<"studyCategories">,
  reading: "category_reading" as Id<"studyCategories">,
  toeic: "category_toeic" as Id<"studyCategories">,
}));

vi.mock("~/features/study-categories/hooks/use-study-categories-query", () => ({
  useStudyCategoriesQuery: () => ({
    categoryName: (categoryId: Id<"studyCategories"> | undefined) => {
      switch (categoryId) {
        case categoryIds.eikaiwa:
          return "英会話";
        case categoryIds.other:
          return "その他";
        case categoryIds.reading:
          return "読書";
        case categoryIds.toeic:
          return "TOEIC";
        default:
          return "カテゴリ未設定";
      }
    },
  }),
}));

test("renders actual/total minutes", () => {
  const { getByText } = renderWithMantine(
    <DeclarationCard actualMinutes={30} actualPercent={50} declarations={[]} totalMinutes={60} />,
  );

  expect(getByText("30")).toBeDefined();
  expect(getByText("/ 60 分")).toBeDefined();
});

test("renders nothing in the declaration list when there are no declarations", () => {
  const { queryByText } = renderWithMantine(
    <DeclarationCard actualMinutes={0} actualPercent={0} declarations={[]} totalMinutes={0} />,
  );

  expect(queryByText("06:00")).toBeNull();
});

test("renders each declaration's time, category label, and status label", () => {
  const { getAllByText, getByText } = renderWithMantine(
    <DeclarationCard
      actualMinutes={30}
      actualPercent={50}
      declarations={[
        { categoryId: categoryIds.toeic, plannedMinutes: 30, startHm: "06:00", status: "planned" },
        { categoryId: categoryIds.reading, plannedMinutes: 20, startHm: "21:00", status: "done" },
        {
          categoryId: categoryIds.eikaiwa,
          plannedMinutes: 20,
          startHm: "22:00",
          status: "eroded",
        },
        {
          categoryId: categoryIds.other,
          plannedMinutes: 10,
          startHm: "23:00",
          status: "rescheduled",
        },
        {
          categoryId: categoryIds.toeic,
          plannedMinutes: 15,
          startHm: "23:30",
          status: "declined",
        },
      ]}
      totalMinutes={95}
    />,
  );

  expect(getByText("06:00")).toBeDefined();
  expect(getAllByText("TOEIC")).toHaveLength(2);
  expect(getByText("予定")).toBeDefined();

  expect(getByText("読書")).toBeDefined();
  expect(getByText("済")).toBeDefined();

  expect(getByText("英会話")).toBeDefined();
  expect(getByText("侵食")).toBeDefined();

  expect(getByText("その他")).toBeDefined();
  expect(getByText("リスケ済")).toBeDefined();

  expect(getByText("23:30")).toBeDefined();
  expect(getByText("見送り")).toBeDefined();
});
