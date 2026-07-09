// @vitest-environment happy-dom
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";

import type { Doc, Id } from "~/../convex/_generated/dataModel";
import { AddDogTaskForm } from "~/features/dog/components/add-dog-task-form";
import { DogImageUploader } from "~/features/dog/components/dog-image-uploader";
import { DogNameForm } from "~/features/dog/components/dog-name-form";
import { DogTaskList, DogTaskListFallback } from "~/features/dog/components/dog-task-list";
import { DogTaskRow } from "~/features/dog/components/dog-task-row";
import { renderWithMantine } from "~/test-utils";

const state = vi.hoisted(() => ({
  createMutate: vi.fn(),
  dog: {
    _creationTime: 0,
    _id: "dog_1",
    imageStorageId: undefined,
    imageUrl: null,
    name: "ハマロ",
  },
  dogTasks: [] as Doc<"dogTasks">[],
  notificationShow: vi.fn(),
  onArchiveTask: vi.fn(),
  onMoveTask: vi.fn(),
  onRenameTask: vi.fn(),
  onReorderTask: vi.fn(),
  setDogImage: { isPending: false, mutateAsync: vi.fn() },
  uploadUrl: { isPending: false, mutateAsync: vi.fn() },
  updateDogMutate: vi.fn(),
}));

vi.mock("react-easy-crop", () => ({
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (area: unknown, areaPixels: unknown) => void;
  }) => {
    onCropComplete({}, { height: 64, width: 64, x: 1, y: 2 });
    return <div>cropper</div>;
  },
}));

vi.mock("~/features/profile/utils/crop-image", () => ({
  cropImageToAvatarBlob: vi.fn(async () => new Blob(["dog"], { type: "image/jpeg" })),
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
  useGenerateDogImageUploadUrl: () => state.uploadUrl,
  useSetDogImage: () => state.setDogImage,
  useUpdateDog: () => ({ mutate: state.updateDogMutate }),
}));

vi.mock("~/features/dog/hooks/use-dog-tasks", () => ({
  useDogTasks: () => ({
    onArchive: state.onArchiveTask,
    onMove: state.onMoveTask,
    onRename: state.onRenameTask,
    onReorder: state.onReorderTask,
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

test("DogNameForm creates the dog profile when it is missing", async () => {
  state.dog = null as never;
  state.updateDogMutate.mockClear();
  state.updateDogMutate.mockImplementation((_input, callbacks) => callbacks.onSuccess());
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(<DogNameForm />);

  await user.type(getByLabelText("犬の名前"), "ハマロ");
  await user.click(getByRole("button", { name: "作成する" }));

  expect(state.updateDogMutate).toHaveBeenCalledWith(
    { name: "ハマロ" },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

test("DogNameForm submits an updated dog name", async () => {
  state.dog = {
    _creationTime: 0,
    _id: "dog_1",
    imageStorageId: undefined,
    imageUrl: null,
    name: "ハマロ",
  };
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

test("DogImageUploader uploads a cropped dog image and stores its storage id", async () => {
  state.dog = {
    _creationTime: 0,
    _id: "dog_1",
    imageStorageId: undefined,
    imageUrl: null,
    name: "ハマロ",
  };
  state.uploadUrl.mutateAsync.mockResolvedValue("https://upload.example.com");
  state.setDogImage.mutateAsync.mockResolvedValue(null);
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:dog") });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => ({ storageId: "storage_1" }),
      ok: true,
    })),
  );
  const user = userEvent.setup();
  const { container, getByRole, getByText } = renderWithMantine(<DogImageUploader />);

  const input = container.querySelector("input[type='file']");
  expect(input).not.toBeNull();
  await user.upload(
    input as HTMLInputElement,
    new File(["dog"], "dog.jpg", { type: "image/jpeg" }),
  );
  expect(getByText("cropper")).toBeDefined();
  await user.click(getByRole("button", { name: "写真を保存" }));

  expect(state.uploadUrl.mutateAsync).toHaveBeenCalledWith({});
  expect(state.setDogImage.mutateAsync).toHaveBeenCalledWith({ storageId: "storage_1" });
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

test("DogTaskList renders task rows as draggable list items", () => {
  state.dogTasks = [buildTask("朝散歩", "task_1", 0), buildTask("夜ごはん", "task_2", 1)];
  const { getByRole, getByText } = renderWithMantine(<DogTaskList />);

  expect(getByText("朝散歩")).toBeDefined();
  expect(getByText("夜ごはん")).toBeDefined();
  expect(getByRole("button", { name: "朝散歩 をドラッグして並び替え" })).toBeDefined();
  expect(getByRole("button", { name: "夜ごはん をドラッグして並び替え" })).toBeDefined();
});

test("DogTaskRow archives and renames a task", async () => {
  const onArchive = vi.fn();
  const onRename = vi.fn();
  const task = buildTask("朝散歩", "task_1", 0);
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithMantine(
    <DndContext>
      <SortableContext items={[task._id]}>
        <DogTaskRow onArchive={onArchive} onRename={onRename} task={task} />
      </SortableContext>
    </DndContext>,
  );

  await user.click(getByLabelText("削除"));

  expect(onArchive).toHaveBeenCalledWith(task);

  await user.click(getByLabelText("名前を変更"));
  await user.clear(getByLabelText("タスク名"));
  await user.type(getByLabelText("タスク名"), "夕散歩");
  await user.click(getByRole("button", { name: "保存する" }));

  expect(onRename).toHaveBeenCalledWith(task._id, "夕散歩");
});
