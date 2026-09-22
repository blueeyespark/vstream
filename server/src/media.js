import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { requireAuth } from "./session.js";

const entity=(row)=>row?{id:row.id,...JSON.parse(row.data_json),created_at:row.created_at,updated_at:row.updated_at}:null;
const owned=(db,type,id,userId)=>entity(db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=? AND owner_user_id=?").get(type,id,userId));
const update=(db,type,id,userId,patch)=>{
 const row=db.prepare("SELECT * FROM entities WHERE entity_type=? AND id=? AND owner_user_id=?").get(type,id,userId);
 if(!row)return null;
 const data={...JSON.parse(row.data_json),...patch},now=new Date().toISOString();
 db.prepare("UPDATE entities SET data_json=?,updated_at=? WHERE id=? AND owner_user_id=?").run(JSON.stringify(data),now,id,userId);
 return {id,...data,created_at:row.created_at,updated_at:now};
};

export function mediaRoutes(app,db,uploadDir,upload) {
 const auth=requireAuth(db);
 app.post("/v1/media/video-upload",auth,upload.single("file"),async(req,res)=>{
   if(!req.file)return res.status(400).json({message:"file is required"});
   const fileId=crypto.randomUUID(),ext=path.extname(req.file.originalname),storedName=`${fileId}${ext}`,now=new Date().toISOString();
   await fs.rename(req.file.path,path.join(uploadDir,storedName));
   db.prepare("INSERT INTO files(id,owner_user_id,stored_name,original_name,mime_type,size_bytes,visibility,created_at) VALUES(?,?,?,?,?,?,?,?)")
    .run(fileId,req.user.id,storedName,req.file.originalname,req.file.mimetype||null,req.file.size,"private",now);
   const videoId=crypto.randomUUID();
   const data={channel_id:req.body?.channel_id||"",title:req.body?.title||path.parse(req.file.originalname).name,description:req.body?.description||"",status:"uploaded",visibility:"private",raw_file_id:fileId,transcoding_progress:0};
   db.prepare("INSERT INTO entities(id,entity_type,owner_user_id,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(videoId,"Video",req.user.id,JSON.stringify(data),now,now);
   res.status(201).json({video:{id:videoId,...data,created_at:now,updated_at:now},file:{id:fileId,url:`/v1/storage/files/${fileId}`}});
 });
 app.post("/v1/media/videos/:id/transcode",auth,(req,res)=>{
   const video=owned(db,"Video",req.params.id,req.user.id);
   if(!video)return res.status(404).json({message:"Video not found"});
   const jobId=crypto.randomUUID();
   const updated=update(db,"Video",video.id,req.user.id,{status:"processing",transcoding_progress:0,transcode_job_id:jobId});
   res.status(202).json({status:"queued",job_id:jobId,video:updated,message:"Owned transcoding queue contract created; worker is not configured yet."});
 });
 app.patch("/v1/media/videos/:id/edit",auth,(req,res)=>{
   const video=owned(db,"Video",req.params.id,req.user.id);
   if(!video)return res.status(404).json({message:"Video not found"});
   const edits={trim:{start:req.body?.start_time??0,end:req.body?.end_time??video.duration_seconds??null},effects:{brightness:req.body?.brightness??100,contrast:req.body?.contrast??100,volume:req.body?.volume??1},preset:req.body?.preset_name||"default",edited_at:new Date().toISOString(),edited_by:req.user.email};
   const updated=update(db,"Video",video.id,req.user.id,{edits,status:"edit_pending"});
   res.json({status:"success",video:updated,edits});
 });
}
