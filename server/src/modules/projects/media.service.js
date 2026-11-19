import { fileTypeFromBuffer } from "file-type";
import { imagekit } from "../../config/imagekit.js";
import { ApiError } from "../../utils/ApiError.js";

const MB = 1024 * 1024;
const MIME_TO_TYPE = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "gif",
};
const MAX_SIZE = { image: 10 * MB, gif: 15 * MB };

// Checks real file content (magic bytes), not the extension or browser MIME.
async function detectType(file, allowed = ["image", "gif"]) {
  const detected = await fileTypeFromBuffer(file.buffer);
  const type = detected && MIME_TO_TYPE[detected.mime];
  if (!type || !allowed.includes(type)) {
    const list = allowed.includes("gif")
      ? "JPG, PNG, WebP and GIF"
      : "JPG, PNG and WebP";
    throw new ApiError(400, `${file.originalname}: only ${list} are allowed`);
  }
  if (file.size > MAX_SIZE[type]) {
    throw new ApiError(
      413,
      `${file.originalname}: ${type} must be under ${MAX_SIZE[type] / MB}MB`,
    );
  }
  return type;
}

export async function deleteMany(fileIds) {
  const results = await Promise.allSettled(
    fileIds.map((id) => imagekit.deleteFile(id)),
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `ImageKit delete failed for ${fileIds[i]}:`,
        r.reason?.message,
      );
    }
  });
}

// Single file (used for thumbnails). GIFs are not allowed by default.
export async function uploadOne(file, folder, allowed = ["image"]) {
  await detectType(file, allowed);
  try {
    const res = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder,
      useUniqueFileName: true,
    });
    return { url: res.url, fileId: res.fileId };
  } catch (err) {
    console.error("ImageKit upload failed:", err.message);
    throw new ApiError(502, "Upload to ImageKit failed");
  }
}

// Validates everything first, then uploads. If any upload fails,
// the ones that succeeded are rolled back so nothing is orphaned.
export async function uploadMany(files, folder) {
  const typed = [];
  for (const file of files) typed.push({ file, type: await detectType(file) });

  const results = await Promise.allSettled(
    typed.map(({ file }) =>
      imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder,
        useUniqueFileName: true,
      }),
    ),
  );

  const uploaded = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  if (uploaded.length !== results.length) {
    await deleteMany(uploaded.map((u) => u.fileId));
    throw new ApiError(502, "Upload to ImageKit failed, nothing was saved");
  }

  return uploaded.map((u, i) => ({
    type: typed[i].type,
    url: u.url,
    fileId: u.fileId,
  }));
}
