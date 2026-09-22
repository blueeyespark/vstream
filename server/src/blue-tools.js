import crypto from "node:crypto";
import { requireAuth } from "./session.js";

const READABLE_ENTITY_TYPES=new Set(["Project","Task","Channel","Video","MediaAsset","Playlist","Schedule","ContentTemplate"]);
const WRITABLE_ENTITY_TYPES=new Set(["Project","Task","Schedule","ContentTemplate"]);
const TYPE_ALIASES={project:"Project",projects:"Project",task:"Task",tasks:"Task",channel:"Channel",channels:"Channel",video:"Video",videos:"Video",media:"MediaAsset",playlist:"Playlist",schedule:"Schedule"};

function entity(row) {
  return {id:row.id,...JSON.parse(row.data_json),created_at:row.created_at,updated_at:row.updated_at};
  app.post("/v1/blue/resources/:type/:id/propose-update",requireAuth(db),(req,res)=>{
    const requested=String(req.params.type||"").toLowerCase();
    const type=TYPE_ALIASES[requested] || req.params.type;
    if(!WRITABLE_ENTITY_TYPES.has(type)) return res.status(400).json({message:"Resource type is not writable by Blue"});
    const row=db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=? AND owner_user_id=?").get(type,req.params.id,req.user.id);
    if(!row) return res.status(404).json({message:"Resource not found"});
    const patch=req.body?.patch;
    if(!patch || typeof patch!=="object" || Array.isArray(patch)) return res.status(400).json({message:"patch object is required"});
    const permission=db.prepare("SELECT action_level FROM blue_permissions WHERE owner_user_id=?").get(req.user.id)?.action_level || "guide";
    const canAct=["work-with-me","trusted","full-task"].includes(permission);
    const requiresApproval=permission==="work-with-me" || Boolean(req.body?.requires_approval);
    const id=crypto.randomUUID(),now=new Date().toISOString();
    const status=!canAct ? "blocked" : requiresApproval ? "pending-approval" : "ready";
    db.prepare("INSERT INTO blue_actions(id,owner_user_id,conversation_id,action_type,risk,status,requires_approval,reason,input_json,verification_status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(id,req.user.id,req.body?.conversation_id||null,"update-resource","low",status,requiresApproval?1:0,String(req.body?.reason||`Update ${type}`),JSON.stringify({type,id:req.params.id,patch}),"unverified",now,now);
    res.status(201).json({id,action_type:"update-resource",resource_type:type,resource_id:req.params.id,status,requires_approval:requiresApproval,permission_level:permission,patch});
  });
}

export function blueToolRoutes(app,db) {
  app.get("/v1/blue/tools",requireAuth(db),(_req,res)=>res.json({
    tools:[
      {name:"list-resources",status:"working",access:"read-only",types:[...READABLE_ENTITY_TYPES]},
      {name:"get-resource",status:"working",access:"read-only",types:[...READABLE_ENTITY_TYPES]},
    ],
    mutations:{status:"approval-gated",available:true,types:[...WRITABLE_ENTITY_TYPES]},
  }));

  app.get("/v1/blue/resources/:type",requireAuth(db),(req,res)=>{
    const requested=String(req.params.type||"").toLowerCase();
    const type=TYPE_ALIASES[requested] || req.params.type;
    if(!READABLE_ENTITY_TYPES.has(type)) return res.status(400).json({message:"Resource type is not available to Blue"});
    const limit=Math.min(Math.max(Number(req.query.limit)||50,1),100);
    const rows=db.prepare("SELECT * FROM entities WHERE entity_type=? AND owner_user_id=? ORDER BY updated_at DESC LIMIT ?").all(type,req.user.id,limit);
    res.json({type,access:"read-only",resources:rows.map(entity)});
  });

  app.get("/v1/blue/resources/:type/:id",requireAuth(db),(req,res)=>{
    const requested=String(req.params.type||"").toLowerCase();
    const type=TYPE_ALIASES[requested] || req.params.type;
    if(!READABLE_ENTITY_TYPES.has(type)) return res.status(400).json({message:"Resource type is not available to Blue"});
    const row=db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=? AND owner_user_id=?").get(type,req.params.id,req.user.id);
    if(!row) return res.status(404).json({message:"Resource not found"});
    res.json({type,access:"read-only",resource:entity(row)});
  });
}
