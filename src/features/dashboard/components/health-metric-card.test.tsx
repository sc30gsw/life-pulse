// @vitest-environment happy-dom
import { Text } from "@mantine/core";
import { expect, test } from "vite-plus/test";

import {
  RingMetricCard,
  TextMetricCard,
} from "~/features/dashboard/components/health-metric-card";
import { renderWithMantine } from "~/test-utils";

test("RingMetricCard renders a labeled ring value", () => {
  const { getByText } = renderWithMantine(
    <RingMetricCard accentColor="var(--good)" label="Body Battery" subLabel="起床時" value={72} />,
  );

  expect(getByText("Body Battery")).toBeDefined();
  expect(getByText("起床時")).toBeDefined();
  expect(getByText("72")).toBeDefined();
});

test("TextMetricCard renders rich value and sub label content", () => {
  const { getByText } = renderWithMantine(
    <TextMetricCard
      label="HRV"
      value={
        <>
          45
          <Text component="span"> ms</Text>
        </>
      }
      subLabel="安静時心拍"
    />,
  );

  expect(getByText("HRV")).toBeDefined();
  expect(getByText("45")).toBeDefined();
  expect(getByText("ms")).toBeDefined();
  expect(getByText("安静時心拍")).toBeDefined();
});
