import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, CalendarDays, Compass, GraduationCap, Library, LifeBuoy, MessageSquare, Radio, Search, Sparkles, Users, X } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import OfflineBanner from "@/components/OfflineBanner";
import VStreamAIAssistant from "@/components/ai/VStreamAIAssistant";

const nav=[
 {label:"Student Home",to:"/Academy",icon:GraduationCap,exact:true},{label:"Courses & Learning",to:"/Academy/Courses/3d-modeling-fundamentals",icon:BookOpen},
 {label:"Student Center",to:"/Academy/StudentCenter",icon:LifeBuoy},{label:"Explore School",to:"/Academy/Explore",icon:Compass},
 {label:"Creator Campus",to:"/Academy/CreatorCampus",icon:Radio},{label:"Career Center",to:"/Academy/StudentCenter",icon:BriefcaseBusiness},
 {label:"Library & Resources",to:"/Academy/Explore",icon:Library},{label:"Student Life",to:"/WorldChat",icon:Users},
 {label:"WorldChat",to:"/WorldChat",icon:MessageSquare},{label:"Campus Events",to:"/Academy/Explore",icon:CalendarDays},
];
export default function AcademyLayout({children}){
 const {pathname}=useLocation(),navigate=useNavigate(); const [query,setQuery]=useState(""),[blueOpen,setBlueOpen]=useState(false);
 useEffect(()=>{document.documentElement.classList.add("dark");},[]);
 const active=item=>item.exact?pathname===item.to:pathname.startsWith(item.to);
 const submit=e=>{e.preventDefault();if(query.trim())navigate(`/Academy/Explore?search=${encodeURIComponent(query.trim())}`)};
 return <div className="min-h-screen bg-[#03080f] text-white"><OfflineBanner/>
  <header className="fixed inset-x-0 top-0 z-50 border-b border-[#12305f]/70 bg-[#03080f]/95 backdrop-blur-xl">
   <div className="flex h-16 items-center gap-4 px-4 sm:px-6"><Link to="/" className="shrink-0 text-xl font-black tracking-wide">V<span className="text-[#00c8ff]">Stream</span></Link><nav className="hidden items-center gap-1 lg:flex"><Link to="/" className="px-3 py-2 text-xs font-bold text-blue-100/45 hover:text-white">Home</Link><Link to="/Academy" className="border-b-2 border-[#00c8ff] px-3 py-2 text-xs font-black text-[#7ddcff]">Academy</Link><Link to="/Live" className="px-3 py-2 text-xs font-bold text-blue-100/45 hover:text-white">Watch</Link><Link to="/CreatorOS" className="px-3 py-2 text-xs font-bold text-blue-100/45 hover:text-white">CreatorOS</Link><Link to="/WorldChat" className="px-3 py-2 text-xs font-bold text-blue-100/45 hover:text-white">WorldChat</Link></nav><form onSubmit={submit} className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-[#12305f] bg-[#06101f]/80 px-4 py-2 md:flex"><Search className="h-4 w-4 text-blue-300/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search courses, resources, or ask Blue..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-blue-300/30"/></form><button onClick={()=>setBlueOpen(true)} className="rounded-xl border border-[#1e78ff]/35 bg-[#1e78ff]/10 px-3 py-2 text-xs font-black text-[#7ddcff]"><Sparkles className="inline h-4 w-4 sm:mr-2"/><span className="hidden sm:inline">Blue</span></button></div>
  </header>
  <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-56 border-r border-[#12305f]/70 bg-[#03080f]/96 xl:flex xl:flex-col">
   <div className="border-b border-[#12305f]/60 p-5"><Link to="/Academy" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1e78ff]/15 text-[#7ddcff]"><GraduationCap className="h-5 w-5"/></span><div><p className="font-black">Blue Academy</p><p className="text-[10px] text-blue-100/35">Learn. Create. Belong.</p></div></Link></div>
   <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Academy navigation">{nav.map(item=><Link key={item.label} to={item.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${active(item)?"border border-[#1e78ff]/30 bg-[#1e78ff]/15 text-[#7ddcff]":"text-blue-100/55 hover:bg-white/5 hover:text-white"}`}><item.icon className="h-4 w-4"/>{item.label}</Link>)}</nav>
   <div className="border-t border-[#12305f]/60 p-3"><button onClick={()=>setBlueOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-black text-[#7ddcff] hover:bg-[#1e78ff]/10"><Sparkles className="h-4 w-4"/> Blue Teacher <span className="ml-auto h-2 w-2 rounded-full bg-[#00c8ff] shadow-[0_0_10px_#00c8ff]"/></button><Link to="/" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-purple-300/70 hover:bg-white/5">← Switch to VStream</Link></div>
  </aside>
  <main className="min-h-screen pt-16 pb-16 xl:pl-56 md:pb-0">{children}</main><MobileNav/>
  {blueOpen&&<div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm" onClick={()=>setBlueOpen(false)}><div className="absolute bottom-0 right-0 top-0 w-full max-w-md border-l border-[#12305f] bg-[#03080f] p-4 pt-20 shadow-2xl" onClick={e=>e.stopPropagation()}><button onClick={()=>setBlueOpen(false)} className="absolute right-4 top-4 rounded-lg p-2 text-blue-100/50 hover:bg-white/5 hover:text-white" aria-label="Close Blue"><X className="h-5 w-5"/></button><VStreamAIAssistant surface="embedded" contextType="academy"/></div></div>}
 </div>
}
