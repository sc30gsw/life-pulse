import { Modal } from "@mantine/core";
import type { ComponentProps } from "react";

import type { Doc } from "~/../convex/_generated/dataModel";
import { DeclareBlockForm } from "~/features/study/components/declare-block-form";

const MODAL_STYLES = {
  body: { color: "var(--tx)" },
  content: { backgroundColor: "var(--panel)", border: "1px solid var(--bd2)", color: "var(--tx)" },
  header: { backgroundColor: "var(--panel)", color: "var(--tx)" },
  title: { color: "var(--tx)", fontWeight: 700 },
} as const satisfies ComponentProps<typeof Modal>["styles"];

type EditBlockModalProps = {
  block: Doc<"studyBlocks"> | null;
  onClose: () => void;
};

export function EditBlockModal({ block, onClose }: EditBlockModalProps) {
  return (
    <Modal
      centered
      onClose={onClose}
      opened={block !== null}
      styles={MODAL_STYLES}
      title="予定枠を編集"
    >
      {block !== null && <DeclareBlockForm key={block._id} block={block} onDone={onClose} />}
    </Modal>
  );
}
