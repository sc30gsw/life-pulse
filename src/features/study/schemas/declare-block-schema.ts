import * as v from "valibot";

import { CATEGORY_LABELS, type SessionCategory } from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function hasBothDates(input: { endAt: string | null; startAt: string | null }) {
  return input.startAt !== null && input.endAt !== null;
}

export const DeclareBlockSchema = v.pipe(
  v.object({
    category: v.picklist(CATEGORY_VALUES),
    endAt: v.nullable(v.pipe(v.string(), v.regex(DATE_TIME_PATTERN, "終了日時を選択してください"))),
    startAt: v.nullable(v.pipe(v.string(), v.regex(DATE_TIME_PATTERN, "開始日時を選択してください"))),
  }),
  v.forward(
    v.partialCheck(
      [["startAt"], ["endAt"]],
      (input) => hasBothDates(input),
      "開始と終了を選択してください",
    ),
    ["endAt"],
  ),
  v.forward(
    v.partialCheck(
      [["startAt"], ["endAt"]],
      (input) => !hasBothDates(input) || input.startAt?.slice(0, 10) === input.endAt?.slice(0, 10),
      "同じ日付を選択してください",
    ),
    ["endAt"],
  ),
  v.forward(
    v.partialCheck(
      [["startAt"]],
      (input) => input.startAt === null || input.startAt.slice(0, 10) >= todayJst(),
      "過去日の枠は宣言できません",
    ),
    ["startAt"],
  ),
  v.forward(
    v.partialCheck(
      [["startAt"], ["endAt"]],
      (input) => !hasBothDates(input) || input.startAt! < input.endAt!,
      "終了時刻は開始時刻より後にしてください",
    ),
    ["endAt"],
  ),
  v.transform((input) => ({
    category: input.category,
    dateJst: input.startAt!.slice(0, 10),
    endHm: input.endAt!.slice(11, 16),
    startHm: input.startAt!.slice(11, 16),
  })),
);

export type DeclareBlockInput = v.InferOutput<typeof DeclareBlockSchema>;
export type DeclareBlockFormInput = v.InferInput<typeof DeclareBlockSchema>;
