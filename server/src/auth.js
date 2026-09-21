import crypto from "node:crypto";

const COOKIE = "blue_session";
const DAYS = 30;

export function authRoutes(app, db) {
  app.get("/v1/auth/me", (req, res) => {
    const token = req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const session = db.prepare(`
      SELECT u.id, u.email, u.display_name, u.avatar_url, u.role, s.expires_at
      FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.id=? AND s.expires_at > ?
    `).get(token, new Date().toISOString());
    if (!session) return res.status(401).json({ message: "Session expired or invalid" });
    res.json({ id: session.id, email: session.email, display_name: session.display_name, avatar_url: session.avatar_url, role: session.role });
  });

  app.post("/v1/auth/logout", (req, res) => {
    const token = req.cookies?.[COOKIE];
    if (token) db.prepare("DELETE FROM sessions WHERE id=?").run(token);
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
    const sid=crypto.randomUUID(), expires=new Date(Date.now()+DAYS*86400000).toISOString();
    db.prepare("INSERT INTO sessions(id,user_id,expires_at,created_at) VALUES(?,?,?,?)").run(sid,user.id,expires,new Date().toISOString());
    res.cookie(COOKIE,sid,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:DAYS*86400000});
    res.json({id:user.id,email:user.email,display_name:user.display_name,role:user.role});
  });
}
