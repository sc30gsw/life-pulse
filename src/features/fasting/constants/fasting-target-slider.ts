import type { Slider } from "@mantine/core";
import type { ComponentProps } from "react";

import {
  MAX_FASTING_TARGET_MINUTES,
  MIN_FASTING_TARGET_MINUTES,
} from "~/features/fasting/constants/fasting-target";

export const FASTING_TARGET_SLIDER_MARKS = [
  { value: MIN_FASTING_TARGET_MINUTES, label: "1m" },
  { value: 240, label: "4h" },
  { value: 480, label: "8h" },
  { value: 720, label: "12h" },
  { value: MAX_FASTING_TARGET_MINUTES, label: "16h" },
] as const satisfies ComponentProps<typeof Slider>["marks"];

export const FASTING_TARGET_SLIDER_STYLES = {
  bar: {
    backgroundColor: "var(--blue)",
    boxShadow: "0 0 16px var(--glow)",
  },
  mark: {
    backgroundColor: "var(--blue)",
    borderColor: "var(--bd2)",
  },
  markLabel: {
    color: "var(--dim)",
    fontSize: 11,
  },
  thumb: {
    backgroundColor: "var(--tx)",
    borderColor: "color-mix(in srgb, var(--blue) 60%, var(--bd2))",
    boxShadow: "0 0 18px var(--glow)",
  },
  track: {
    backgroundColor: "var(--blue)",
    border: "1px solid var(--bd)",
    boxShadow: "var(--cardsh)",
  },
} as const satisfies ComponentProps<typeof Slider>["styles"];
