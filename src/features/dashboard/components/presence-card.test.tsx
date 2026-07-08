// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { PresenceCard, PresenceCardFallback } from "~/features/dashboard/components/presence-card";
import { renderWithMantine } from "~/test-utils";

test("renders null presence as 未設定 without edit controls", () => {
  const { getByText, queryByRole, queryByText } = renderWithMantine(
    <PresenceCard
      editable={false}
      onSetPresence={vi.fn()}
      presence={null}
      title="パートナー"
      updatedRelativeLabel="5分前"
    />,
  );

  expect(getByText("パートナー")).toBeDefined();
  expect(getByText("未設定")).toBeDefined();
  expect(getByText("まだステータスが更新されていません")).toBeDefined();
  expect(queryByText("YOU")).toBeNull();
  expect(queryByRole("button")).toBeNull();
});

test("calls onSetPresence from an editable presence button", async () => {
  const onSetPresence = vi.fn();
  const user = userEvent.setup();
  const { getAllByText, getByRole, getByText } = renderWithMantine(
    <PresenceCard
      editable
      onSetPresence={onSetPresence}
      presence={{ etaHm: undefined, state: "home", updatedAt: 0 }}
      title="本人"
      updatedRelativeLabel="たった今"
    />,
  );

  expect(getByText("YOU")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);

  await user.click(getByRole("button", { name: "外出" }));

  expect(onSetPresence).toHaveBeenCalledWith("out");
});

test("submits an ETA while commuting home", async () => {
  const onSetPresence = vi.fn();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <PresenceCard
      editable
      onSetPresence={onSetPresence}
      presence={{ etaHm: undefined, state: "commuting_home", updatedAt: 0 }}
      title="本人"
      updatedRelativeLabel="たった今"
    />,
  );

  await user.type(getByLabelText("帰宅ETA"), "20:30");
  await user.click(getByRole("button", { name: "ETA設定" }));

  expect(onSetPresence).toHaveBeenCalledWith("commuting_home", "20:30");
});

test("PresenceCardFallback renders the loading layout content", () => {
  const { getAllByText, getByText } = renderWithMantine(<PresenceCardFallback title="本人" />);

  expect(getByText("本人")).toBeDefined();
  expect(getByText("YOU")).toBeDefined();
  expect(getAllByText("在宅").length).toBeGreaterThan(0);
});
