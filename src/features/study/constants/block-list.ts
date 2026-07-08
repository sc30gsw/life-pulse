export const STUDY_BLOCK_LIST_COPY = {
  erodeTooltip: "予定していた学習枠が仕事・疲労・割り込みで使えなくなったことを記録します",
} as const satisfies StudyBlockListCopy;

type StudyBlockListCopy = Record<"erodeTooltip", string>;
