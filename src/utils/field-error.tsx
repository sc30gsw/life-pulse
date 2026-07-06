import type { FieldStore, FormSchema, FormStore, RequiredPath } from "@formisch/react";

export function getFieldError<TSchema extends FormSchema, TFieldPath extends RequiredPath>(
  field: FieldStore<TSchema, TFieldPath>,
  isSubmitted: FormStore["isSubmitted"],
) {
  if (field.errors === null || (!field.isEdited && !isSubmitted)) {
    return undefined;
  }

  return field.errors[0];
}
