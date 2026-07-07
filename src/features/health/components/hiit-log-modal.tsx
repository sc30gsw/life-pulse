import { Modal } from "@mantine/core";
import type { ComponentProps } from "react";

import { HiitLogForm, type EditableWorkout } from "~/features/health/components/hiit-log-form";

const MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

export type HiitLogModalTarget = EditableWorkout | "new" | null;

type HiitLogModalProps = {
  onClose: () => void;
  target: HiitLogModalTarget;
};

export function HiitLogModal({ target, onClose }: HiitLogModalProps) {
  return (
    <Modal
      centered
      onClose={onClose}
      opened={target !== null}
      styles={MODAL_STYLES}
      title={target === "new" || target === null ? "HIIT記録" : "記録を編集"}
    >
      {target !== null && (
        <HiitLogForm
          key={target === "new" ? "new" : target._id}
          onDone={onClose}
          workout={target === "new" ? undefined : target}
        />
      )}
    </Modal>
  );
}
