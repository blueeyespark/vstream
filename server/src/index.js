import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createDatabase } from "./db.js";
import { authRoutes } from "./auth.js";
import { entityRoutes } from "./entities.js";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 8787);
const dataDir = path.resolve(process.env.BLUE_DATA_DIR || "./.blue-data");
const uploadDir = path.join(dataDir, "uploads");
await fs.mkdir(uploadDir, { recursive: true });
const db = createDatabase(dataDir);

app.use(cors({ origin: process.env.BLUE_WEB_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true, service: "blue-vstream-api", provider: "owned" }));

authRoutes(app, db);
entityRoutes(app, db);

const upload = multer({ dest: uploadDir, limits: { fileSize: Number(process.env.BLUE_MAX_UPLOAD_BYTES || 536870912) } });
app.post("/v1/storage/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "file is required" });
  const id = crypto.randomUUID();
  const ext = path.extname(req.file.originalname);
  const storedName = `${id}${ext}`;
  await fs.rename(req.file.path, path.join(uploadDir, storedName));
  res.status(201).json({ id, name: req.file.originalname, size: req.file.size, key: storedName, provider: "owned-local" });
});

app.post("/v1/ai/generate", (_req, res) => {
  res.status(501).json({ message: "No owned AI provider configured yet" });
});

app.listen(port, () => console.log(`Blue VStream API listening on :${port}`));
