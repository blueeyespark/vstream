import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Hammer, Sparkles, Users, CalendarDays, FolderKanban, ArrowRight, Compass, WandSparkles, Menu } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useBlue } from "@/lib/BlueContext";

const cards=[
  {title:"My Courses",detail:"Continue lessons, projects, feedback and mastery.",icon:BookOpen,to:"/Academy/Courses/3d-modeling-fundamentals"},
  {title:"Course Room",detail:"Instructor-led lessons, real project files and Blue Teacher support.",icon:GraduationCap,to:"/Academy/Courses/3d-modeling-fundamentals"},
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
        <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">A college built around <span className="bg-gradient-to-r from-[#00c8ff] via-[#6ea8ff] to-purple-400 bg-clip-text text-transparent">doing the work.</span></h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100/65 sm:text-lg">Learn from human instructors, work in the same professional tools used outside school, and keep Blue beside you as a teacher, guide and project assistant.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/Academy/Courses/3d-modeling-fundamentals" className="rounded-xl bg-[#1e78ff] px-5 py-3 text-sm font-black hover:bg-[#3690ff]">Enter first course <ArrowRight className="ml-1 inline h-4 w-4"/></Link><button onClick={()=>blue?.setMode?.("teacher")} className="rounded-xl border border-[#1e78ff]/40 bg-[#06101f]/80 px-5 py-3 text-sm font-black text-[#a9dfff]"><WandSparkles className="mr-2 inline h-4 w-4"/>Blue Teacher</button>
          <Link to="/CreatorOS" className="rounded-xl border border-[#1e78ff]/40 bg-[#06101f]/80 px-5 py-3 text-sm font-black text-[#a9dfff] hover:border-[#00c8ff]">CreatorOS <ArrowRight className="ml-1 inline h-4 w-4"/></Link>
        </div>
      </div>
    </section>
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <nav className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-[#12305f]/60 bg-[#06101f]/70 p-2" aria-label="Academy sections"><div className="flex gap-2 overflow-x-auto"><span className="whitespace-nowrap rounded-xl bg-purple-500/20 px-4 py-2 text-xs font-black text-purple-200">Student Home</span><Link to="/Academy/Courses/3d-modeling-fundamentals" className="whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black text-blue-100/45 hover:text-white">My Courses</Link></div><Link to="/Academy/Explore" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#12305f]/70 bg-[#03080f]/55 px-4 py-2 text-xs font-black text-[#7ddcff]"><Menu className="h-4 w-4"/> Explore School</Link></nav>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#00c8ff]">Student Home</p><h2 className="mt-2 text-2xl font-black">{user?.full_name ? `Welcome, ${user.full_name}` : "Welcome to Blue Academy"}</h2></div>
        <p className="max-w-xl text-sm text-blue-100/50">One account connects school, professional creation and your portfolio without turning private academic work into public creator content.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({title,detail,icon:Icon,to,soon})=><div key={title} className="group rounded-2xl border border-[#12305f]/70 bg-[#06101f]/80 p-5 shadow-xl shadow-black/10">
          <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1e78ff]/30 bg-[#1e78ff]/10"><Icon className="h-5 w-5 text-[#00c8ff]"/></span>{soon&&<span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[10px] font-black text-amber-300">BUILDING</span>}</div>
          <h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-blue-100/55">{detail}</p>
          {to?<Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#00c8ff]">Open <ArrowRight className="h-4 w-4"/></Link>:<p className="mt-4 text-xs font-bold text-blue-100/30">Prototype module — not live yet</p>}
        </div>)}
      </div>
      <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.22em] text-purple-300">First real course target</p><h2 className="mt-2 text-2xl font-black">3D Modeling Fundamentals</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/60">Our end-to-end test course will connect instructor material, a real Blender starter project, Blue Teacher, versioned submission, faculty feedback, revision and an optional portfolio/VStream publishing bridge.</p><Link to="/Academy/Courses/3d-modeling-fundamentals" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-black text-purple-200">Explore course room <ArrowRight className="h-4 w-4"/></Link></div><div className="rounded-3xl border border-[#12305f]/70 bg-[#06101f]/75 p-6 sm:p-8"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#00c8ff]"><Compass className="h-4 w-4"/> After class</div><h2 className="mt-3 text-xl font-black">Your work does not get trapped at school.</h2><p className="mt-3 text-sm leading-6 text-blue-100/50">Eligible work can move into your portfolio, continue through CreatorOS, and only be published to VStream when you choose.</p><Link to="/CreatorOS" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#00c8ff]"><Hammer className="h-4 w-4"/> Open CreatorOS</Link></div></section>
    </main>
  </div>
}
