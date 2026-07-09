import * as v from "valibot";

export const VerifyOtpSchema = v.object({
  code: v.pipe(
    v.string(),
    v.length(6, "6桁の確認コードを入力してください"),
    v.regex(/^\d+$/, "確認コードは数字で入力してください"),
  ),
});

export type VerifyOtpSchemaType = v.InferOutput<typeof VerifyOtpSchema>;
