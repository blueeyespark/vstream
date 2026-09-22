import crypto from "node:crypto";
import { requireAuth } from "./session.js";

const TYPES=new Set(["fact","preference","project","learning","creator","instruction"]);
const SCOPES=new Set(["personal","vstream","creator","academy","build"]);

export function blueMemoryRoutes(app,db) {
  app.get("/v1/blue/memory",requireAuth(db),(req,res)=>{
    const scope=req.query.scope ? String(req.query.scope) : null;
    const rows=scope
      ? db.prepare("SELECT * FROM blue_memory WHERE owner_user_id=? AND scope=? AND status='approved' ORDER BY updated_at DESC LIMIT 200").all(req.user.id,scope)
      : db.prepare("SELECT * FROM blue_memory WHERE owner_user_id=? AND status='approved' ORDER BY updated_at DESC LIMIT 200").all(req.user.id);
    res.json({memories:rows.map(x=>({...x,provenance:JSON.parse(x.provenance_json||"{}")}))});
  });

  app.post("/v1/blue/memory",requireAuth(db),(req,res)=>{
    const type=String(req.body?.memory_type||"fact"),scope=String(req.body?.scope||"personal"),content=String(req.body?.content||"").trim();
    if(!TYPES.has(type)) return res.status(400).json({message:"Invalid memory_type"});
    if(!SCOPES.has(scope)) return res.status(400).json({message:"Invalid memory scope"});
    if(!content) return res.status(400).json({message:"content is required"});
    const id=crypto.randomUUID(),now=new Date().toISOString();
    db.prepare("INSERT INTO blue_memory(id,owner_user_id,memory_type,scope,content,source,provenance_json,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
      .run(id,req.user.id,type,scope,content,"user-approved",JSON.stringify(req.body?.provenance||{}),"approved",now,now);
    res.status(201).json({id,memory_type:type,scope,content,source:"user-approved",status:"approved",created_at:now,updated_at:now});
  });

  app.delete("/v1/blue/memory/:id",requireAuth(db),(req,res)=>{
    const info=db.prepare("DELETE FROM blue_memory WHERE id=? AND owner_user_id=?").run(req.params.id,req.user.id);
    if(!info.changes) return res.status(404).json({message:"Memory not found"});
    res.status(204).end();
  });

  app.get("/v1/blue/results",requireAuth(db),(req,res)=>{
    const rows=db.prepare("SELECT * FROM blue_results WHERE owner_user_id=? ORDER BY created_at DESC LIMIT 200").all(req.user.id);
    res.json({results:rows.map(x=>({...x,data:JSON.parse(x.data_json||"{}")}))});
  });

  app.post("/v1/blue/results",requireAuth(db),(req,res)=>{
    const type=String(req.body?.result_type||"").trim(),title=String(req.body?.title||"").trim();
    if(!type) return res.status(400).json({message:"result_type is required"});
    const id=crypto.randomUUID(),now=new Date().toISOString();
    db.prepare("INSERT INTO blue_results(id,conversation_id,owner_user_id,result_type,title,data_json,verification_status,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(id,req.body?.conversation_id||null,req.user.id,type,title||null,JSON.stringify(req.body?.data||{}),req.body?.verification_status||"unverified",now);
    res.status(201).json({id,conversation_id:req.body?.conversation_id||null,result_type:type,title:title||null,data:req.body?.data||{},verification_status:req.body?.verification_status||"unverified",created_at:now});
  });
}
