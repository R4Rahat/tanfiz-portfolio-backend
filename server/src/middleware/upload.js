import multer from "multer";

export const MAX_FILES_PER_REQUEST = 10;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // hard cap; per-type caps are in media.service

// Memory storage: files go straight to ImageKit, never touch the VPS disk.
const storage = multer.memoryStorage();

// field name: "files" (many)
export const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_FILES_PER_REQUEST },
}).array("files", MAX_FILES_PER_REQUEST);

// field name: "thumbnail" (one)
export const uploadThumbnail = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
}).single("thumbnail");
