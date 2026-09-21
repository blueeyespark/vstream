import crypto from "node:crypto";

const parse = (row) => row ? { id: row.id, ...JSON.parse(row.data_json), created_at: row.created_at, updated_at: row.updated_at } : null;
const rows = (db,type) => db.prepare("SELECT * FROM entities WHERE entity_type=? ORDER BY updated_at DESC").all(type).map(parse);
const create = (db,type,data) => {
  const id=crypto.randomUUID(), now=new Date().toISOString();
  db.prepare("INSERT INTO entities(id,entity_type,data_json,created_at,updated_at) VALUES(?,?,?,?,?)").run(id,type,JSON.stringify(data),now,now);
  return {id,...data,created_at:now,updated_at:now};
};
const currentUser = (req,db) => {
  const sid=req.cookies?.blue_session;
  if(!sid) return null;
  return db.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?").get(sid,new Date().toISOString()) || null;
};

export function functionRoutes(app, db) {
  app.post("/v1/functions/:name", async (req,res) => {
    try {
      const name=req.params.name;
      if(name==="createChannel") {
        const user=currentUser(req,db);
        if(!user) return res.status(401).json({error:"Unauthorized"});
        const channel_name=String(req.body?.channel_name||"").trim();
        if(!channel_name) return res.status(400).json({error:"Channel name is required"});
        if(rows(db,"Channel").some(x=>x.channel_name?.toLowerCase()===channel_name.toLowerCase()))
          return res.status(409).json({error:"Channel name already taken"});
        const channel=create(db,"Channel",{creator_email:user.email,channel_name,description:req.body?.description||"",rtmp_key:crypto.randomBytes(24).toString("hex"),categories:req.body?.categories||[]});
        return res.json({data:{channel},message:"Channel created successfully"});
      }

      if(name==="submitTalentApplication") {
        const b=req.body||{}, email=String(b.email||"").trim().toLowerCase();
        if(!b.full_name||!email||!b.channel_name||!b.bio) return res.status(400).json({error:"Missing required fields"});
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Invalid email address"});
        if(rows(db,"TalentApplication").some(x=>x.email?.toLowerCase()===email))
          return res.status(409).json({error:"An application with this email already exists",duplicate:true});
        const application=create(db,"TalentApplication",{...b,email,status:"pending"});
        return res.json({data:{success:true,application_id:application.id},success:true,application_id:application.id});
      }

      return res.status(501).json({error:`Blue function '${name}' has not been ported yet`});
    } catch(error) {
      console.error("Blue function error",error);
      return res.status(500).json({error:error.message});
    }
  });
}
