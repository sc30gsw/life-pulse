import type { Area } from "react-easy-crop";

const AVATAR_SIZE = 256;

export async function cropImageToAvatarBlob(imageSrc: string, crop: Area) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");

  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("CANVAS_UNAVAILABLE");
  }

  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error("AVATAR_ENCODE_FAILED"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("IMAGE_LOAD_FAILED")));
    image.src = src;
  });
}
