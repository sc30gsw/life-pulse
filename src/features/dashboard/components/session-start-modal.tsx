import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Modal, NumberInput, Stack, Text, UnstyledButton } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import { cn } from "cnfast";
import type { ComponentProps } from "react";

import type { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import { StartSessionSchema } from "~/features/dashboard/schemas/start-session-schema";
import {
  ACCENT_CLASSES,
  ACCENT_SOLID_STYLE,
  ACCENT_VARS,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/types/dashboard";

const CATEGORY_VALUES = Object.keys(CATEGORY_LABELS) as SessionCategory[];

const MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

type SessionStartModalProps = {
  onStart: ReturnType<typeof useDashboardStudy>["onStartSession"];
  opened: UseDisclosureReturnValue[0];
  onClose: UseDisclosureReturnValue[1]["close"];
};

export function SessionStartModal({ opened, onClose, onStart }: SessionStartModalProps) {
  const startSessionForm = useForm({
    initialInput: { category: "toeic", plannedMinutes: 60 },
    schema: StartSessionSchema,
  });

  return (
    <Modal centered onClose={onClose} opened={opened} styles={MODAL_STYLES} title="セッション開始">
      <Form
        of={startSessionForm}
        onSubmit={(output) => {
          onStart(output.category, output.plannedMinutes);
          onClose();
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
            <Field of={startSessionForm} path={["category"]}>
              {(field) => (
                <Group component="fieldset" gap={8} m={0} p={0} style={{ border: 0 }} wrap="wrap">
                  <legend className="sr-only">カテゴリ</legend>
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
          <Field of={startSessionForm} path={["plannedMinutes"]}>
            {(field) => (
              <NumberInput
                {...field.props}
                error={field.errors?.[0]}
                label="目標分数(任意)"
                min={1}
                onChange={(value) => field.onChange(value === "" ? undefined : Number(value))}
                value={field.input ?? ""}
              />
            )}
          </Field>
          <Button style={ACCENT_SOLID_STYLE.good} type="submit">
            開始する
          </Button>
        </Stack>
      </Form>
    </Modal>
  );
}
