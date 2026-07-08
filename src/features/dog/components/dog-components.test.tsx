// @vitest-environment happy-dom
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { AddDogTaskForm } from "~/features/dog/components/add-dog-task-form";
import { DogNameForm } from "~/features/dog/components/dog-name-form";
import { DogTaskList, DogTaskListFallback } from "~/features/dog/components/dog-task-list";
import { DogTaskRow } from "~/features/dog/components/dog-task-row";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  createMutate: vi.fn(),
  dog: { _creationTime: 0, _id: "dog_1", name: "ハマロ" },
  dogTasks: [] as Doc<"dogTasks">[],
  notificationShow: vi.fn(),
  updateDogMutate: vi.fn(),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: state.notificationShow },
}));

vi.mock("~/features/dog/hooks/use-create-dog-task", () => ({
  useCreateDogTask: () => ({ mutate: state.createMutate }),
}));

vi.mock("~/features/dog/hooks/use-dog", () => ({
  useDog: () => ({ data: state.dog }),
}));

vi.mock("~/features/dog/hooks/use-update-dog", () => ({
  useUpdateDog: () => ({ mutate: state.updateDogMutate }),
}));

vi.mock("~/features/dog/hooks/use-dog-tasks", () => ({
  useDogTasks: () => ({
    onArchive: vi.fn(),
    onMove: vi.fn(),
    onRename: vi.fn(),
    tasks: state.dogTasks,
  }),
}));

function buildTask(name: string, id: string, sortOrder: number): Doc<"dogTasks"> {
  return {
    _creationTime: sortOrder,
    _id: id as Id<"dogTasks">,
    archivedAt: undefined,
    name,
    sortOrder,
  };
}

test("AddDogTaskForm submits a trimmed task name and shows success notification", async () => {
  state.createMutate.mockClear();
  state.notificationShow.mockClear();
  state.createMutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<AddDogTaskForm />);

  await user.type(getByLabelText("新しいタスク名"), " 朝散歩 ");
  await user.click(getByRole("button", { name: /追加/ }));

  expect(state.createMutate).toHaveBeenCalledWith(
    { name: "朝散歩" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
  expect(state.notificationShow).toHaveBeenCalledWith({
    color: "green",
    message: "「朝散歩」を追加しました",
    title: "追加しました",
  });
});

test("DogNameForm shows EmptyState when dog profile is missing", () => {
  state.dog = null as never;
  const { getByText } = renderWithMantine(<DogNameForm />);

  expect(getByText("犬プロフィール未作成")).toBeDefined();
});

test("DogNameForm submits an updated dog name", async () => {
  state.dog = { _creationTime: 0, _id: "dog_1", name: "ハマロ" };
  state.updateDogMutate.mockClear();
  state.updateDogMutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<DogNameForm />);

  await user.clear(getByLabelText("犬の名前"));
  await user.type(getByLabelText("犬の名前"), "ポチ");
  await user.click(getByRole("button", { name: "保存する" }));

  expect(state.updateDogMutate).toHaveBeenCalledWith(
    { name: "ポチ" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

test("DogTaskList renders an empty message and fallback rows", () => {
  state.dogTasks = [];

  const empty = renderWithMantine(<DogTaskList />);
  expect(
    empty.getByText("お世話タスクがありません。上のフォームから追加してください。"),
  ).toBeDefined();

  const fallback = renderWithMantine(<DogTaskListFallback />);
  expect(fallback.getByText("朝散歩")).toBeDefined();
  expect(fallback.getByText("朝ごはん")).toBeDefined();
});

test("DogTaskList renders task rows with boundary move buttons", () => {
  state.dogTasks = [buildTask("朝散歩", "task_1", 0), buildTask("夜ごはん", "task_2", 1)];
  const { getAllByLabelText, getByText } = renderWithMantine(<DogTaskList />);

  expect(getByText("朝散歩")).toBeDefined();
  expect(getByText("夜ごはん")).toBeDefined();
  expect((getAllByLabelText("上へ移動")[0] as HTMLButtonElement).disabled).toBe(true);
  expect((getAllByLabelText("下へ移動")[1] as HTMLButtonElement).disabled).toBe(true);
});

test("DogTaskRow moves, archives, and renames a task", async () => {
  const onArchive = vi.fn();
  const onMove = vi.fn();
  const onRename = vi.fn();
  const task = buildTask("朝散歩", "task_1", 0);
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <DogTaskRow
      isFirst={false}
      isLast={false}
      onArchive={onArchive}
      onMove={onMove}
      onRename={onRename}
      task={task}
    />,
  );

  await user.click(getByLabelText("上へ移動"));
  await user.click(getByLabelText("下へ移動"));
  await user.click(getByLabelText("削除"));

  expect(onMove).toHaveBeenCalledWith(task._id, "up");
  expect(onMove).toHaveBeenCalledWith(task._id, "down");
  expect(onArchive).toHaveBeenCalledWith(task);

  await user.click(getByLabelText("名前を変更"));
  await user.clear(getByLabelText("タスク名"));
  await user.type(getByLabelText("タスク名"), "夕散歩");
  await user.click(getByRole("button", { name: "保存する" }));

  expect(onRename).toHaveBeenCalledWith(task._id, "夕散歩");
});
