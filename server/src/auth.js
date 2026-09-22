import crypto from "node:crypto";
import { SESSION_COOKIE as COOKIE, hashSessionToken, sessionUser } from "./session.js";

const DAYS = 30;

export function authRoutes(app, db) {
  app.get("/v1/auth/me", (req, res) => {
    const user = sessionUser(req, db);
    if (!user) return res.status(401).json({ message: "Session expired or invalid" });
    res.json(user);
  });

  app.post("/v1/auth/logout", (req, res) => {
    const token = req.cookies?.[COOKIE];
    if (token) db.prepare("DELETE FROM sessions WHERE id=?").run(hashSessionToken(token));
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax" });
    res.status(204).end();
  });

  // Development bootstrap only. Production login will use verified credentials/OAuth.
  app.post("/v1/auth/dev-login", (req, res) => {
    if (process.env.NODE_ENV === "production") return res.status(404).end();
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "email is required" });
    let user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
    if (!user) {
      const id = crypto.randomUUID(), now = new Date().toISOString();
      db.prepare("INSERT INTO users(id,email,display_name,created_at) VALUES(?,?,?,?)").run(id,email,req.body?.display_name || email.split("@")[0],now);
      user = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    }
    const sid=crypto.randomBytes(32).toString("base64url"), expires=new Date(Date.now()+DAYS*86400000).toISOString();
    db.prepare("INSERT INTO sessions(id,user_id,expires_at,created_at) VALUES(?,?,?,?)").run(hashSessionToken(sid),user.id,expires,new Date().toISOString());
    res.cookie(COOKIE,sid,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:DAYS*86400000});
    res.json({id:user.id,email:user.email,display_name:user.display_name,role:user.role});
  });
}
