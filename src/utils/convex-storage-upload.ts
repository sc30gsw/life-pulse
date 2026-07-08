import type { Id } from "~/../convex/_generated/dataModel";

export async function uploadBlobToConvexStorage(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    body: blob,
    headers: { "Content-Type": contentType },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("CONVEX_STORAGE_UPLOAD_FAILED");
  }

  const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };

  return storageId;
}
