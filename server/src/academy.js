import { newId } from "./db.js";
import { requireAuth } from "./session.js";

const now=()=>new Date().toISOString();
const json=row=>row?{...row,metadata:JSON.parse(row.metadata_json||"{}")}:null;
export function academyRoutes(app,db){
 const auth=requireAuth(db);
 const seedAcademy=()=>{
  const t=now(),courseId="academy-course-3d-modeling";
  if(!db.prepare("SELECT id FROM academy_courses WHERE slug=?").get("3d-modeling-fundamentals")){
   db.prepare("INSERT INTO academy_courses(id,slug,title,summary,status,metadata_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run(courseId,"3d-modeling-fundamentals","3D Modeling Fundamentals","Learn professional Blender foundations through real project work, critique and revision.","preview",JSON.stringify({tool:"Blender",delivery:"Instructor-led • Blue-supported"}),t,t);
   const mods=[["academy-module-blender-foundations","Blender Foundations","Workspace, navigation, transforms and non-destructive habits.",1],["academy-module-modeling","Modeling Fundamentals","Build clean geometry using professional modeling workflows.",2],["academy-module-materials","Materials & Presentation","Materials, lighting and presentation for review.",3],["academy-module-final","Final Project","Submit, receive feedback, revise and prepare portfolio work.",4]];
   const ins=db.prepare("INSERT INTO academy_modules(id,course_id,title,summary,position,metadata_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)");mods.forEach(m=>ins.run(m[0],courseId,m[1],m[2],m[3],"{}",t,t));
   const lessons=[["academy-lesson-workspace","academy-module-blender-foundations","Welcome & Blender Workspace","Course expectations, navigation and professional file habits.",1],["academy-lesson-transforms","academy-module-blender-foundations","Transforms & Object Discipline","Move, rotate, scale, origins and clean scene organization.",2],["academy-lesson-first-model","academy-module-blender-foundations","First Modeling Exercise","Model a simple production-ready prop from a starter brief.",3]];
   const il=db.prepare("INSERT INTO academy_lessons(id,course_id,module_id,title,summary,content,position,status,metadata_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)");lessons.forEach(l=>il.run(l[0],courseId,l[1],l[2],l[3],"Instructor-authored lesson content will live here.",l[4],"published","{}",t,t));
   db.prepare("INSERT INTO academy_assignments(id,course_id,module_id,title,summary,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run("academy-assignment-first-prop",courseId,"academy-module-blender-foundations","First Production-Ready Prop","Submit a versioned Blender project showing clean transforms, organization and basic modeling discipline.","published",t,t);
  }
 };
 seedAcademy();
 app.get("/v1/academy/me/dashboard",auth,(req,res)=>{
  const enrollments=db.prepare(`SELECT e.*,c.title,c.slug,c.summary,c.status AS course_status FROM academy_enrollments e JOIN academy_courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.updated_at DESC`).all(req.user.id);
  const submissions=db.prepare(`SELECT s.*,a.title AS assignment_title,a.course_id FROM academy_submissions s JOIN academy_assignments a ON a.id=s.assignment_id WHERE s.student_user_id=? ORDER BY s.updated_at DESC LIMIT 12`).all(req.user.id);
  res.json({enrollments,submissions,progress:{courses:enrollments.length,completed_courses:enrollments.filter(x=>x.status==="completed").length,average_percent:enrollments.length?Math.round(enrollments.reduce((n,x)=>n+(x.progress_percent||0),0)/enrollments.length):0}});
 });
 app.get("/v1/academy/courses",auth,(_req,res)=>res.json(db.prepare("SELECT id,slug,title,summary,status,created_at,updated_at FROM academy_courses WHERE status IN ('published','preview') ORDER BY title").all()));
 app.get("/v1/academy/courses/:slug",auth,(req,res)=>{
  const course=db.prepare("SELECT * FROM academy_courses WHERE slug=?").get(req.params.slug); if(!course)return res.status(404).json({message:"Course not found"});
  const modules=db.prepare("SELECT * FROM academy_modules WHERE course_id=? ORDER BY position").all(course.id);
  const lessons=db.prepare("SELECT * FROM academy_lessons WHERE course_id=? ORDER BY module_id,position").all(course.id);
  const assignments=db.prepare("SELECT id,course_id,module_id,title,summary,due_at,status FROM academy_assignments WHERE course_id=? ORDER BY created_at").all(course.id);
  const enrollment=db.prepare("SELECT * FROM academy_enrollments WHERE course_id=? AND user_id=?").get(course.id,req.user.id)||null;
  res.json({...json(course),modules:modules.map(json),lessons:lessons.map(json),assignments,enrollment});
 });
 app.post("/v1/academy/courses/:courseId/enroll",auth,(req,res)=>{
  const course=db.prepare("SELECT id FROM academy_courses WHERE id=?").get(req.params.courseId);if(!course)return res.status(404).json({message:"Course not found"});
  const existing=db.prepare("SELECT * FROM academy_enrollments WHERE course_id=? AND user_id=?").get(course.id,req.user.id);if(existing)return res.json(existing);
  const id=newId(),t=now();db.prepare("INSERT INTO academy_enrollments(id,course_id,user_id,status,progress_percent,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run(id,course.id,req.user.id,"active",0,t,t);
  res.status(201).json(db.prepare("SELECT * FROM academy_enrollments WHERE id=?").get(id));
 });
 app.patch("/v1/academy/enrollments/:id/progress",auth,(req,res)=>{
  const value=Math.max(0,Math.min(100,Number(req.body?.progress_percent)||0)),t=now();
  const out=db.prepare("UPDATE academy_enrollments SET progress_percent=?,status=?,updated_at=? WHERE id=? AND user_id=?").run(value,value===100?"completed":"active",t,req.params.id,req.user.id);
  if(!out.changes)return res.status(404).json({message:"Enrollment not found"});res.json(db.prepare("SELECT * FROM academy_enrollments WHERE id=?").get(req.params.id));
 });
 app.post("/v1/academy/assignments/:assignmentId/submissions",auth,(req,res)=>{
  const assignment=db.prepare("SELECT * FROM academy_assignments WHERE id=?").get(req.params.assignmentId);if(!assignment)return res.status(404).json({message:"Assignment not found"});
  const enrollment=db.prepare("SELECT id FROM academy_enrollments WHERE course_id=? AND user_id=?").get(assignment.course_id,req.user.id);if(!enrollment)return res.status(403).json({message:"Enrollment required"});
  const id=newId(),t=now(),note=String(req.body?.note||"").slice(0,5000),fileId=req.body?.file_id||null;
  if(fileId&&!db.prepare("SELECT id FROM files WHERE id=? AND owner_user_id=?").get(fileId,req.user.id))return res.status(400).json({message:"Invalid file"});
  db.prepare("INSERT INTO academy_submissions(id,assignment_id,student_user_id,file_id,note,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").run(id,assignment.id,req.user.id,fileId,note,"submitted",t,t);
  res.status(201).json(db.prepare("SELECT * FROM academy_submissions WHERE id=?").get(id));
 });
}
