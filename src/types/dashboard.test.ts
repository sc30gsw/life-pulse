import { expect, test } from "vite-plus/test";

import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  DECLARATION_STATUS_LABELS,
  FASTING_PHASE_LABELS,
  FASTING_PHASE_SUB_LABELS,
  HEALTH_SOURCE_LABELS,
  PRESENCE_LABELS,
  PRESENCE_SUB_LABELS,
  REASON_LABELS,
} from "~/types/dashboard";

test("exposes display labels for dashboard domain values", () => {
  expect(CATEGORY_LABELS.toeic).toBe("TOEIC");
  expect(REASON_LABELS.dog).toBe("犬");
  expect(FASTING_PHASE_LABELS.goal).toBe("目標達成");
  expect(FASTING_PHASE_SUB_LABELS.fatburn).toBe("16hで目標達成");
  expect(HEALTH_SOURCE_LABELS.garmin).toBe("source: garmin");
  expect(DECLARATION_STATUS_LABELS.rescheduled).toBe("リスケ済");
  expect(PRESENCE_LABELS.commuting_home).toBe("帰宅中");
  expect(PRESENCE_SUB_LABELS.sleeping).toBe("おやすみ");
});

test("keeps accent maps aligned across class, css-var, and solid style tokens", () => {
  expect(Object.keys(ACCENT_CLASSES).sort()).toEqual(Object.keys(ACCENT_VARS).sort());
  expect(Object.keys(ACCENT_SOLID_STYLE).sort()).toEqual(Object.keys(ACCENT_VARS).sort());
  expect(ACCENT_CLASSES.good.text).toBe("text-good");
  expect(ACCENT_VARS.coral).toBe("var(--coral)");
  expect(ACCENT_SOLID_STYLE.blue).toEqual({
    backgroundColor: "var(--blue)",
    color: "var(--bg)",
  });
});
