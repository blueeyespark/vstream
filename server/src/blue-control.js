import crypto from "node:crypto";
import { requireAuth } from "./session.js";

const LEVELS = ["observe","guide","work-with-me","trusted","full-task"];
const APPROVAL_ACTIONS = new Set(["desktop-control","publish","delete","payment","external-message","account-change"]);

function permission(db,userId) {
  return db.prepare("SELECT action_level,updated_at FROM blue_permissions WHERE owner_user_id=?").get(userId)
    || {action_level:"guide",updated_at:null};
}

export function blueControlRoutes(app,db) {
  app.get("/v1/blue/permissions",requireAuth(db),(req,res)=>res.json(permission(db,req.user.id)));

  app.put("/v1/blue/permissions",requireAuth(db),(req,res)=>{
    const level=String(req.body?.action_level||"");
    if(!LEVELS.includes(level)) return res.status(400).json({message:"Invalid Blue action level",allowed:LEVELS});
    const now=new Date().toISOString();
    db.prepare(`INSERT INTO blue_permissions(owner_user_id,action_level,updated_at) VALUES(?,?,?)
      ON CONFLICT(owner_user_id) DO UPDATE SET action_level=excluded.action_level,updated_at=excluded.updated_at`).run(req.user.id,level,now);
    res.json({action_level:level,updated_at:now});
  });

  app.get("/v1/blue/actions",requireAuth(db),(req,res)=>{
    const actions=db.prepare("SELECT * FROM blue_actions WHERE owner_user_id=? ORDER BY created_at DESC LIMIT 100").all(req.user.id)
      .map(x=>({...x,requires_approval:Boolean(x.requires_approval),input:JSON.parse(x.input_json||"{}"),result:x.result_json?JSON.parse(x.result_json):null,rollback:x.rollback_json?JSON.parse(x.rollback_json):null}));
    res.json({actions});
  });

  app.post("/v1/blue/actions",requireAuth(db),(req,res)=>{
    const actionType=String(req.body?.action_type||"").trim();
    if(!actionType) return res.status(400).json({message:"action_type is required"});
    const p=permission(db,req.user.id), sensitive=APPROVAL_ACTIONS.has(actionType) || req.body?.risk==="high";
    const canAct=["work-with-me","trusted","full-task"].includes(p.action_level);
    const requiresApproval=sensitive || p.action_level==="work-with-me";
    const status=!canAct?"blocked":requiresApproval?"pending-approval":"ready";
    const id=crypto.randomUUID(),now=new Date().toISOString();
    db.prepare(`INSERT INTO blue_actions(id,owner_user_id,conversation_id,action_type,risk,status,requires_approval,reason,input_json,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,req.user.id,req.body?.conversation_id||null,actionType,req.body?.risk||"low",status,requiresApproval?1:0,req.body?.reason||null,JSON.stringify(req.body?.input||{}),now,now);
    res.status(201).json({id,action_type:actionType,status,requires_approval:requiresApproval,action_level:p.action_level});
  });

  app.post("/v1/blue/actions/:id/approve",requireAuth(db),(req,res)=>{
    const action=db.prepare("SELECT * FROM blue_actions WHERE id=? AND owner_user_id=?").get(req.params.id,req.user.id);
    if(!action) return res.status(404).json({message:"Action not found"});
    if(action.status!=="pending-approval") return res.status(409).json({message:"Action is not awaiting approval",status:action.status});
    const now=new Date().toISOString();
    db.prepare("UPDATE blue_actions SET status='ready',approved_at=?,updated_at=? WHERE id=?").run(now,now,action.id);
    res.json({id:action.id,status:"ready",approved_at:now});
  });

  app.post("/v1/blue/actions/:id/verify",requireAuth(db),(req,res)=>{
    const action=db.prepare("SELECT * FROM blue_actions WHERE id=? AND owner_user_id=?").get(req.params.id,req.user.id);
    if(!action) return res.status(404).json({message:"Action not found"});
    const status=String(req.body?.verification_status||"");
    if(!["verified","failed","unverified"].includes(status)) return res.status(400).json({message:"Invalid verification status"});
    const now=new Date().toISOString();
    db.prepare("UPDATE blue_actions SET verification_status=?,result_json=?,rollback_json=?,updated_at=? WHERE id=?")
      .run(status,JSON.stringify(req.body?.result||{}),req.body?.rollback?JSON.stringify(req.body.rollback):null,now,action.id);
    res.json({id:action.id,verification_status:status});
  });
}
