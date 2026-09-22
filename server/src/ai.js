import { requireAuth } from "./session.js";
import crypto from "node:crypto";

const MODES = new Set(["teacher", "build", "creator", "stream", "desktop", "companion"]);

function providerConfig() {
  const provider = String(process.env.BLUE_AI_PROVIDER || "none").toLowerCase();
  if (provider === "openai-compatible") {
    return {
      provider,
      baseUrl: String(process.env.BLUE_AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
      apiKey: process.env.BLUE_AI_API_KEY || "",
      model: process.env.BLUE_AI_MODEL || "gpt-4.1-mini",
    };
  }
  if (provider === "ollama") {
    return {
      provider,
      baseUrl: String(process.env.BLUE_AI_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
      model: process.env.BLUE_AI_MODEL || "qwen3",
    };
  }
  return { provider: "none" };
}

export function capabilitySnapshot() {
  const cfg = providerConfig();
  return {
    identity: { name: "Blue", model_independent: true, default_mode: "teacher" },
    capabilities: {
      chat: cfg.provider === "none" ? "unavailable" : "working",
      teacher: cfg.provider === "none" ? "planner-only" : "working",
      creator: cfg.provider === "none" ? "planner-only" : "working",
      build: "partial",
      stream: "partial",
      desktop: "approval-gated",
      transcription: "unavailable",
    },
    provider: { type: cfg.provider, configured: cfg.provider !== "none", model: cfg.model || null },
  };
}

function systemPrompt(mode) {
  return `You are Blue, one persistent model-independent AI identity across VStream, CreatorOS, Blue Academy, desktop, phone and XR surfaces.
Your current mode is ${mode}. Teacher is the default mode.
Be truthful about capabilities. Never claim an action was executed unless the application provides a verified tool result.
Help the user learn rather than hiding the reasoning needed to complete their work. Respect permissions and ask for approval before sensitive external or device actions.
In creator mode, help with the full creator lifecycle while preserving the user's control and ownership.
In build mode, prefer plan -> inspect -> edit -> run -> fix -> verify, but do not claim file/terminal access unless tools actually provided it.
Do not reveal secrets, credentials, private memory, or unrelated persona context.`;
}

function normalizeRequest(body = {}) {
  const mode = MODES.has(body.mode) ? body.mode : "teacher";
  const messages = Array.isArray(body.messages)
    ? body.messages.filter(x => x && ["user", "assistant"].includes(x.role) && typeof x.content === "string").slice(-30)
    : [];
  if (typeof body.prompt === "string" && body.prompt.trim()) messages.push({ role: "user", content: body.prompt.trim() });
  return { mode, messages };
}

async function generate(cfg, mode, messages) {
  const system = { role: "system", content: systemPrompt(mode) };
  if (cfg.provider === "openai-compatible") {
    if (!cfg.apiKey) throw Object.assign(new Error("BLUE_AI_API_KEY is required for openai-compatible provider"), { status: 503 });
    const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({ model: cfg.model, messages: [system, ...messages] }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(json?.error?.message || `AI provider failed (${response.status})`), { status: 502 });
    return { response: json?.choices?.[0]?.message?.content || "", provider: cfg.provider, model: cfg.model, mode };
  }
  if (cfg.provider === "ollama") {
    const response = await fetch(`${cfg.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: cfg.model, stream: false, messages: [system, ...messages] }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(json?.error || `AI provider failed (${response.status})`), { status: 502 });
    return { response: json?.message?.content || "", provider: cfg.provider, model: cfg.model, mode };
  }
  throw Object.assign(new Error("No Blue AI provider configured"), { status: 503 });
}

function ensureConversation(db, userId, requestedId, mode, prompt) {
  if (requestedId) {
    const existing=db.prepare("SELECT * FROM blue_conversations WHERE id=? AND owner_user_id=?").get(requestedId,userId);
    if (!existing) throw Object.assign(new Error("Conversation not found"),{status:404});
    if (existing.mode !== mode) db.prepare("UPDATE blue_conversations SET mode=?,updated_at=? WHERE id=?").run(mode,new Date().toISOString(),existing.id);
    return existing.id;
  }
  const id=crypto.randomUUID(), now=new Date().toISOString();
  const title=String(prompt||"New conversation").replace(/\s+/g," ").trim().slice(0,80) || "New conversation";
  db.prepare("INSERT INTO blue_conversations(id,owner_user_id,title,mode,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(id,userId,title,mode,now,now);
  return id;
}

function saveMessage(db, conversationId, userId, role, content, provider=null, model=null) {
  const id=crypto.randomUUID(), now=new Date().toISOString();
  db.prepare("INSERT INTO blue_messages(id,conversation_id,owner_user_id,role,content,provider,model,created_at) VALUES(?,?,?,?,?,?,?,?)").run(id,conversationId,userId,role,content,provider,model,now);
  db.prepare("UPDATE blue_conversations SET updated_at=? WHERE id=? AND owner_user_id=?").run(now,conversationId,userId);
  return {id,conversation_id:conversationId,role,content,provider,model,created_at:now};
}

export function aiRoutes(app, db) {
  app.get("/v1/ai/capabilities", requireAuth(db), (_req, res) => res.json(capabilitySnapshot()));

  app.get("/v1/ai/conversations", requireAuth(db), (req,res) => {
    const conversations=db.prepare("SELECT id,title,mode,created_at,updated_at FROM blue_conversations WHERE owner_user_id=? ORDER BY updated_at DESC").all(req.user.id);
    res.json({conversations});
  });

  app.get("/v1/ai/conversations/:id", requireAuth(db), (req,res) => {
    const conversation=db.prepare("SELECT id,title,mode,created_at,updated_at FROM blue_conversations WHERE id=? AND owner_user_id=?").get(req.params.id,req.user.id);
    if(!conversation) return res.status(404).json({message:"Conversation not found"});
    const messages=db.prepare("SELECT id,role,content,provider,model,created_at FROM blue_messages WHERE conversation_id=? AND owner_user_id=? ORDER BY created_at ASC").all(conversation.id,req.user.id);
    res.json({conversation,messages});
  });

  app.post("/v1/ai/generate", requireAuth(db), async (req, res) => {
    const { mode, messages } = normalizeRequest(req.body);
    if (!messages.length) return res.status(400).json({ message: "prompt or messages is required" });
    let conversationId;
    try {
      const lastUser=[...messages].reverse().find(x=>x.role==="user")?.content || "";
      conversationId=ensureConversation(db,req.user.id,req.body?.conversation_id,mode,lastUser);
      saveMessage(db,conversationId,req.user.id,"user",lastUser);
      const result=await generate(providerConfig(), mode, messages);
      const saved=saveMessage(db,conversationId,req.user.id,"assistant",result.response,result.provider,result.model);
      return res.json({...result,conversation_id:conversationId,message_id:saved.id});
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message, conversation_id: conversationId || null });
    }
  });

  app.post("/v1/ai/transcribe", requireAuth(db), (_req, res) => {
    res.status(501).json({ message: "Blue transcription is not configured", capability: "unavailable" });
  });
}
