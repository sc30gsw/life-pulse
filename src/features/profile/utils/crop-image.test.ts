// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vite-plus/test";

import { cropImageToAvatarBlob } from "~/features/profile/utils/crop-image";

const originalCreateElement = document.createElement.bind(document);
const originalImage = globalThis.Image;

afterEach(() => {
  document.createElement = originalCreateElement;
  globalThis.Image = originalImage;
  vi.restoreAllMocks();
});

test("cropImageToAvatarBlob draws the requested crop into a 256px jpeg blob", async () => {
  const drawImage = vi.fn();
  const blob = new Blob(["avatar"], { type: "image/jpeg" });
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName !== "canvas") {
      return originalCreateElement(tagName);
    }

    return {
      height: 0,
      getContext: () => ({ drawImage }),
      toBlob: (callback: BlobCallback) => callback(blob),
      width: 0,
    } as unknown as HTMLCanvasElement;
  });
  installLoadingImage();

  await expect(
    cropImageToAvatarBlob("blob:avatar", { height: 40, width: 30, x: 10, y: 20 }),
  ).resolves.toBe(blob);
  expect(drawImage).toHaveBeenCalledWith(expect.any(Object), 10, 20, 30, 40, 0, 0, 256, 256);
});

test("cropImageToAvatarBlob rejects when canvas context is unavailable", async () => {
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName !== "canvas") {
      return originalCreateElement(tagName);
    }

    return {
      getContext: () => null,
      height: 0,
      width: 0,
    } as unknown as HTMLCanvasElement;
  });
  installLoadingImage();

  await expect(
    cropImageToAvatarBlob("blob:avatar", { height: 40, width: 30, x: 10, y: 20 }),
  ).rejects.toThrow("CANVAS_UNAVAILABLE");
});

test("cropImageToAvatarBlob rejects when image loading fails", async () => {
  installFailingImage();

  await expect(
    cropImageToAvatarBlob("blob:avatar", { height: 40, width: 30, x: 10, y: 20 }),
  ).rejects.toThrow("IMAGE_LOAD_FAILED");
});

function installLoadingImage() {
  globalThis.Image = class {
    addEventListener(event: string, callback: () => void) {
      if (event === "load") {
        setTimeout(callback, 0);
      }
    }

    set src(_value: string) {}
  } as unknown as typeof Image;
}

function installFailingImage() {
  globalThis.Image = class {
    addEventListener(event: string, callback: () => void) {
      if (event === "error") {
        setTimeout(callback, 0);
      }
    }

    set src(_value: string) {}
  } as unknown as typeof Image;
}
