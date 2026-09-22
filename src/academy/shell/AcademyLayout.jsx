import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Compass, GraduationCap, LifeBuoy, MessageSquare, Radio, Search, Sparkles } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import OfflineBanner from "@/components/OfflineBanner";
import { useBlue } from "@/lib/BlueContext";

const nav=[
 {label:"Student Home",to:"/Academy",icon:GraduationCap,exact:true},
 {label:"Courses",to:"/Academy/Courses/3d-modeling-fundamentals",icon:BookOpen},
 {label:"Student Center",to:"/Academy/StudentCenter",icon:LifeBuoy},
 {label:"Explore",to:"/Academy/Explore",icon:Compass},
 {label:"Creator Campus",to:"/Academy/CreatorCampus",icon:Radio},
 {label:"Community",to:"/WorldChat",icon:MessageSquare},
];
export default function AcademyLayout({children}){
 const {pathname}=useLocation(); const blue=useBlue(); const [query,setQuery]=useState("");
 useEffect(()=>{document.documentElement.classList.add("dark");},[]);
 const active=item=>item.exact?pathname===item.to:pathname.startsWith(item.to);
 const submit=e=>{e.preventDefault();if(query.trim()) window.location.assign(`/Academy/Explore?search=${encodeURIComponent(query.trim())}`);};
 return <div className="min-h-screen bg-[#03080f] text-white">
  <OfflineBanner/>
  <header className="fixed inset-x-0 top-0 z-50 border-b border-[#12305f]/70 bg-[#03080f]/95 backdrop-blur-xl">
   <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
    <Link to="/Academy" className="flex shrink-0 items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/15"><GraduationCap className="h-5 w-5 text-purple-200"/></span><span className="hidden font-black tracking-wide sm:block">BLUE <span className="text-purple-300">ACADEMY</span></span></Link>
    <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="Academy primary navigation">{nav.slice(0,5).map(item=><Link key={item.to} to={item.to} className={`rounded-lg px-3 py-2 text-xs font-black transition ${active(item)?"bg-purple-500/15 text-purple-200":"text-blue-100/45 hover:bg-white/5 hover:text-white"}`}>{item.label}</Link>)}</nav>
    <form onSubmit={submit} className="ml-auto hidden w-full max-w-xs items-center gap-2 rounded-full border border-[#12305f] bg-[#06101f]/80 px-3 py-2 md:flex"><Search className="h-4 w-4 text-blue-300/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Academy..." aria-label="Search Blue Academy" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-300/30"/></form>
    <button onClick={()=>blue?.setMode?.("teacher")} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#1e78ff]/35 bg-[#1e78ff]/10 px-3 py-2 text-xs font-black text-[#7ddcff]"><Sparkles className="h-4 w-4"/><span className="hidden sm:inline">Blue Teacher</span></button>
    <Link to="/" className="hidden shrink-0 text-xs font-black text-blue-100/35 hover:text-white lg:block">VStream</Link>
   </div>
  </header>
  <main className="min-h-screen pt-16 pb-16 md:pb-0">{children}</main>
  <MobileNav/>
 </div>
}
