import * as v from "valibot";

export const DogNameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "名前を入力してください")),
});

export type DogNameInput = v.InferOutput<typeof DogNameSchema>;
export type DogNameFormInput = v.InferInput<typeof DogNameSchema>;
