import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, Compass, GraduationCap, Library, MessageSquare, Radio, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useBlue } from "@/lib/BlueContext";

const learning=[
 {title:"3D Modeling Fundamentals",meta:"Blender • Professional project learning",progress:25,to:"/Academy/Courses/3d-modeling-fundamentals",status:"Continue lesson"},
 {title:"Creator Business Basics",meta:"Branding • Freelancing • Creator business",progress:0,building:true,status:"Planned course"},
 {title:"Life Skills for Young Adults",meta:"Money • Contracts • Everyday independence",progress:0,building:true,status:"Planned workshops"},
];
const school=[
 {title:"Academics",detail:"Courses, programs and credentials",icon:GraduationCap,to:"/Academy/Explore"},
 {title:"Student Center",detail:"Support, advising, records and more",icon:Users,to:"/Academy/StudentCenter"},
 {title:"Creator Campus",detail:"Education for every kind of creator",icon:Radio,to:"/Academy/CreatorCampus"},
 {title:"Career Center",detail:"Jobs, portfolios and professional growth",icon:BriefcaseBusiness,to:"/Academy/StudentCenter"},
 {title:"Student Life",detail:"Clubs, events and WorldChat community",icon:MessageSquare,to:"/WorldChat"},
 {title:"Library & Resources",detail:"Tools, references and learning resources",icon:Library,to:"/Academy/Explore"},
];
export default function AcademyHome(){
 const {user}=useAuth(); const blue=useBlue();
 return <div className="min-h-screen bg-[#03080f] text-white">
  <section className="border-b border-[#12305f]/70 bg-[radial-gradient(circle_at_18%_0%,rgba(30,120,255,.28),transparent_36%),radial-gradient(circle_at_78%_10%,rgba(168,85,247,.16),transparent_28%)]">
   <div className="mx-auto max-w-[1450px] px-5 py-10 sm:px-8 lg:py-14">
    <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
     <div><div className="inline-flex items-center gap-2 rounded-full border border-[#1e78ff]/35 bg-[#1e78ff]/10 px-3 py-1.5 text-xs font-black text-[#7ddcff]"><Sparkles className="h-4 w-4"/> BLUE ACADEMY</div><h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Welcome to <span className="bg-gradient-to-r from-[#00c8ff] via-[#6ea8ff] to-purple-400 bg-clip-text text-transparent">Blue Academy.</span></h1><p className="mt-4 max-w-3xl text-base leading-7 text-blue-100/65 sm:text-lg">Education, creativity, community and real-world opportunities—built around doing the work with human instructors, professional tools and Blue beside you.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/Academy/Courses/3d-modeling-fundamentals" className="rounded-xl bg-[#1e78ff] px-5 py-3 text-sm font-black hover:bg-[#3690ff]">Continue learning <ArrowRight className="ml-1 inline h-4 w-4"/></Link><Link to="/Academy/Explore" className="rounded-xl border border-[#1e78ff]/35 bg-[#06101f]/70 px-5 py-3 text-sm font-black text-blue-100/75">Explore school</Link></div></div>
     <aside className="rounded-2xl border border-[#1e78ff]/25 bg-[#06101f]/85 p-5 shadow-2xl shadow-blue-950/30"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e78ff]/15"><Sparkles className="h-5 w-5 text-[#00c8ff]"/></span><div><p className="font-black">Blue</p><p className="text-xs text-blue-100/45">Your AI teacher, guide and project partner</p></div></div><p className="mt-5 rounded-xl border border-[#12305f]/60 bg-[#03080f]/60 p-4 text-sm leading-6 text-blue-100/65">{user?.full_name?`Welcome back, ${user.full_name}. What are we working on today?`:"What are we learning today?"}</p><div className="mt-4 grid gap-2">{["Explain a concept","Help with an assignment","Plan my career path"].map(x=><button key={x} onClick={()=>blue?.setMode?.("teacher")} className="rounded-lg border border-[#12305f]/70 px-3 py-2 text-left text-xs font-bold text-[#7ddcff] hover:bg-[#1e78ff]/10">{x}</button>)}</div></aside>
    </div>
   </div>
  </section>
  <main className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8">
   <section><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#00c8ff]">Your learning journey</p><h2 className="mt-1 text-2xl font-black">Keep building your skills</h2></div><Link to="/Academy/Explore" className="text-xs font-black text-[#7ddcff]">View courses →</Link></div><div className="grid gap-4 md:grid-cols-3">{learning.map(x=><article key={x.title} className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-start justify-between gap-3"><BookOpen className="h-5 w-5 text-[#00c8ff]"/>{x.building&&<span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-black text-amber-300">PLANNED</span>}</div><h3 className="mt-4 font-black">{x.title}</h3><p className="mt-1 text-xs text-blue-100/40">{x.meta}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#12305f]/60"><div className="h-full rounded-full bg-[#1e78ff]" style={{width:`${x.progress}%`}}/></div><div className="mt-2 flex justify-between text-[10px] font-bold text-blue-100/35"><span>{x.status}</span><span>{x.progress}%</span></div>{x.to?<Link to={x.to} className="mt-4 block rounded-lg border border-[#1e78ff]/40 py-2 text-center text-xs font-black text-[#7ddcff]">Continue</Link>:<button disabled className="mt-4 w-full rounded-lg border border-[#12305f] py-2 text-xs font-black text-white/25">Building</button>}</article>)}</div></section>
   <section className="mt-9 grid gap-5 lg:grid-cols-[1fr_330px]"><div><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Explore the school</h2><Link to="/Academy/Explore" className="text-xs font-black text-[#7ddcff]">Explore all →</Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{school.map(({title,detail,icon:Icon,to})=><Link key={title} to={to} className="group rounded-2xl border border-[#12305f]/70 bg-[#06101f]/75 p-5 transition hover:-translate-y-0.5 hover:border-[#1e78ff]/45"><Icon className="h-5 w-5 text-[#00c8ff]"/><h3 className="mt-4 font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-blue-100/45">{detail}</p></Link>)}</div></div>
    <aside className="space-y-4"><div className="rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-purple-300"/><h3 className="font-black">Upcoming</h3></div><p className="mt-4 text-sm text-blue-100/50">Your classes, appointments, events and study sessions will meet here once scheduling is connected.</p><Link to="/Academy/StudentCenter" className="mt-4 inline-flex text-xs font-black text-[#7ddcff]">Open Student Center →</Link></div><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">School → career</p><p className="mt-3 text-sm leading-6 text-emerald-100/55">Coursework can become portfolio work, continue through CreatorOS and reach VStream only when you choose to publish it.</p><Link to="/Academy/CreatorCampus" className="mt-4 inline-flex text-xs font-black text-emerald-300">Explore Creator Campus →</Link></div></aside>
   </section>
  </main>
 </div>
}
