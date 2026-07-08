import { Field, Form, useForm } from "@formisch/react";
import { Button, Group, Modal, NumberInput, Stack, Text, UnstyledButton } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import { cn } from "cnfast";
import type { ComponentProps } from "react";

import type { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import { StartSessionSchema } from "~/features/dashboard/schemas/start-session-schema";
import { CategoryRequiredPrompt } from "~/features/study-categories/components/category-required-prompt";
import { useStudyCategoriesQuery } from "~/features/study-categories/hooks/use-study-categories-query";
import { ACCENT_CLASSES, ACCENT_SOLID_STYLE, ACCENT_VARS } from "~/types/dashboard";

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
  const { activeCategories } = useStudyCategoriesQuery();
  const startSessionForm = useForm({
    initialInput: { categoryId: activeCategories[0]?._id ?? "", plannedMinutes: 60 },
    schema: StartSessionSchema,
  });

  return (
    <Modal centered onClose={onClose} opened={opened} styles={MODAL_STYLES} title="セッション開始">
      {activeCategories.length === 0 ? (
        <CategoryRequiredPrompt />
      ) : (
      <Form
        of={startSessionForm}
        onSubmit={(output) => {
          onStart(output.categoryId, output.plannedMinutes);
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
            <Field of={startSessionForm} path={["categoryId"]}>
              {(field) => (
                <Group component="fieldset" gap={8} m={0} p={0} style={{ border: 0 }} wrap="wrap">
                  <legend className="sr-only">カテゴリ</legend>
                  {activeCategories.map((category) => {
                    const isActive = field.input === category._id;

                    return (
                      <UnstyledButton
                        key={category._id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => field.onChange(category._id)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs",
                          "transition hover:brightness-110 active:brightness-95",
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
                        {category.name}
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
          <Button
            className="transition hover:brightness-110 active:brightness-95 disabled:hover:brightness-100 disabled:active:brightness-100"
            style={ACCENT_SOLID_STYLE.good}
            type="submit"
          >
            開始する
          </Button>
        </Stack>
      </Form>
      )}
    </Modal>
  );
}
