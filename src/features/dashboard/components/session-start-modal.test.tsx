// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { SessionStartModal } from "~/features/dashboard/components/session-start-modal";
import { renderWithMantine } from "~/test-utils";

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

  expect(onStart).toHaveBeenCalledWith("toeic", 60);
});

test("submits the category selected via the segmented control", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.click(getByRole("radio", { name: "英会話" }));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith("eikaiwa", 60);
});

test("submits undefined planned minutes when the field is cleared", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <SessionStartModal onClose={vi.fn()} onStart={onStart} opened />,
  );

  await user.clear(getByLabelText("目標分数(任意)"));
  await user.click(getByRole("button", { name: "開始する" }));

  expect(onStart).toHaveBeenCalledWith("toeic", undefined);
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

  expect(onStart).toHaveBeenCalledWith("toeic", 90);
});

test("calls onClose when the modal is dismissed via escape", async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  renderWithMantine(<SessionStartModal onClose={onClose} onStart={vi.fn()} opened />);

  await user.keyboard("{Escape}");

  expect(onClose).toHaveBeenCalled();
});
