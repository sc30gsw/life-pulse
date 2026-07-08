import { expect, test } from "vite-plus/test";

import crons from "./crons";

test("schedules Garmin daily sync with a guideline-compliant cron expression", () => {
  const exported = (crons as unknown as { export(): string }).export();

  expect(JSON.parse(exported)).toMatchObject({
    "garmin daily sync": {
      schedule: { cron: "30 21 * * *", type: "cron" },
    },
  });
});
