// @vitest-environment happy-dom
import { fireEvent } from "@testing-library/react";
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

vi.mock("@mantine/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/core")>();

  return {
    ...actual,
    Slider: ({
      disabled,
      onChange,
      thumbLabel,
      value,
      max,
      min,
    }: {
      disabled?: boolean;
      max?: number;
      min?: number;
      onChange: (value: number) => void;
      thumbLabel: string;
      value: number;
    }) => (
      <input
        aria-label={thumbLabel}
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    ),
  };
});

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

test("submits the selected target duration in minutes", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <FastingStartModal onClose={vi.fn()} opened />,
  );

  fireEvent.change(getByLabelText("目標時間"), { target: { value: "90" } });
  await user.click(getByRole("button", { name: "開始する" }));

  expect(mutationState.mutate).toHaveBeenCalledWith({ targetMinutes: 90 }, expect.any(Object));
});

test("caps the visible target duration at 16 hours", () => {
  mutationState.mutate.mockClear();
  const { getByLabelText } = renderWithMantine(<FastingStartModal onClose={vi.fn()} opened />);

  const slider = getByLabelText("目標時間");

  expect(slider.getAttribute("max")).toBe("960");
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
