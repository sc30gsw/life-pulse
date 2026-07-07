// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { FastingStartModal } from "~/features/fasting/components/fasting-start-modal";
import { renderWithMantine } from "~/test-utils";

const mutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock("~/features/fasting/hooks/use-start-fasting", () => ({
  useStartFasting: () => ({ mutate: mutationState.mutate }),
}));

test("submits with no targetMinutes argument when the field is left empty", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(<FastingStartModal onClose={vi.fn()} opened />);

  await user.click(getByRole("button", { name: "開始する" }));

  expect(mutationState.mutate).toHaveBeenCalledWith(
    { targetMinutes: undefined },
    expect.any(Object),
  );
});

test("submits the entered target minutes", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  await user.type(getByLabelText(/目標時間/), "90");
  await user.click(getByRole("button", { name: "開始する" }));

  expect(mutationState.mutate).toHaveBeenCalledWith({ targetMinutes: 90 }, expect.any(Object));
});

test("shows a validation error and does not submit for zero minutes", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, findByText } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  await user.type(getByLabelText(/目標時間/), "0");
  await user.tab();

  expect(await findByText("1分以上で入力してください")).toBeDefined();
  expect(mutationState.mutate).not.toHaveBeenCalled();
});

test("shows a validation error and does not submit for a non-integer value", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, findByText } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  await user.type(getByLabelText(/目標時間/), "1.5");
  await user.tab();

  expect(await findByText("整数で入力してください")).toBeDefined();
  expect(mutationState.mutate).not.toHaveBeenCalled();
});

test("closes the modal and calls onSuccess when the mutation succeeds", async () => {
  mutationState.mutate.mockClear();
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <FastingStartModal onClose={onClose} onSuccess={onSuccess} opened />,
  );

  await user.click(getByRole("button", { name: "開始する" }));

  const options = mutationState.mutate.mock.calls[0]?.[1] as { onSuccess: () => void };
  options.onSuccess();

  expect(onClose).toHaveBeenCalled();
  expect(onSuccess).toHaveBeenCalled();
});
