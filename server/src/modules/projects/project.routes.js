import { Router } from "express";
import * as c from "./project.controller.js";
import { uploadMedia, uploadThumbnail } from "../../middleware/upload.js";
import { requireAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// public
router.get("/", c.list);
router.get("/slug/:slug", c.getBySlug);

// admin: projects (static paths like /reorder must come before /:id)
router.post("/", requireAdmin, c.create);
router.patch("/reorder", requireAdmin, c.reorder);
router.patch("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);

// admin: thumbnail
router.put("/:id/thumbnail", requireAdmin, uploadThumbnail, c.setThumbnail);
router.delete("/:id/thumbnail", requireAdmin, c.removeThumbnail);

// admin: media
router.post("/:id/media", requireAdmin, uploadMedia, c.addMedia);
router.patch("/:id/media/reorder", requireAdmin, c.reorderMedia);
router.patch("/:id/media/:mediaId", requireAdmin, c.updateMediaAlt);
router.delete("/:id/media/:mediaId", requireAdmin, c.removeMedia);

export default router;
