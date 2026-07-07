import * as v from "valibot";

import { CATEGORY_LABELS, type SessionCategory } from "~/types/dashboard";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];
const HM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DeclareBlockSchema = v.pipe(
  v.object({
    category: v.picklist(CATEGORY_VALUES),
    endHm: v.pipe(v.string(), v.regex(HM_PATTERN, "HH:mm形式で入力してください")),
    startHm: v.pipe(v.string(), v.regex(HM_PATTERN, "HH:mm形式で入力してください")),
  }),
  v.forward(
    v.partialCheck(
      [["startHm"], ["endHm"]],
      (input) => input.startHm < input.endHm,
      "終了時刻は開始時刻より後にしてください",
    ),
    ["endHm"],
  ),
);

export type DeclareBlockInput = v.InferOutput<typeof DeclareBlockSchema>;
