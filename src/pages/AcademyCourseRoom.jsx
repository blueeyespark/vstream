import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Boxes, CalendarDays, CheckCircle2, Download, FileBox, MessageSquare, UserRound, Target, BriefcaseBusiness } from "lucide-react";
import { useBlue } from "@/lib/BlueContext";
import { platform } from "@/platform/client";
import { useAuth } from "@/lib/AuthContext";

const modules=[
 {n:"01",title:"Blender Foundations",detail:"Workspace, navigation, transforms and non-destructive habits."},
 {n:"02",title:"Modeling Fundamentals",detail:"Build a clean prop using professional modeling workflows."},
 {n:"03",title:"Materials & Presentation",detail:"Materials, lighting and presentation for review."},
 {n:"04",title:"Final Project",detail:"Submit, receive faculty feedback, revise and prepare portfolio work."},
];

export default function AcademyCourseRoom(){
 const blue=useBlue(); const {isAuthenticated}=useAuth();
 const [course,setCourse]=useState(null),[loading,setLoading]=useState(isAuthenticated),[error,setError]=useState("");
 useEffect(()=>{if(!isAuthenticated){setLoading(false);return;} let live=true;platform.academy.course("3d-modeling-fundamentals").then(x=>{if(live)setCourse(x)}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[isAuthenticated]);
 const enroll=async()=>{try{setLoading(true);await platform.academy.enroll(course.id);setCourse(await platform.academy.course("3d-modeling-fundamentals"));setError("")}catch(e){setError(e.message)}finally{setLoading(false)}};
 const shownModules=course?.modules?.length?course.modules.map((m,i)=>({n:String(i+1).padStart(2,"0"),title:m.title,detail:m.summary||"Course module"})):modules;
 return <div className="min-h-[calc(100vh-4rem)] bg-[#03080f] text-white">
  <div className="border-b border-[#12305f]/70 bg-[#06101f]/85">
   <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
    <Link to="/Academy" className="inline-flex items-center gap-2 text-xs font-black text-[#7ddcff]"><ArrowLeft className="h-4 w-4"/> Student Home</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
     <div><p className="text-xs font-black uppercase tracking-[.2em] text-purple-300">Prototype course room</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">3D Modeling Fundamentals</h1><p className="mt-2 text-sm text-blue-100/55">Professional project learning • Blender • Instructor-led • Blue-supported</p></div>
     <button onClick={()=>blue?.setMode?.("teacher")} className="rounded-xl bg-[#1e78ff] px-5 py-3 text-sm font-black">Ask Blue Teacher</button>
    </div>
   </div>
  </div>
  <div className="border-b border-[#12305f]/60 bg-[#03080f]/90"><div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-2 sm:px-8"><span className="rounded-lg bg-[#1e78ff]/15 px-3 py-2 text-xs font-black text-[#7ddcff]">Overview</span><span className="rounded-lg px-3 py-2 text-xs font-black text-blue-100/35">Lessons</span><span className="rounded-lg px-3 py-2 text-xs font-black text-blue-100/35">Assignments</span><span className="rounded-lg px-3 py-2 text-xs font-black text-blue-100/35">Discussion</span><span className="rounded-lg px-3 py-2 text-xs font-black text-blue-100/35">Grades</span></div></div><main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
   <div className="space-y-6">
    <section className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-6">
     <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-[#00c8ff]"/><h2 className="text-xl font-black">Course modules</h2></div>
     <div className="mt-5 space-y-3">{shownModules.map((m,i)=><div key={m.n} className="flex gap-4 rounded-xl border border-[#12305f]/60 bg-[#03080f]/60 p-4"><span className="text-xs font-black text-[#00c8ff]">{m.n}</span><div className="flex-1"><h3 className="font-black">{m.title}</h3><p className="mt-1 text-sm leading-6 text-blue-100/50">{m.detail}</p></div>{i===0?<Link to="/Academy/Courses/3d-modeling-fundamentals/module-1" className="h-fit rounded-full bg-[#1e78ff]/15 px-2 py-1 text-[10px] font-black text-[#7ddcff]">OPEN</Link>:<span className="h-fit rounded-full bg-white/5 px-2 py-1 text-[10px] font-black text-white/30">BUILDING</span>}</div>)}</div>
    </section>
    <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-[#00c8ff]"/><h2 className="font-black">What you will prove</h2></div><p className="mt-3 text-sm leading-6 text-blue-100/50">Model clean geometry, organize a professional Blender project, present the work clearly, respond to critique and document meaningful revisions.</p></div><div className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-purple-300"/><h2 className="font-black">Professional outcome</h2></div><p className="mt-3 text-sm leading-6 text-blue-100/50">The final eligible project can become portfolio work instead of disappearing after a grade.</p></div></section><section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
     <div className="flex items-center gap-3"><Boxes className="h-5 w-5 text-purple-300"/><h2 className="text-xl font-black">Project workspace</h2></div>
     <p className="mt-3 text-sm leading-6 text-blue-100/55">The finished system will keep the working Blender project separate from versioned assignment snapshots so instructor feedback never destroys the student's current file.</p>
     <div className="mt-5 flex flex-wrap gap-3"><button disabled className="rounded-xl border border-[#12305f] px-4 py-2 text-xs font-black text-white/35"><Download className="mr-2 inline h-4 w-4"/>Starter .blend — building</button><button disabled className="rounded-xl border border-[#12305f] px-4 py-2 text-xs font-black text-white/35"><FileBox className="mr-2 inline h-4 w-4"/>Submit version — building</button></div>
    </section>
   </div>
   <aside className="space-y-4">
    <section className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#00c8ff]"/><h2 className="font-black">Instructor</h2></div><p className="mt-3 text-sm text-blue-100/50">No instructor assigned in this prototype. We won't invent faculty.</p></section>
    <section className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#00c8ff]"/><h2 className="font-black">Course status</h2></div>{loading?<p className="mt-3 text-sm text-blue-100/50">Loading your course status…</p>:course?.enrollment?<><p className="mt-3 text-sm font-black text-emerald-300">Enrolled • {course.enrollment.progress_percent}% complete</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#12305f]/60"><div className="h-full bg-emerald-400" style={{width:`${course.enrollment.progress_percent}%`}}/></div></>:isAuthenticated&&course?<button onClick={enroll} className="mt-4 w-full rounded-xl bg-[#1e78ff] px-4 py-2.5 text-xs font-black">Enroll in course</button>:<p className="mt-3 text-sm text-blue-100/50">Sign in to enroll and track progress.</p>}{error&&<p className="mt-3 text-xs text-amber-300">{error}</p>}</section>
    <section className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#00c8ff]"/><h2 className="font-black">Blue in this course</h2></div><p className="mt-3 text-sm leading-6 text-blue-100/50">Blue Teacher will receive only course-authorized lessons, project context and your scoped learning memory. Instructor-only or unrelated private context stays separated.</p><div className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-300"><CheckCircle2 className="h-4 w-4"/> Privacy boundary planned</div></section>
   </aside>
  </main>
 </div>
}
