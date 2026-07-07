import { Field, Form, useForm } from "@formisch/react";
import { Button, Modal, NumberInput, SegmentedControl, Stack } from "@mantine/core";
import type { UseDisclosureReturnValue } from "@mantine/hooks";
import type { ComponentProps } from "react";

import type { useDashboardStudy } from "~/features/dashboard/hooks/use-dashboard-study";
import { StartSessionSchema } from "~/features/dashboard/schemas/start-session-schema";
import {
  ACCENT_SOLID_STYLE,
  CATEGORY_LABELS,
  type SessionCategory,
} from "~/features/dashboard/types/dashboard";

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as SessionCategory[]).map((value) => ({
  label: CATEGORY_LABELS[value],
  value,
}));

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
          <Field of={startSessionForm} path={["category"]}>
            {(field) => (
              <SegmentedControl
                data={CATEGORY_OPTIONS}
                fullWidth
                onChange={(value) => field.onChange(value as SessionCategory)}
                value={field.input}
              />
            )}
          </Field>
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
