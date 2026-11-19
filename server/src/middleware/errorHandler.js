import multer from "multer";

export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
  });
}
