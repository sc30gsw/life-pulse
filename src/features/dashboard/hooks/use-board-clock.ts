import { useInterval } from "@mantine/hooks";
import { useState } from "react";

import { formatClockDate, formatClockTime } from "~/features/dashboard/utils/format";
import { toDateJst, todayJst } from "~/utils/date-jst";

const CLOCK_TICK_MS = 1_000;

export function useBoardClock() {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dateJst, setDateJst] = useState(() => todayJst());

  // 1s clock tick, also detects a JST day rollover and re-points card queries
  // at the new date. Data stays card-scoped; this hook only owns the shared key.
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
    clockTime: formatClockTime(nowMs),
    dateJst,
    nowMs,
  } as const;
}
