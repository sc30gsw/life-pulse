import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { cn } from "cnfast";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import {
  DATE_TIME_PICKER_CLASS_NAMES,
  DATE_TIME_PICKER_POPOVER_PROPS,
  DATE_TIME_PICKER_STYLES,
  TIME_PICKER_PROPS,
  getDayAriaLabel,
  getDayProps,
  renderHolidayDay,
} from "~/components/date-time-picker-style";
import { CategoryRequiredPrompt } from "~/features/study-categories/components/category-required-prompt";
import { useStudyCategoriesQuery } from "~/features/study-categories/hooks/use-study-categories-query";
import { useDeclareBlock } from "~/features/study/hooks/use-declare-block";
import { useUpdateBlock } from "~/features/study/hooks/use-update-block";
import {
  type DeclareBlockFormInput,
  DeclareBlockSchema,
} from "~/features/study/schemas/declare-block-schema";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";

type EditableBlock = Pick<
  Doc<"studyBlocks">,
  "_id" | "categoryId" | "dateJst" | "endHm" | "startHm"
>;

type DeclareBlockFormProps = {
  block?: EditableBlock;
  onDone?: () => void;
};

function initialInput(
  categoryId: Doc<"studyCategories">["_id"] | undefined,
  block?: EditableBlock,
): DeclareBlockFormInput {
  return {
    categoryId: block?.categoryId ?? categoryId ?? "",
    endAt: block === undefined ? null : `${block.dateJst} ${block.endHm}:00`,
    startAt: block === undefined ? null : `${block.dateJst} ${block.startHm}:00`,
  };
}

export function DeclareBlockForm({ block, onDone }: DeclareBlockFormProps = {}) {
  // Deliberately does NOT read the blocks query — the form must render
  // instantly instead of suspending with the list.
  const { activeCategories, categoryOptions } = useStudyCategoriesQuery();
  const categories = categoryOptions(block?.categoryId);
  const declareBlock = useDeclareBlock();
  const updateBlock = useUpdateBlock();
  const declareForm = useForm({
    initialInput: initialInput(activeCategories[0]?._id, block),
    schema: DeclareBlockSchema,
  });
  const isEditing = block !== undefined;

  if (!isEditing && activeCategories.length === 0) {
    return <CategoryRequiredPrompt />;
  }

  return (
    <Form
      of={declareForm}
      onSubmit={(output) => {
        const options = {
          onError: () => {
            notifications.show({
              color: "red",
              message: isEditing ? "予定枠の更新に失敗しました" : "枠の宣言に失敗しました",
              title: "エラー",
            });
          },
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: `${output.dateJst} ${output.startHm}〜${output.endHm} の学習枠を${isEditing ? "更新" : "宣言"}しました`,
              title: isEditing ? "更新しました" : "宣言しました",
            });
            onDone?.();
          },
        };
        const args = {
          ...output,
          categoryId: output.categoryId as Id<"studyCategories">,
        };

        if (isEditing) {
          updateBlock.mutate({ ...args, blockId: block._id }, options);
        } else {
          declareBlock.mutate(args, options);
        }
      }}
    >
      <Stack gap="md">
        <Stack gap={6}>
          <Text
            component="span"
            size="10.5px"
            fw={600}
            tt="uppercase"
            c={ACCENT_VARS.faint}
            style={{ letterSpacing: "0.13em" }}
          >
            カテゴリ
          </Text>
          <Field of={declareForm} path={["categoryId"]}>
            {(field) => (
              <Group gap={8} wrap="wrap">
                {categories.map((category) => {
                  const isActive = field.input === category._id;

                  return (
                    <UnstyledButton
                      key={category._id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => field.onChange(category._id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100",
                        isActive
                          ? cn(
                              ACCENT_CLASSES.good.border,
                              ACCENT_CLASSES.good.bg,
                              ACCENT_CLASSES.good.text,
                              "font-semibold",
                            )
                          : "border-bd-2 bg-inset text-dim font-medium",
                      )}
                      disabled={declareForm.isSubmitting}
                    >
                      {category.name}
                    </UnstyledButton>
                  );
                })}
              </Group>
            )}
          </Field>
        </Stack>

        <Group gap="md" grow>
          <Field of={declareForm} path={["startAt"]}>
            {(field) => (
              <DateTimePicker
                classNames={DATE_TIME_PICKER_CLASS_NAMES}
                error={field.errors?.[0]}
                getDayAriaLabel={getDayAriaLabel}
                getDayProps={getDayProps}
                label="開始日時"
                minDate={todayJst()}
                onChange={field.onChange}
                placeholder="開始日時を選択"
                popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
                renderDay={renderHolidayDay}
                styles={DATE_TIME_PICKER_STYLES}
                timePickerProps={TIME_PICKER_PROPS}
                value={field.input}
                valueFormat="YYYY-MM-DD HH:mm"
                weekendDays={[0]}
                withSeconds={false}
                disabled={declareForm.isSubmitting}
              />
            )}
          </Field>
          <Field of={declareForm} path={["endAt"]}>
            {(field) => (
              <DateTimePicker
                classNames={DATE_TIME_PICKER_CLASS_NAMES}
                error={field.errors?.[0]}
                getDayAriaLabel={getDayAriaLabel}
                getDayProps={getDayProps}
                label="終了日時"
                minDate={todayJst()}
                onChange={field.onChange}
                placeholder="終了日時を選択"
                popoverProps={DATE_TIME_PICKER_POPOVER_PROPS}
                renderDay={renderHolidayDay}
                styles={DATE_TIME_PICKER_STYLES}
                timePickerProps={TIME_PICKER_PROPS}
                value={field.input}
                valueFormat="YYYY-MM-DD HH:mm"
                weekendDays={[0]}
                withSeconds={false}
                disabled={declareForm.isSubmitting}
              />
            )}
          </Field>
        </Group>

        <Button
          className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
          loading={declareForm.isSubmitting}
          disabled={declareForm.isSubmitting}
          style={ACCENT_SOLID_STYLE.good}
          type="submit"
        >
          {isEditing ? "予定を更新する" : "枠を宣言する"}
        </Button>
      </Stack>
    </Form>
  );
}
