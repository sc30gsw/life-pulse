// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { ManualInputForm } from "~/features/health/components/manual-input-form";
import { renderWithMantine } from "~/test-utils";

const mutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock("~/features/health/hooks/use-upsert-manual", () => ({
  useUpsertManual: () => ({ mutate: mutationState.mutate }),
}));

vi.mock("@mantine/dates", () => ({
  DateInput: ({
    error,
    label,
    onChange,
    value,
  }: {
    error?: string;
    label: string;
    onChange: (value: string | null) => void;
    value: string | null;
  }) => (
    <div>
      <button onClick={() => onChange("2099-01-01")} type="button">
        {label}: {value ?? ""}
      </button>
      {error ? <span>{error}</span> : null}
    </div>
  ),
}));

test("blocks submission and shows a validation error for a future date", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();

  const { findByText, getByRole } = renderWithMantine(<ManualInputForm />);

  await user.click(getByRole("button", { name: /対象日/ }));
  await user.click(getByRole("button", { name: "保存する" }));

  expect(await findByText("未来日は入力できません")).toBeDefined();
  expect(mutationState.mutate).not.toHaveBeenCalled();
});

test("submits the entered metrics for today's date", async () => {
  mutationState.mutate.mockClear();
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = renderWithMantine(<ManualInputForm />);

  await user.type(getByLabelText("睡眠スコア"), "80");
  await user.click(getByRole("button", { name: "保存する" }));

  expect(mutationState.mutate).toHaveBeenCalled();
  const [payload] = mutationState.mutate.mock.calls[0] as [Record<string, unknown>];
  expect(payload.sleepScore).toBe(80);
});
