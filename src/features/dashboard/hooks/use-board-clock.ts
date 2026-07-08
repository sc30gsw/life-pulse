import { useInterval } from "@mantine/hooks";
import { useState } from "react";

import {
  formatClockDate,
  formatClockDateCompact,
  formatClockTimeMinutes,
} from "~/features/dashboard/utils/format";
import { toDateJst, todayJst } from "~/utils/date-jst";

const CLOCK_TICK_MS = 60_000;

export function useBoardClock() {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dateJst, setDateJst] = useState(() => todayJst());

  // 1min clock tick (display-only, CVX-14), also detects a JST day rollover and
  // re-points card queries at the new date. Data stays card-scoped; this hook only owns the shared key.
  useInterval(
    () => {
      const tickNow = Date.now();
      setNowMs(tickNow);
      const tickDateJst = toDateJst(tickNow);
      setDateJst((prev) => (prev === tickDateJst ? prev : tickDateJst));
    },
    CLOCK_TICK_MS,
    { autoInvoke: true },
  );

  return {
    clockDateLabel: formatClockDate(nowMs),
    clockDateLabelCompact: formatClockDateCompact(nowMs),
    clockTime: formatClockTimeMinutes(nowMs),
    dateJst,
    nowMs,
  } as const;
}
