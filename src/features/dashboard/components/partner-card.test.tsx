// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import { PartnerCard } from "~/features/dashboard/components/partner-card";
import { renderWithMantine } from "~/test-utils";

test("shows 未設定 when partner is null", () => {
  const { getByText } = renderWithMantine(
    <PartnerCard
      isPartnerView={false}
      onSetPresence={vi.fn()}
      partner={null}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="未更新"
    />,
  );

  expect(getByText("未設定")).toBeDefined();
  expect(getByText("まだステータスが更新されていません")).toBeDefined();
});

test("shows the presence label and sub-label when there is no ETA", () => {
  const { getByText } = renderWithMantine(
    <PartnerCard
      isPartnerView={false}
      onSetPresence={vi.fn()}
      partner={{ etaHm: undefined, state: "home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  expect(getByText("在宅")).toBeDefined();
  expect(getByText("家にいます")).toBeDefined();
  expect(getByText("更新 5分前")).toBeDefined();
});

test("shows the ETA text instead of the sub-label when an ETA is set", () => {
  const { getByText } = renderWithMantine(
    <PartnerCard
      isPartnerView={false}
      onSetPresence={vi.fn()}
      partner={{ etaHm: "20:30", state: "commuting_home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  expect(getByText("ETA 20:30")).toBeDefined();
});

test("hides the YOU badge and presence buttons when not the partner view", () => {
  const { queryByText, queryByRole } = renderWithMantine(
    <PartnerCard
      isPartnerView={false}
      onSetPresence={vi.fn()}
      partner={null}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="未更新"
    />,
  );

  expect(queryByText("YOU")).toBeNull();
  expect(queryByRole("button")).toBeNull();
});

test("shows the YOU badge and presence buttons, calling onSetPresence on click, in the partner view", async () => {
  const onSetPresence = vi.fn();
  const user = userEvent.setup();
  const { getByText, getByRole } = renderWithMantine(
    <PartnerCard
      isPartnerView={true}
      onSetPresence={onSetPresence}
      partner={{ etaHm: undefined, state: "home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  expect(getByText("YOU")).toBeDefined();

  await user.click(getByRole("button", { name: "外出" }));

  expect(onSetPresence).toHaveBeenCalledWith("out");
});

test("hides the ETA input when not the partner view, even while commuting home", () => {
  const { queryByLabelText } = renderWithMantine(
    <PartnerCard
      isPartnerView={false}
      onSetPresence={vi.fn()}
      partner={{ etaHm: undefined, state: "commuting_home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  expect(queryByLabelText("帰宅ETA")).toBeNull();
});

test("hides the ETA input in the partner view when the state is not commuting home", () => {
  const { queryByLabelText } = renderWithMantine(
    <PartnerCard
      isPartnerView={true}
      onSetPresence={vi.fn()}
      partner={{ etaHm: undefined, state: "home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  expect(queryByLabelText("帰宅ETA")).toBeNull();
});

test("shows the ETA input while commuting home in the partner view and submits the typed value", async () => {
  const onSetPresence = vi.fn();
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <PartnerCard
      isPartnerView={true}
      onSetPresence={onSetPresence}
      partner={{ etaHm: undefined, state: "commuting_home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  await user.type(getByLabelText("帰宅ETA"), "20:30");
  await user.click(getByRole("button", { name: "ETA設定" }));

  expect(onSetPresence).toHaveBeenCalledWith("commuting_home", "20:30");
});

test("submits undefined when the ETA input is left empty", async () => {
  const onSetPresence = vi.fn();
  const user = userEvent.setup();
  const { getByRole } = renderWithMantine(
    <PartnerCard
      isPartnerView={true}
      onSetPresence={onSetPresence}
      partner={{ etaHm: undefined, state: "commuting_home", updatedAt: 0 }}
      partnerFlash={false}
      partnerUpdatedRelativeLabel="5分前"
    />,
  );

  await user.click(getByRole("button", { name: "ETA設定" }));

  expect(onSetPresence).toHaveBeenCalledWith("commuting_home", undefined);
});
