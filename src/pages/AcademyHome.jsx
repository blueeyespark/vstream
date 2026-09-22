import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Hammer, Sparkles, Users, CalendarDays, FolderKanban, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useBlue } from "@/lib/BlueContext";

const cards=[
  {title:"My Courses",detail:"Continue lessons, projects, feedback and mastery.",icon:BookOpen,soon:true},
  {title:"Course Room",detail:"Instructor-led lessons, real project files and Blue Teacher support.",icon:GraduationCap,soon:true},
  {title:"Projects",detail:"Work with professional files, versioned submissions and revisions.",icon:FolderKanban,soon:true},
  {title:"Campus",detail:"Clubs, teams, events, studios and collaborative spaces.",icon:Users,soon:true},
  {title:"Calendar",detail:"Classes, due dates, office hours and campus events.",icon:CalendarDays,soon:true},
  {title:"Creator Bridge",detail:"Move eligible finished work into your portfolio and CreatorOS.",icon:Hammer,to:"/CreatorOS"},
];

export default function AcademyHome(){
  const {user}=useAuth();
  const blue=useBlue();
  return <div className="min-h-[calc(100vh-4rem)] bg-[#03080f] text-white">
    <section className="border-b border-[#12305f]/70 bg-[radial-gradient(circle_at_20%_0%,rgba(30,120,255,.24),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,.18),transparent_30%)]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1e78ff]/40 bg-[#1e78ff]/10 px-3 py-1.5 text-xs font-black text-[#7ddcff]">
          <Sparkles className="h-4 w-4"/> BLUE ACADEMY • EARLY CAMPUS PREVIEW
        </div>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Learn with real tools. Build real work. Keep what you create.</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100/65 sm:text-lg">A spatial-first hybrid college experience built around human instructors, professional project files, collaboration and the same Blue that follows you across the platform.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={()=>blue?.setMode?.("teacher")} className="rounded-xl bg-[#1e78ff] px-5 py-3 text-sm font-black hover:bg-[#3690ff]">Open Blue Teacher</button>
          <Link to="/CreatorOS" className="rounded-xl border border-[#1e78ff]/40 bg-[#06101f]/80 px-5 py-3 text-sm font-black text-[#a9dfff] hover:border-[#00c8ff]">CreatorOS <ArrowRight className="ml-1 inline h-4 w-4"/></Link>
        </div>
      </div>
    </section>
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#00c8ff]">Student Home</p><h2 className="mt-2 text-2xl font-black">{user?.full_name ? `Welcome, ${user.full_name}` : "Welcome to Blue Academy"}</h2></div>
        <p className="max-w-xl text-sm text-blue-100/50">This preview is intentionally honest: unfinished school systems are marked rather than filled with fake courses or grades.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({title,detail,icon:Icon,to,soon})=><div key={title} className="group rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5 shadow-xl shadow-black/10">
          <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1e78ff]/30 bg-[#1e78ff]/10"><Icon className="h-5 w-5 text-[#00c8ff]"/></span>{soon&&<span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[10px] font-black text-amber-300">BUILDING</span>}</div>
          <h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-blue-100/55">{detail}</p>
          {to?<Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00c8ff]">Open <ArrowRight className="h-4 w-4"/></Link>:<p className="mt-4 text-xs font-bold text-blue-100/30">Prototype module — not live yet</p>}
        </div>)}
      </div>
      <section className="mt-10 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.22em] text-purple-300">First real course target</p><h2 className="mt-2 text-2xl font-black">3D Modeling Fundamentals</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/60">Our end-to-end test course will connect instructor material, a real Blender starter project, Blue Teacher, versioned submission, faculty feedback, revision and an optional portfolio/VStream publishing bridge.</p><Link to="/Academy/Courses/3d-modeling-fundamentals" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-black text-purple-200">Open course-room preview <ArrowRight className="h-4 w-4"/></Link>
      </section>
    </main>
  </div>
}
