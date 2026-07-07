// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";

import { DeclarationCard } from "~/features/dashboard/components/declaration-card";
import { renderWithMantine } from "~/test-utils";

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
  const { getByText } = renderWithMantine(
    <DeclarationCard
      actualMinutes={30}
      actualPercent={50}
      declarations={[
        { category: "toeic", plannedMinutes: 30, startHm: "06:00", status: "planned" },
        { category: "reading", plannedMinutes: 20, startHm: "21:00", status: "done" },
        { category: "eikaiwa", plannedMinutes: 20, startHm: "22:00", status: "eroded" },
        { category: "other", plannedMinutes: 10, startHm: "23:00", status: "rescheduled" },
        { category: "toeic", plannedMinutes: 15, startHm: "23:30", status: "declined" },
      ]}
      totalMinutes={95}
    />,
  );

  expect(getByText("23:30")).toBeDefined();
  expect(getByText("見送り")).toBeDefined();

  expect(getByText("06:00")).toBeDefined();
  expect(getByText("TOEIC")).toBeDefined();
  expect(getByText("予定")).toBeDefined();

  expect(getByText("読書")).toBeDefined();
  expect(getByText("済")).toBeDefined();

  expect(getByText("英会話")).toBeDefined();
  expect(getByText("侵食")).toBeDefined();

  expect(getByText("その他")).toBeDefined();
  expect(getByText("リスケ済")).toBeDefined();

  expect(getByText("見送り")).toBeDefined();
});
