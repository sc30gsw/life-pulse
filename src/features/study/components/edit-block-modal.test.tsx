// @vitest-environment happy-dom
import { expect, test, vi } from "vite-plus/test";

import type { Doc } from "~/../convex/_generated/dataModel";
import { EditBlockModal } from "~/features/study/components/edit-block-modal";
import { renderWithMantine } from "~/test-utils";

const formState = vi.hoisted(() => ({
  props: [] as { block: Pick<Doc<"studyBlocks">, "_id">; onDone: () => void }[],
}));

vi.mock("~/features/study/components/declare-block-form", () => ({
  DeclareBlockForm: (props: { block: Pick<Doc<"studyBlocks">, "_id">; onDone: () => void }) => {
    formState.props.push(props);

    return <div>編集フォーム {props.block._id}</div>;
  },
}));

function buildBlock(): Doc<"studyBlocks"> {
  return {
    _creationTime: 1,
    _id: "block_1" as Doc<"studyBlocks">["_id"],
    category: "toeic",
    dateJst: "2099-01-01",
    endHm: "07:00",
    plannedMinutes: 60,
    source: "manual",
    startHm: "06:00",
    status: "planned",
    userId: "user_1" as Doc<"studyBlocks">["userId"],
  };
}

test("does not render the form when no block is selected", () => {
  formState.props = [];

  const { queryByText } = renderWithMantine(<EditBlockModal block={null} onClose={vi.fn()} />);

  expect(queryByText(/編集フォーム/)).toBeNull();
  expect(formState.props).toHaveLength(0);
});

test("renders the selected block in a modal form and wires onDone to close", () => {
  formState.props = [];
  const onClose = vi.fn();

  const { getByText } = renderWithMantine(
    <EditBlockModal block={buildBlock()} onClose={onClose} />,
  );

  expect(getByText("予定枠を編集")).toBeDefined();
  expect(getByText("編集フォーム block_1")).toBeDefined();
  expect(formState.props[0]?.block._id).toBe("block_1");

  formState.props[0]?.onDone();
  expect(onClose).toHaveBeenCalled();
});
