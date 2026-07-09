import * as v from "valibot";

export const DogTaskNameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "タスク名を入力してください")),
});
