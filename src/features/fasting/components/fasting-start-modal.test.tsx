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

vi.mock("@mantine/dates", () => ({
  TimePicker: ({
    disabled,
    error,
    label,
    onBlur,
    onChange,
    value,
  }: {
    disabled?: boolean;
    error?: string;
    label: string;
    onBlur?: () => void;
    onChange: (value: string) => void;
    value: string;
  }) => (
    <div>
      <label htmlFor="target-duration">{label}</label>
      <input
        disabled={disabled}
        id="target-duration"
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      {error ? <span>{error}</span> : null}
    </div>
  ),
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

test("submits the entered target duration converted to minutes", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  await user.type(getByLabelText(/目標時間/), "01:30");
  await user.click(getByRole("button", { name: "開始する" }));

  expect(mutationState.mutate).toHaveBeenCalledWith({ targetMinutes: 90 }, expect.any(Object));
});

test("shows a validation error and does not submit for a zero-minute duration", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, findByText } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  await user.type(getByLabelText(/目標時間/), "00:00");
  await user.tab();

  expect(await findByText("1分以上で入力してください")).toBeDefined();
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
