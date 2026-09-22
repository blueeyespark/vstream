import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createDatabase } from "./db.js";
import { authRoutes } from "./auth.js";
import { entityRoutes } from "./entities.js";
import { functionRoutes } from "./functions.js";
import { requireAuth } from "./session.js";
import { mediaRoutes } from "./media.js";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { aiRoutes } from "./ai.js";
import { blueControlRoutes } from "./blue-control.js";
import { blueMemoryRoutes } from "./blue-memory.js";
import { blueToolRoutes } from "./blue-tools.js";
import { academyRoutes } from "./academy.js";

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
functionRoutes(app, db);
aiRoutes(app, db);
blueControlRoutes(app, db);
blueMemoryRoutes(app, db);
blueToolRoutes(app, db);
academyRoutes(app, db);

const upload = multer({ dest: uploadDir, limits: { fileSize: Number(process.env.BLUE_MAX_UPLOAD_BYTES || 536870912) } });
mediaRoutes(app, db, uploadDir, upload);
app.post("/v1/storage/upload", requireAuth(db), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "file is required" });
  const id = crypto.randomUUID();
  const ext = path.extname(req.file.originalname);
  const storedName = `${id}${ext}`;
  await fs.rename(req.file.path, path.join(uploadDir, storedName));
  const now = new Date().toISOString();
  db.prepare("INSERT INTO files(id,owner_user_id,stored_name,original_name,mime_type,size_bytes,visibility,created_at) VALUES(?,?,?,?,?,?,?,?)")
    .run(id,req.user.id,storedName,req.file.originalname,req.file.mimetype || null,req.file.size,"private",now);
  res.status(201).json({ id, name: req.file.originalname, size: req.file.size, mime_type: req.file.mimetype, url: `/v1/storage/files/${id}`, file_url: `/v1/storage/files/${id}`, visibility: "private", provider: "owned-local" });
});

app.get("/v1/storage/files/:id", requireAuth(db), async (req,res) => {
  const file=db.prepare("SELECT * FROM files WHERE id=? AND owner_user_id=?").get(req.params.id,req.user.id);
  if(!file) return res.status(404).json({message:"File not found"});
  res.type(file.mime_type || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.original_name)}"`);
  res.sendFile(path.join(uploadDir,file.stored_name));
});

app.delete("/v1/storage/files/:id", requireAuth(db), async (req,res) => {
  const file=db.prepare("SELECT * FROM files WHERE id=? AND owner_user_id=?").get(req.params.id,req.user.id);
  if(!file) return res.status(404).json({message:"File not found"});
  await fs.rm(path.join(uploadDir,file.stored_name),{force:true});
  db.prepare("DELETE FROM files WHERE id=? AND owner_user_id=?").run(file.id,req.user.id);
  res.status(204).end();
});


app.listen(port, () => console.log(`Blue VStream API listening on :${port}`));
