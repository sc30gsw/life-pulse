import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { cn } from "cnfast";
import type { ComponentProps, CSSProperties } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { useDeclareBlock } from "~/features/study/hooks/use-declare-block";
import { useUpdateBlock } from "~/features/study/hooks/use-update-block";
import {
  type DeclareBlockFormInput,
  DeclareBlockSchema,
} from "~/features/study/schemas/declare-block-schema";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/types/dashboard";
import { todayJst } from "~/utils/date-jst";
import { holidayName } from "~/utils/holiday";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];

type EditableBlock = Pick<Doc<"studyBlocks">, "_id" | "category" | "dateJst" | "endHm" | "startHm">;

type DeclareBlockFormProps = {
  block?: EditableBlock;
  onDone?: () => void;
};

function initialInput(block?: EditableBlock): DeclareBlockFormInput {
  return {
    category: (block?.category as SessionCategory | undefined) ?? "toeic",
    range:
      block === undefined
        ? [null, null]
        : [`${block.dateJst} ${block.startHm}:00`, `${block.dateJst} ${block.endHm}:00`],
  };
}

function renderHolidayDay(
  date: Parameters<NonNullable<ComponentProps<typeof DateTimePicker>["renderDay"]>>[0],
) {
  const name = holidayName(date);
  const day = Number(date.slice(8, 10));

  return (
    <Stack align="center" gap={0} lh={1}>
      <span>{day}</span>
      {name !== null && (
        <span style={{ fontSize: 12, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </span>
      )}
    </Stack>
  );
}

export function DeclareBlockForm({ block, onDone }: DeclareBlockFormProps = {}) {
  // Deliberately does NOT read the blocks query — the form must render
  // instantly instead of suspending with the list.
  const declareBlock = useDeclareBlock();
  const updateBlock = useUpdateBlock();
  const declareForm = useForm({
    initialInput: initialInput(block),
    schema: DeclareBlockSchema,
  });
  const isEditing = block !== undefined;

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

        if (isEditing) {
          updateBlock.mutate({ ...output, blockId: block._id }, options);
        } else {
          declareBlock.mutate(output, options);
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
          <Field of={declareForm} path={["category"]}>
            {(field) => (
              <Group gap={8} wrap="wrap">
                {CATEGORY_VALUES.map((category) => {
                  const isActive = field.input === category;

                  return (
                    <UnstyledButton
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => field.onChange(category)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        isActive
                          ? cn(
                              ACCENT_CLASSES.good.border,
                              ACCENT_CLASSES.good.bg,
                              ACCENT_CLASSES.good.text,
                              "font-semibold",
                            )
                          : "border-bd-2 bg-inset text-dim font-medium",
                      )}
                    >
                      {CATEGORY_LABELS[category]}
                    </UnstyledButton>
                  );
                })}
              </Group>
            )}
          </Field>
        </Stack>

        <Field of={declareForm} path={["range"]}>
          {(field) => (
            <DateTimePicker
              type="range"
              allowSingleDateInRange
              error={field.errors?.[0]}
              getDayAriaLabel={(date) => {
                const name = holidayName(date);
                return name === null ? date : `${date} ${name}`;
              }}
              getDayProps={(date) => {
                const name = holidayName(date);
                return name === null
                  ? {}
                  : {
                      style: { color: "var(--coral)" } satisfies CSSProperties,
                      title: name,
                    };
              }}
              label="日時"
              minDate={todayJst()}
              onChange={field.onChange}
              renderDay={renderHolidayDay}
              value={field.input as [string | null, string | null]}
              valueFormat="YYYY-MM-DD HH:mm"
              withSeconds={false}
            />
          )}
        </Field>

        <Button style={ACCENT_SOLID_STYLE.good} type="submit">
          {isEditing ? "予定を更新する" : "枠を宣言する"}
        </Button>
      </Stack>
    </Form>
  );
}
