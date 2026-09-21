import crypto from "node:crypto";

export const SESSION_COOKIE = "blue_session";
export const hashSessionToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

export function sessionUser(req, db) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  return db.prepare(`
    SELECT u.id,u.email,u.display_name,u.avatar_url,u.role
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.id=? AND s.expires_at>?
  `).get(hashSessionToken(token), new Date().toISOString()) || null;
}

export const requireAuth = (db) => (req,res,next) => {
  const user=sessionUser(req,db);
  if(!user) return res.status(401).json({message:"Authentication required"});
  req.user=user;
  next();
};
