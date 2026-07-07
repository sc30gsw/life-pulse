import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { cn } from "cnfast";

import { useStudyBlocks } from "~/features/study/hooks/use-study-blocks";
import { DeclareBlockSchema } from "~/features/study/schemas/declare-block-schema";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/types/dashboard";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];

export function DeclareBlockForm() {
  const { onDeclare } = useStudyBlocks();
  const declareForm = useForm({
    initialInput: { category: "toeic", endHm: "", startHm: "" },
    schema: DeclareBlockSchema,
  });

  return (
    <Form
      of={declareForm}
      onSubmit={(output) => {
        onDeclare(output);
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

        <Group gap="md" grow>
          <Field of={declareForm} path={["startHm"]}>
            {(field) => (
              <TimeInput
                {...field.props}
                error={field.errors?.[0]}
                label="開始時刻"
                value={field.input}
              />
            )}
          </Field>
          <Field of={declareForm} path={["endHm"]}>
            {(field) => (
              <TimeInput
                {...field.props}
                error={field.errors?.[0]}
                label="終了時刻"
                value={field.input}
              />
            )}
          </Field>
        </Group>

        <Button style={ACCENT_SOLID_STYLE.good} type="submit">
          枠を宣言する
        </Button>
      </Stack>
    </Form>
  );
}
