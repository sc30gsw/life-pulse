import { useInterval } from "@mantine/hooks";
import { useState } from "react";

import { toDateJst } from "~/utils/date-jst";
import { dayjs } from "~/utils/dayjs";

const TICK_MS = 30_000;
const ROUND_MINUTES = 5;

// nowHm is a query argument (CVX-14), so every change re-subscribes the
// todayWithSuggestions query. Suggestions move on a 30-minute grid — flooring
// to 5 minutes keeps them fresh without a per-second subscription churn.
// The input is a plain epoch-ms timestamp (Date.now()), not a query arg.
function floorToNowHm(nowMs: number) {
  const jstNow = dayjs(nowMs).tz("Asia/Tokyo");
  const flooredMinutes = Math.floor(jstNow.minute() / ROUND_MINUTES) * ROUND_MINUTES;

  return `${String(jstNow.hour()).padStart(2, "0")}:${String(flooredMinutes).padStart(2, "0")}`;
}

export function useStudyClock() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useInterval(
    () => {
      setNowMs(Date.now());
    },
    TICK_MS,
    { autoInvoke: true },
  );

  return { dateJst: toDateJst(nowMs), nowHm: floorToNowHm(nowMs) } as const;
}
