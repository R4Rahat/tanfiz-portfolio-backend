import express from "express";

import { requireAdmin } from "../../middleware/auth.middleware.js";
import { getMe, login, logout } from "./admin.controller.js";

const router = express.Router();

// Public
router.post("/login", login);

// Protected
router.post("/logout", requireAdmin, logout);

router.get("/me", requireAdmin, getMe);

export default router;
