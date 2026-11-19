import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import errorHandler from "./middleware/error.middleware.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const port = process.env.PORT || 5000;
const allowedOrigins = (
  process.env.CLIENT_URL ||
  `http://localhost:5173,http://localhost:${port},http://127.0.0.1:${port}`
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin requests work without CORS headers. Only reflect the
      // configured origins; everything else simply gets no CORS approval.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);

// Unknown API routes should stay JSON (never fall through to the SPA).
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Serve the built React admin app (client/dist or server/public) as static.
const staticCandidates = [
  path.resolve(__dirname, "../public"),
  path.resolve(__dirname, "../../client/dist"),
];
const clientDist = staticCandidates.find((dir) =>
  fs.existsSync(path.join(dir, "index.html")),
);

if (clientDist) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "API is running. Build the client (npm run build) to serve the admin app.",
    });
  });
}

app.use(errorHandler);

export default app;
