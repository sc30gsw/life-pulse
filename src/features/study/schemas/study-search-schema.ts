import * as v from "valibot";

export const defaultStudySearchParams = {
  focus: undefined,
} as const satisfies Record<string, string | undefined>;

export const studySearchSchema = v.object({
  focus: v.optional(v.picklist(["categories"])),
});
