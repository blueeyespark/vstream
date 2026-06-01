import { useState } from "react";
import { BookOpen, Code, Play, Star, Clock, Users, ChevronRight, Search, Sparkles, Trophy, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { expandedCourses, creatorCoursesExpanded, codingCoursesExpanded, artCoursesExpanded, designCoursesExpanded, businessCoursesExpanded, musicCoursesExpanded, photographyCoursesExpanded, writingCoursesExpanded } from "@/lib/expandedCoursesData";
import MyCourses from "@/components/learning/MyCourses";
import LearningPathGenerator from "@/components/learning/LearningPathGenerator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const resources = [
  { name: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "📚", desc: "Comprehensive web dev reference" },
  { name: "GitHub", url: "https://github.com", icon: "🐙", desc: "Version control & code hosting" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "❓", desc: "Q&A for developers" },
  { name: "Dev.to", url: "https://dev.to", icon: "💻", desc: "Developer articles & tutorials" },
];

export default function LearningHub() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [courseType, setCourseType] = useState("coding");
  const [activeTab, setActiveTab] = useState("explore");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [skillTab, setSkillTab] = useState("coding");

  const categoryOptions = {
    coding: ["Web Development", "Mobile Apps", "Backend", "DevOps", "Data Science", "AI/ML"],
    art: ["Digital Painting", "Character Design", "Animation", "3D Modeling", "Illustration", "Concept Art"],
    creator: ["Video Editing", "Content Strategy", "Monetization", "Community Management", "Thumbnails", "Audio Production"],
    design: ["UI/UX Design", "Graphic Design", "Branding", "Web Design", "Motion Design", "Figma"],
    business: ["Entrepreneurship", "Marketing", "Sales", "Analytics", "Finance", "Leadership"],
    music: ["Music Production", "Beat Making", "Sound Design", "Mixing", "Mastering", "Music Theory"],
    photography: ["Portrait Photography", "Landscape", "Product Photography", "Editing", "Lighting", "Composition"],
    writing: ["Copywriting", "Storytelling", "Screenwriting", "Technical Writing", "Blogging", "SEO"],
  };

  let allCourses = expandedCourses;
  if (courseType === "art") allCourses = artCoursesExpanded;
  if (courseType === "coding") allCourses = codingCoursesExpanded;
  if (courseType === "creator") allCourses = creatorCoursesExpanded;
  if (courseType === "design") allCourses = designCoursesExpanded;
  if (courseType === "business") allCourses = businessCoursesExpanded;
  if (courseType === "music") allCourses = musicCoursesExpanded;
  if (courseType === "photography") allCourses = photographyCoursesExpanded;
  if (courseType === "writing") allCourses = writingCoursesExpanded;

  const filtered = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getCourseCount = () => {
    switch(courseType) {
      case "coding": return codingCoursesExpanded.length;
      case "art": return artCoursesExpanded.length;
      case "creator": return creatorCoursesExpanded.length;
      case "design": return designCoursesExpanded.length;
      case "business": return businessCoursesExpanded.length;
      case "music": return musicCoursesExpanded.length;
      case "photography": return photographyCoursesExpanded.length;
      case "writing": return writingCoursesExpanded.length;
      default: return expandedCourses.length;
    }
  };

  const getFeaturedCourses = () => {
    const shuffled = [...allCourses].sort(() => 0.5 - Math.random()).slice(0, 3);
    return shuffled;
  };

  const getRecommendedPaths = () => {
    return [
      { title: "Web Developer Bootcamp", courses: ["JavaScript Fundamentals", "React.js Mastery", "Node.js & Express", "Database Design & SQL"], level: "6 months", icon: "🌐", color: "text-[#00c8ff]" },
      { title: "UI/UX Designer Pro", courses: ["UI/UX Design Complete", "Figma Advanced Techniques", "Web Design Fundamentals", "Design Thinking Workshop"], level: "4 months", icon: "🎨", color: "text-pink-300" },
      { title: "Content Creator Empire", courses: ["YouTube Growth Strategies", "Video Production Fundamentals", "Adobe Premiere Pro Mastery", "Personal Brand Building"], level: "3 months", icon: "🎬", color: "text-amber-300" },
      { title: "Music Producer Pro", courses: ["Music Production Fundamentals", "Beat Making & Hip Hop Production", "Music Mixing & Mastering", "Music Theory for Producers"], level: "5 months", icon: "🎵", color: "text-red-300" },
    ];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-[#12305f]/75 bg-gradient-to-br from-[#06101f] via-[#0a1525] to-[#03080f] p-8 shadow-2xl shadow-[#1e78ff]/10">
        <div className="flex items-center gap-4 mb-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1e78ff] via-[#6366f1] to-[#a855f7] text-3xl shadow-lg shadow-purple-500/50">
            📚
          </span>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00c8ff] to-[#1e78ff]">Learning Hub</h1>
            <p className="text-sm text-blue-100/70 mt-2">Master 200+ courses across 17 skill domains. Learn from industry experts & build real projects.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#12305f]/50">
          <div className="text-center bg-gradient-to-br from-[#1e78ff]/10 to-transparent rounded-xl p-3">
            <p className="text-3xl font-black text-[#00c8ff]">200+</p>
            <p className="text-xs text-blue-100/60 mt-1">Total Courses</p>
          </div>
          <div className="text-center bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-3">
            <p className="text-3xl font-black text-amber-300">Community</p>
            <p className="text-xs text-blue-100/60 mt-1">Active Learners</p>
          </div>
          <div className="text-center bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl p-3">
            <p className="text-3xl font-black text-emerald-400">4.8+</p>
            <p className="text-xs text-blue-100/60 mt-1">Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#12305f]/50 bg-[#06101f]/80 p-1 backdrop-blur mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-none flex flex-wrap justify-start p-2 gap-1">
            <TabsTrigger value="explore" className="rounded-xl data-[state=active]:bg-[#1e78ff]/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#1e78ff]/50 font-black text-sm">
              📚 Explore Courses
            </TabsTrigger>
            <TabsTrigger value="mycourses" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-amber-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-amber-500/50 font-black text-sm">
              <Trophy className="h-4 w-4" /> My Courses
            </TabsTrigger>
            <TabsTrigger value="pathgen" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-purple-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-purple-500/50 font-black text-sm">
              <Zap className="h-4 w-4" /> AI Path
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "mycourses" ? (
        <MyCourses />
      ) : activeTab === "pathgen" ? (
        <LearningPathGenerator />
      ) : (
        <>
          {/* Skill Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            <div className="rounded-2xl border border-[#12305f]/50 bg-[#03080f]/30 p-2 flex gap-2 backdrop-blur">
              {[
                { id: "coding", label: "💻 Coding", color: "bg-[#1e78ff]" },
                { id: "gamedev", label: "🎮 Game Dev", color: "bg-indigo-500" },
                { id: "datascience", label: "📊 Data Science", color: "bg-cyan-500" },
                { id: "mobiledev", label: "📱 Mobile Dev", color: "bg-blue-500" },
                { id: "art", label: "🎨 Art", color: "bg-pink-500" },
                { id: "animation", label: "🎬 Animation", color: "bg-purple-600" },
                { id: "3dmodeling", label: "🗿 3D Modeling", color: "bg-fuchsia-500" },
                { id: "videoedit", label: "🎞️ Video Edit", color: "bg-red-600" },
                { id: "creator", label: "🎬 Creator", color: "bg-red-500" },
                { id: "design", label: "✨ Design", color: "bg-purple-500" },
                { id: "graphicdesign", label: "🖌️ Graphics", color: "bg-rose-500" },
                { id: "marketing", label: "📢 Marketing", color: "bg-lime-500" },
                { id: "business", label: "💼 Business", color: "bg-emerald-500" },
                { id: "entrepreneurship", label: "🚀 Startup", color: "bg-amber-600" },
                { id: "music", label: "🎵 Music", color: "bg-orange-500" },
                { id: "photography", label: "📸 Photography", color: "bg-yellow-500" },
                { id: "writing", label: "✍️ Writing", color: "bg-blue-300" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSkillTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition duration-200 ${
                    skillTab === tab.id
                      ? `${tab.color} text-white shadow-lg shadow-${tab.color}/40 scale-105`
                      : "border border-[#12305f]/40 bg-[#03080f]/50 text-blue-100/60 hover:border-[#1e78ff]/60 hover:shadow-md hover:shadow-[#1e78ff]/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category-Specific Content */}
          {skillTab === "coding" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-[#1e78ff]/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-[#1e78ff]/5">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00c8ff] to-[#1e78ff] mb-6">💻 Web & Programming</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "JavaScript Fundamentals", level: "Beginner", students: 34200, rating: "4.9", icon: "📝" },
                    { title: "React.js Mastery", level: "Intermediate", students: 28900, rating: "4.8", icon: "⚛️" },
                    { title: "HTML & CSS Essentials", level: "Beginner", students: 38100, rating: "4.9", icon: "🌐" },
                    { title: "Node.js Backend Development", level: "Intermediate", students: 22800, rating: "4.8", icon: "⚙️" },
                    { title: "TypeScript Advanced", level: "Advanced", students: 16500, rating: "4.9", icon: "📘" },
                    { title: "Vue.js Complete Guide", level: "Beginner", students: 18600, rating: "4.8", icon: "💚" },
                    { title: "Full Stack MERN Stack", level: "Advanced", students: 24200, rating: "4.9", icon: "🚀" },
                    { title: "Web APIs & REST Services", level: "Intermediate", students: 19300, rating: "4.7", icon: "🔌" },
                    { title: "Next.js & SSR", level: "Intermediate", students: 15600, rating: "4.9", icon: "▲" },
                    { title: "GraphQL Mastery", level: "Advanced", students: 12400, rating: "4.8", icon: "◇" },
                    { title: "Web Performance Optimization", level: "Advanced", students: 11200, rating: "4.9", icon: "⚡" },
                    { title: "Progressive Web Apps (PWA)", level: "Intermediate", students: 9800, rating: "4.8", icon: "📱" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-[#1e78ff]/40 bg-[#1e78ff]/10 p-3 hover:border-[#1e78ff]/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-[#00c8ff] bg-[#1e78ff]/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
                <h3 className="text-sm font-black text-white mb-3">🎯 Coding Resources</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { name: "LeetCode", desc: "Algorithm & coding practice", icon: "🏆" },
                    { name: "HackerRank", desc: "Coding challenges & competitions", icon: "⚡" },
                    { name: "CodeSignal", desc: "Technical assessment platform", icon: "🎖️" },
                  ].map((res, idx) => (
                    <a key={idx} href="#" className="rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2 hover:border-[#1e78ff]/40 transition">
                      <p className="font-black text-white text-xs flex items-center gap-1">{res.icon} {res.name}</p>
                      <p className="text-[9px] text-blue-100/50">{res.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "art" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-pink-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-pink-500/5">
                <h2 className="text-xl font-black text-pink-300 mb-4">🎨 Digital Art & Illustration</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Digital Painting Fundamentals", level: "Beginner", students: 21800, rating: "4.9", icon: "🖌️" },
                    { title: "Character Design Essentials", level: "Intermediate", students: 18200, rating: "4.8", icon: "👤" },
                    { title: "Illustration Masterclass", level: "Intermediate", students: 19900, rating: "4.9", icon: "🖼️" },
                    { title: "Concept Art for Games", level: "Advanced", students: 14100, rating: "4.9", icon: "🎮" },
                    { title: "Anatomy for Artists", level: "Intermediate", students: 16300, rating: "4.8", icon: "💀" },
                    { title: "Color Theory Mastery", level: "Beginner", students: 22400, rating: "4.9", icon: "🎨" },
                    { title: "Perspective Drawing", level: "Beginner", students: 17600, rating: "4.8", icon: "📏" },
                    { title: "Digital Inking & Linework", level: "Intermediate", students: 11200, rating: "4.9", icon: "✏️" },
                    { title: "Creature Design Workshop", level: "Advanced", students: 9800, rating: "4.8", icon: "🦾" },
                    { title: "Comic Book Art Essentials", level: "Intermediate", students: 13400, rating: "4.9", icon: "💭" },
                    { title: "Speed Painting Techniques", level: "Intermediate", students: 10600, rating: "4.8", icon: "⚡" },
                    { title: "Digital Collage & Mixed Media", level: "Beginner", students: 8900, rating: "4.9", icon: "🎭" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-pink-500/40 bg-pink-500/10 p-3 hover:border-pink-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-pink-300 bg-pink-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "creator" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-red-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-red-500/5">
                <h2 className="text-xl font-black text-red-400 mb-4">🎬 Content Creation & Streaming</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "YouTube Growth Strategies", level: "Beginner", students: 34500, rating: "4.9", icon: "📺" },
                    { title: "Video Production Fundamentals", level: "Beginner", students: 28900, rating: "4.8", icon: "📹" },
                    { title: "Thumbnail Design Secrets", level: "Beginner", students: 25600, rating: "4.9", icon: "🎯" },
                    { title: "Content Calendar Mastery", level: "Beginner", students: 19200, rating: "4.7", icon: "📅" },
                    { title: "Adobe Premiere Pro Mastery", level: "Intermediate", students: 22300, rating: "4.9", icon: "🎞️" },
                    { title: "Personal Branding 2025", level: "Intermediate", students: 19800, rating: "4.8", icon: "⭐" },
                    { title: "Podcast Production Pro", level: "Intermediate", students: 16300, rating: "4.8", icon: "🎙️" },
                    { title: "Twitch Streaming Mastery", level: "Beginner", students: 15200, rating: "4.9", icon: "🎮" },
                    { title: "Audience Building Psychology", level: "Advanced", students: 12100, rating: "4.9", icon: "👥" },
                    { title: "Shorts & TikTok Strategy", level: "Beginner", students: 23400, rating: "4.8", icon: "🎬" },
                    { title: "Community Management Pro", level: "Intermediate", students: 14800, rating: "4.9", icon: "💬" },
                    { title: "Monetization Strategies", level: "Intermediate", students: 17600, rating: "4.8", icon: "💰" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-red-500/40 bg-red-500/10 p-3 hover:border-red-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "design" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-purple-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-purple-500/5">
                <h2 className="text-xl font-black text-purple-400 mb-4">✨ UI/UX & Product Design</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "UI/UX Design Complete", level: "Beginner", students: 26700, rating: "4.9", icon: "🎨" },
                    { title: "Figma Advanced Techniques", level: "Intermediate", students: 22400, rating: "4.8", icon: "📐" },
                    { title: "Web Design Fundamentals", level: "Beginner", students: 24500, rating: "4.8", icon: "🌐" },
                    { title: "Mobile App Design", level: "Intermediate", students: 23200, rating: "4.8", icon: "📱" },
                    { title: "Design System Creation", level: "Advanced", students: 17200, rating: "4.9", icon: "🔧" },
                    { title: "Interaction Design Mastery", level: "Intermediate", students: 16800, rating: "4.9", icon: "⚡" },
                    { title: "Branding & Logo Design", level: "Intermediate", students: 20300, rating: "4.9", icon: "📛" },
                    { title: "Accessibility in Design", level: "Beginner", students: 18900, rating: "4.8", icon: "♿" },
                    { title: "User Research & Testing", level: "Intermediate", students: 15400, rating: "4.9", icon: "🔍" },
                    { title: "Prototyping & Wireframing", level: "Beginner", students: 19200, rating: "4.8", icon: "📋" },
                    { title: "Design Thinking Workshop", level: "Beginner", students: 16800, rating: "4.9", icon: "💡" },
                    { title: "Advanced Animation in Design", level: "Advanced", students: 12600, rating: "4.8", icon: "✨" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-purple-500/40 bg-purple-500/10 p-3 hover:border-purple-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "business" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-emerald-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
                <h2 className="text-xl font-black text-emerald-400 mb-4">💼 Business & Entrepreneurship</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Entrepreneurship 101", level: "Beginner", students: 29800, rating: "4.9", icon: "🚀" },
                    { title: "Digital Marketing Mastery", level: "Intermediate", students: 34100, rating: "4.8", icon: "📊" },
                    { title: "Sales Fundamentals", level: "Beginner", students: 27600, rating: "4.9", icon: "💰" },
                    { title: "Project Management Excellence", level: "Intermediate", students: 25400, rating: "4.9", icon: "📋" },
                    { title: "Social Media Strategy", level: "Beginner", students: 32300, rating: "4.8", icon: "📱" },
                    { title: "Financial Analysis Pro", level: "Advanced", students: 19300, rating: "4.8", icon: "📈" },
                    { title: "Copywriting & Content Marketing", level: "Intermediate", students: 28700, rating: "4.9", icon: "✍️" },
                    { title: "Leadership & Team Building", level: "Intermediate", students: 22600, rating: "4.8", icon: "👔" },
                    { title: "Negotiation Skills Mastery", level: "Intermediate", students: 16200, rating: "4.9", icon: "🤝" },
                    { title: "Customer Relationship Management", level: "Beginner", students: 20400, rating: "4.8", icon: "👥" },
                    { title: "Business Writing Essentials", level: "Beginner", students: 18900, rating: "4.9", icon: "📄" },
                    { title: "Operations Management", level: "Intermediate", students: 14700, rating: "4.8", icon: "⚙️" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 hover:border-emerald-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "music" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-orange-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-orange-500/5">
                <h2 className="text-xl font-black text-orange-400 mb-4">🎵 Music Production & Theory</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Music Production Fundamentals", level: "Beginner", students: 23400, rating: "4.9", icon: "🎚️" },
                    { title: "Music Theory for Producers", level: "Beginner", students: 22300, rating: "4.8", icon: "🎼" },
                    { title: "Beat Making & Hip Hop", level: "Intermediate", students: 19800, rating: "4.8", icon: "🎛️" },
                    { title: "Electronic Music Production", level: "Intermediate", students: 20700, rating: "4.9", icon: "⚡" },
                    { title: "Ableton Live Mastery", level: "Intermediate", students: 17400, rating: "4.8", icon: "🎹" },
                    { title: "Music Mixing & Mastering", level: "Advanced", students: 18600, rating: "4.9", icon: "🎧" },
                    { title: "Sound Design Secrets", level: "Advanced", students: 16200, rating: "4.9", icon: "🔊" },
                    { title: "FL Studio Complete Guide", level: "Beginner", students: 15800, rating: "4.8", icon: "🎵" },
                    { title: "Logic Pro Mastery", level: "Intermediate", students: 13400, rating: "4.9", icon: "🍎" },
                    { title: "Music Business & Licensing", level: "Intermediate", students: 14800, rating: "4.8", icon: "📜" },
                    { title: "Orchestration & Arrangement", level: "Advanced", students: 11200, rating: "4.9", icon: "🎻" },
                    { title: "Lo-Fi Hip Hop Production", level: "Beginner", students: 18600, rating: "4.8", icon: "☕" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 hover:border-orange-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-orange-300 bg-orange-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "photography" && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#12305f]/60 bg-gradient-to-br from-yellow-500/10 via-[#06101f] to-[#03080f] p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-yellow-500/5">
                <h2 className="text-xl font-black text-yellow-400 mb-4">📸 Photography & Editing</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Photography Fundamentals", level: "Beginner", students: 28900, rating: "4.9", icon: "📷" },
                    { title: "Portrait Photography Pro", level: "Intermediate", students: 22700, rating: "4.8", icon: "👤" },
                    { title: "Landscape Photography", level: "Intermediate", students: 20400, rating: "4.9", icon: "🏔️" },
                    { title: "Photo Editing in Lightroom", level: "Beginner", students: 26200, rating: "4.8", icon: "🖼️" },
                    { title: "Advanced Photoshop Techniques", level: "Advanced", students: 18900, rating: "4.9", icon: "🎨" },
                    { title: "Product Photography Mastery", level: "Intermediate", students: 17600, rating: "4.8", icon: "📦" },
                    { title: "Wedding Photography Pro", level: "Advanced", students: 16300, rating: "4.9", icon: "💍" },
                    { title: "Street Photography Mastery", level: "Intermediate", students: 13400, rating: "4.8", icon: "🏙️" },
                    { title: "Photography Business & Marketing", level: "Intermediate", students: 14400, rating: "4.8", icon: "💼" },
                    { title: "Lighting Techniques Mastery", level: "Intermediate", students: 15200, rating: "4.9", icon: "💡" },
                    { title: "Macro & Close-up Photography", level: "Intermediate", students: 11800, rating: "4.8", icon: "🔬" },
                    { title: "Photography Composition Secrets", level: "Beginner", students: 19600, rating: "4.9", icon: "🎯" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 hover:border-yellow-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-yellow-300 bg-yellow-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "gamedev" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-indigo-400 mb-4">🎮 Game Development</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Unity Game Development Fundamentals", level: "Beginner", students: 21400, rating: "4.9", icon: "🎮" },
                    { title: "Unreal Engine 5 Mastery", level: "Intermediate", students: 16800, rating: "4.8", icon: "⚡" },
                    { title: "Game Design Principles", level: "Beginner", students: 12300, rating: "4.9", icon: "🎯" },
                    { title: "C# Programming for Games", level: "Intermediate", students: 14700, rating: "4.8", icon: "💜" },
                    { title: "Game Physics & Mechanics", level: "Advanced", students: 8900, rating: "4.9", icon: "⚙️" },
                    { title: "3D Game Environments", level: "Intermediate", students: 9200, rating: "4.8", icon: "🌍" },
                    { title: "Multiplayer Networking", level: "Advanced", students: 6500, rating: "4.9", icon: "🌐" },
                    { title: "Mobile Game Development", level: "Intermediate", students: 11200, rating: "4.8", icon: "📱" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-3 hover:border-indigo-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "datascience" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-cyan-400 mb-4">📊 Data Science & Analytics</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Python for Data Analysis", level: "Beginner", students: 28400, rating: "4.9", icon: "🐍" },
                    { title: "Machine Learning Fundamentals", level: "Intermediate", students: 19800, rating: "4.8", icon: "🤖" },
                    { title: "Data Visualization Mastery", level: "Intermediate", students: 14600, rating: "4.9", icon: "📈" },
                    { title: "SQL & Database Design", level: "Beginner", students: 22100, rating: "4.8", icon: "🗄️" },
                    { title: "Advanced Statistics", level: "Advanced", students: 9700, rating: "4.9", icon: "📊" },
                    { title: "TensorFlow & Deep Learning", level: "Advanced", students: 11300, rating: "4.8", icon: "🧠" },
                    { title: "Big Data with Spark", level: "Advanced", students: 7200, rating: "4.9", icon: "💥" },
                    { title: "Tableau & Power BI", level: "Intermediate", students: 16800, rating: "4.8", icon: "📉" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 hover:border-cyan-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "mobiledev" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-blue-400 mb-4">📱 Mobile Development</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "React Native Mastery", level: "Intermediate", students: 18900, rating: "4.9", icon: "⚛️" },
                    { title: "iOS Development with Swift", level: "Intermediate", students: 15200, rating: "4.8", icon: "🍎" },
                    { title: "Android Development Kotlin", level: "Intermediate", students: 16700, rating: "4.9", icon: "🤖" },
                    { title: "Flutter Complete Guide", level: "Beginner", students: 19300, rating: "4.8", icon: "🦋" },
                    { title: "Mobile UI/UX Design", level: "Intermediate", students: 13400, rating: "4.9", icon: "🎨" },
                    { title: "App Monetization Strategies", level: "Intermediate", students: 8600, rating: "4.8", icon: "💰" },
                    { title: "Push Notifications & APIs", level: "Intermediate", students: 7300, rating: "4.9", icon: "📲" },
                    { title: "App Store Optimization", level: "Beginner", students: 10200, rating: "4.8", icon: "📈" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 hover:border-blue-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "animation" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-purple-400 mb-4">🎬 Animation & Motion Graphics</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Animation Fundamentals", level: "Beginner", students: 14200, rating: "4.9", icon: "⏯️" },
                    { title: "Blender 3D Animation", level: "Intermediate", students: 12800, rating: "4.8", icon: "🎨" },
                    { title: "Motion Graphics Design", level: "Intermediate", students: 10600, rating: "4.9", icon: "✨" },
                    { title: "After Effects Mastery", level: "Intermediate", students: 16300, rating: "4.8", icon: "🎬" },
                    { title: "2D Animation Techniques", level: "Beginner", students: 11400, rating: "4.9", icon: "🖼️" },
                    { title: "Character Animation Pro", level: "Advanced", students: 8900, rating: "4.8", icon: "👤" },
                    { title: "Rigging & Skeletal Animation", level: "Advanced", students: 7100, rating: "4.9", icon: "🦴" },
                    { title: "VFX & Visual Effects", level: "Advanced", students: 6400, rating: "4.8", icon: "💥" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-purple-600/40 bg-purple-600/10 p-3 hover:border-purple-600/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-purple-300 bg-purple-600/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "3dmodeling" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-fuchsia-400 mb-4">🗿 3D Modeling & Sculpting</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Blender Fundamentals", level: "Beginner", students: 19700, rating: "4.9", icon: "🟠" },
                    { title: "Character Modeling", level: "Intermediate", students: 12400, rating: "4.8", icon: "👤" },
                    { title: "3D Sculpting Mastery", level: "Intermediate", students: 10800, rating: "4.9", icon: "🗿" },
                    { title: "Environment Design", level: "Intermediate", students: 9300, rating: "4.8", icon: "🌍" },
                    { title: "Hard Surface Modeling", level: "Advanced", students: 7600, rating: "4.9", icon: "⚙️" },
                    { title: "Texturing & Shading", level: "Intermediate", students: 13200, rating: "4.8", icon: "🎨" },
                    { title: "3D Printing Preparation", level: "Intermediate", students: 5800, rating: "4.9", icon: "🖨️" },
                    { title: "Motion Capture & Rigging", level: "Advanced", students: 6200, rating: "4.8", icon: "🎬" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 p-3 hover:border-fuchsia-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-fuchsia-300 bg-fuchsia-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "videoedit" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-red-400 mb-4">🎞️ Video Editing & Production</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Adobe Premiere Pro Complete", level: "Beginner", students: 22500, rating: "4.9", icon: "🎬" },
                    { title: "DaVinci Resolve Mastery", level: "Intermediate", students: 14300, rating: "4.8", icon: "⚫" },
                    { title: "Final Cut Pro Professional", level: "Intermediate", students: 10200, rating: "4.9", icon: "🍎" },
                    { title: "Video Color Grading", level: "Intermediate", students: 11800, rating: "4.8", icon: "🎨" },
                    { title: "Sound Design for Video", level: "Intermediate", students: 8900, rating: "4.9", icon: "🔊" },
                    { title: "Cinematic Techniques", level: "Advanced", students: 9400, rating: "4.8", icon: "🎥" },
                    { title: "VFX & Compositing", level: "Advanced", students: 7600, rating: "4.9", icon: "💥" },
                    { title: "Subtitle & Caption Design", level: "Beginner", students: 6200, rating: "4.8", icon: "📝" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-red-600/40 bg-red-600/10 p-3 hover:border-red-600/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-red-300 bg-red-600/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "graphicdesign" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-rose-400 mb-4">🖌️ Graphic Design</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Adobe Creative Suite Mastery", level: "Beginner", students: 24800, rating: "4.9", icon: "🎨" },
                    { title: "Logo Design Professional", level: "Intermediate", students: 16200, rating: "4.8", icon: "📛" },
                    { title: "Typography Mastery", level: "Intermediate", students: 12400, rating: "4.9", icon: "🔤" },
                    { title: "Package Design", level: "Intermediate", students: 9800, rating: "4.8", icon: "📦" },
                    { title: "Print Design Essentials", level: "Beginner", students: 10600, rating: "4.9", icon: "📄" },
                    { title: "Poster & Flyer Design", level: "Intermediate", students: 14300, rating: "4.8", icon: "📃" },
                    { title: "Brand Identity Design", level: "Advanced", students: 11700, rating: "4.9", icon: "🎯" },
                    { title: "Layout & Composition", level: "Beginner", students: 13900, rating: "4.8", icon: "📐" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 hover:border-rose-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "marketing" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-lime-400 mb-4">📢 Marketing & Growth</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Digital Marketing Complete", level: "Beginner", students: 26300, rating: "4.9", icon: "📊" },
                    { title: "SEO & SEM Mastery", level: "Intermediate", students: 19400, rating: "4.8", icon: "🔍" },
                    { title: "Content Marketing Strategy", level: "Intermediate", students: 15800, rating: "4.9", icon: "📝" },
                    { title: "Email Marketing Pro", level: "Intermediate", students: 13200, rating: "4.8", icon: "📧" },
                    { title: "Influencer Marketing", level: "Intermediate", students: 11300, rating: "4.9", icon: "⭐" },
                    { title: "Growth Hacking Techniques", level: "Advanced", students: 9700, rating: "4.8", icon: "📈" },
                    { title: "Analytics & Data Driven Marketing", level: "Intermediate", students: 14600, rating: "4.9", icon: "📉" },
                    { title: "Brand Positioning", level: "Intermediate", students: 10200, rating: "4.8", icon: "🎯" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-lime-500/40 bg-lime-500/10 p-3 hover:border-lime-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-lime-300 bg-lime-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "entrepreneurship" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-amber-400 mb-4">🚀 Entrepreneurship & Startups</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Startup Fundamentals", level: "Beginner", students: 18900, rating: "4.9", icon: "🚀" },
                    { title: "Business Model Canvas", level: "Beginner", students: 14200, rating: "4.8", icon: "📋" },
                    { title: "Pitch Deck Mastery", level: "Intermediate", students: 12800, rating: "4.9", icon: "💼" },
                    { title: "Fundraising & Venture Capital", level: "Advanced", students: 9300, rating: "4.8", icon: "💰" },
                    { title: "Product-Market Fit", level: "Intermediate", students: 11600, rating: "4.9", icon: "🎯" },
                    { title: "Scaling Your Business", level: "Advanced", students: 8700, rating: "4.8", icon: "📈" },
                    { title: "Customer Development", level: "Intermediate", students: 13400, rating: "4.9", icon: "👥" },
                    { title: "Legal & Compliance", level: "Intermediate", students: 7900, rating: "4.8", icon: "⚖️" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-amber-600/40 bg-amber-600/10 p-3 hover:border-amber-600/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-amber-300 bg-amber-600/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillTab === "writing" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-4 sm:p-6">
                <h2 className="text-xl font-black text-blue-300 mb-4">✍️ Writing & Storytelling</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Creative Writing Fundamentals", level: "Beginner", students: 24600, rating: "4.9", icon: "📚" },
                    { title: "Copywriting Mastery", level: "Intermediate", students: 28300, rating: "4.8", icon: "✍️" },
                    { title: "SEO Content Writing", level: "Intermediate", students: 26400, rating: "4.9", icon: "📝" },
                    { title: "Blogging for Success", level: "Beginner", students: 22200, rating: "4.9", icon: "📖" },
                    { title: "Screenplay & Scriptwriting", level: "Intermediate", students: 18700, rating: "4.8", icon: "🎬" },
                    { title: "Email Marketing Copy", level: "Intermediate", students: 19800, rating: "4.8", icon: "📧" },
                    { title: "Fiction Writing Workshop", level: "Intermediate", students: 20500, rating: "4.9", icon: "📕" },
                    { title: "Editing & Proofreading Pro", level: "Advanced", students: 17300, rating: "4.8", icon: "✏️" },
                    { title: "Technical Writing Essentials", level: "Beginner", students: 15400, rating: "4.9", icon: "📋" },
                    { title: "Poetry & Verse Writing", level: "Intermediate", students: 12100, rating: "4.8", icon: "🎭" },
                    { title: "Grant Writing Mastery", level: "Advanced", students: 9800, rating: "4.9", icon: "🏆" },
                    { title: "Social Media Copywriting", level: "Beginner", students: 21200, rating: "4.8", icon: "📱" },
                  ].map((course, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 hover:border-blue-500/60 transition">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xl">{course.icon}</span>
                        <span className="text-[9px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">{course.level}</span>
                      </div>
                      <h4 className="font-black text-white text-xs mb-1">{course.title}</h4>
                      <div className="flex justify-between text-[9px] text-blue-100/60">
                        <span>👥 {course.students}K</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Featured Courses Section */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#00c8ff]" />
              <h2 className="text-lg font-black text-white">🔥 Featured This Week</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {getFeaturedCourses().map((course) => (
                <button
                  key={course.id}
                  className="group text-left rounded-xl border border-[#1e78ff]/40 bg-gradient-to-br from-[#1e78ff]/10 to-[#06101f] p-3 hover:border-[#1e78ff]/60 hover:shadow-lg hover:shadow-[#1e78ff]/10 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{course.icon}</span>
                    <span className="text-[10px] font-black text-[#00c8ff] bg-[#1e78ff]/20 px-2 py-1 rounded-full capitalize">{course.level}</span>
                  </div>
                  <h3 className="font-black text-white text-sm group-hover:text-[#00c8ff] transition mb-1">{course.title}</h3>
                  <p className="text-[10px] text-blue-100/50 line-clamp-1">{course.duration}</p>
                  <div className="flex gap-1 mt-2">
                    {course.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[8px] bg-[#1e78ff]/15 text-[#00c8ff] px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "explore" && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/40" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#06101f] border-[#12305f]/60 text-white"
                />
              </div>
              <div className="flex gap-1 bg-[#06101f]/90 border border-[#12305f]/60 rounded-xl p-1">
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black capitalize transition ${
                      levelFilter === level
                        ? "bg-[#1e78ff]/20 text-white border border-[#1e78ff]/50"
                        : "text-blue-100/60 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setCourseType("coding"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "coding"
                      ? "bg-[#1e78ff]/20 border border-[#1e78ff]/50 text-white"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  💻 Coding <span className="text-xs opacity-70">({codingCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("art"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "art"
                      ? "bg-purple-500/20 border border-purple-500/50 text-purple-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  🎨 Art <span className="text-xs opacity-70">({artCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("creator"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "creator"
                      ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  🚀 Creator <span className="text-xs opacity-70">({creatorCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("design"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "design"
                      ? "bg-pink-500/20 border border-pink-500/50 text-pink-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  🎭 Design <span className="text-xs opacity-70">({designCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("business"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "business"
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  💼 Business <span className="text-xs opacity-70">({businessCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("music"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "music"
                      ? "bg-red-500/20 border border-red-500/50 text-red-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  🎵 Music <span className="text-xs opacity-70">({musicCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("photography"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "photography"
                      ? "bg-green-500/20 border border-green-500/50 text-green-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  📸 Photography <span className="text-xs opacity-70">({photographyCoursesExpanded.length})</span>
                </button>
                <button
                  onClick={() => { setCourseType("writing"); setCategoryFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                    courseType === "writing"
                      ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                  }`}
                >
                  ✍️ Writing <span className="text-xs opacity-70">({writingCoursesExpanded.length})</span>
                </button>
              </div>

              {/* Category buttons based on selected course type */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    categoryFilter === "all"
                      ? "bg-white/15 border border-white/30 text-white"
                      : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/50 hover:text-blue-100"
                  }`}
                >
                  All
                </button>
                {categoryOptions[courseType].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                      categoryFilter === cat
                        ? "bg-white/15 border border-white/30 text-white"
                        : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/50 hover:text-blue-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#12305f] bg-[#06101f]/50 p-12 text-center">
              <p className="text-blue-100/60 text-sm">No courses match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <button
                  key={course.id}
                  className="group text-left rounded-2xl border border-[#12305f]/70 bg-[#06101f]/90 p-4 hover:border-[#1e78ff]/40 hover:shadow-lg hover:shadow-[#1e78ff]/10 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{course.icon}</span>
                    <span className="rounded-full bg-[#1e78ff]/20 px-2 py-1 text-[10px] font-black text-[#00c8ff] capitalize">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-black text-white mb-1.5 group-hover:text-[#00c8ff] transition">{course.title}</h3>
                  <p className="text-xs text-blue-100/60 mb-3 line-clamp-2">{course.description}</p>

                  <div className="space-y-1 mb-3 pb-3 border-b border-[#12305f]/50">
                    <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                      <Clock className="h-3 w-3" /> {course.duration}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                      <Users className="h-3 w-3" /> No enrollments yet
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-amber-300">No ratings yet</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#1e78ff]/10 px-2 py-0.5 text-[9px] font-black text-[#00c8ff]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-black text-[#00c8ff] text-sm group-hover:gap-3 transition">
                    <Play className="h-3.5 w-3.5" />
                    Start Learning
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-sm text-blue-100/50">Showing {filtered.length} of {getCourseCount()} courses in {courseType === "art" ? "Art" : courseType === "creator" ? "Creator Growth" : courseType === "design" ? "Design" : courseType === "business" ? "Business" : courseType === "music" ? "Music" : courseType === "photography" ? "Photography" : courseType === "writing" ? "Writing" : "Coding"}</p>
          </div>

          {/* Certifications & Credentials */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">🏆 Certifications Track</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "JavaScript Certified", courses: 5, progress: 60, icon: "📝" },
                { name: "UI/UX Designer", courses: 4, progress: 75, icon: "🎨" },
                { name: "Web Developer Pro", courses: 8, progress: 40, icon: "💻" },
                { name: "Content Creator Expert", courses: 6, progress: 50, icon: "🎬" },
                { name: "React Specialist", courses: 3, progress: 0, icon: "⚛️" },
                { name: "Music Producer", courses: 4, progress: 25, icon: "🎵" },
                { name: "Product Designer", courses: 5, progress: 0, icon: "📱" },
                { name: "Full Stack Developer", courses: 12, progress: 30, icon: "🌐" },
              ].map((cert, idx) => (
                <div key={idx} className="rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-amber-500/40 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{cert.icon}</span>
                    <span className="text-[9px] font-black text-amber-300">{cert.progress}%</span>
                  </div>
                  <p className="font-black text-white text-xs mb-2">{cert.name}</p>
                  <div className="w-full bg-[#12305f]/50 rounded-full h-1.5 mb-1">
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${cert.progress}%` }}></div>
                  </div>
                  <p className="text-[9px] text-blue-100/40">{cert.courses} courses</p>
                </div>
              ))}
            </div>
          </div>

          {/* Community Challenges */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white">🎯 Active Challenges</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "100 Days of Code", participants: 2847, days: "45/100", prize: "1000 XP", icon: "💻", color: "border-[#1e78ff]" },
                { title: "Design Sprint Challenge", participants: 523, days: "8/7", prize: "Certificate", icon: "🎨", color: "border-pink-500" },
                { title: "YouTube Thumbnail Duel", participants: 156, days: "3/5", prize: "$100", icon: "🎬", color: "border-red-500" },
                { title: "Music Production Hackathon", participants: 389, days: "2/7", prize: "Featured", icon: "🎵", color: "border-purple-500" },
              ].map((challenge, idx) => (
                <button key={idx} className={`text-left rounded-xl border-2 ${challenge.color} bg-[#03080f]/55 p-4 hover:opacity-80 transition`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{challenge.icon}</span>
                    <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <h4 className="font-black text-white text-sm mb-2">{challenge.title}</h4>
                  <div className="space-y-1 text-[10px]">
                    <p className="text-blue-100/60">👥 {challenge.participants} Participants</p>
                    <p className="text-blue-100/60">⏰ {challenge.days}</p>
                    <p className="text-amber-300 font-black">🏆 {challenge.prize}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Expert Interviews & Insights */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-black text-white">🎥 Expert Interviews</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "React Performance Tips with Kent C. Dodds", duration: "45 min", expert: "Kent C. Dodds", icon: "⚛️" },
                { title: "Building a Design System from Scratch", duration: "1 hr", expert: "Jen Simmons", icon: "🎨" },
                { title: "The Future of Web Development", duration: "38 min", expert: "Guillermo Rauch", icon: "🌐" },
                { title: "Music Production Career Path", duration: "52 min", expert: "Andrew Huang", icon: "🎵" },
              ].map((video, idx) => (
                <button key={idx} className="group text-left rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-red-500/40 transition">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl">{video.icon}</span>
                    <span className="text-[9px] font-black text-red-400">{video.duration}</span>
                  </div>
                  <h4 className="font-black text-white text-xs group-hover:text-red-300 transition mb-1">{video.title}</h4>
                  <p className="text-[10px] text-blue-100/50">with {video.expert}</p>
                </button>
              ))}
            </div>
          </div>



          {/* Live Workshops & Events */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-black text-white">📅 Upcoming Workshops</h2>
            </div>
            <div className="space-y-3">
              {[
                { title: "React Hooks Deep Dive", date: "Jun 5, 2026", time: "2:00 PM", instructor: "Sarah Dayan", spots: "12/50", icon: "⚛️" },
                { title: "Figma Design Critique Session", date: "Jun 6, 2026", time: "3:00 PM", instructor: "Sarah Dresner", spots: "8/30", icon: "🎨" },
                { title: "Building Your Personal Brand", date: "Jun 7, 2026", time: "4:00 PM", instructor: "Ali Abdaal", spots: "25/100", icon: "⭐" },
                { title: "Music Production Q&A", date: "Jun 8, 2026", time: "1:00 PM", instructor: "Busy Works Beats", spots: "5/20", icon: "🎵" },
              ].map((workshop, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-pink-500/40 transition">
                  <span className="text-xl">{workshop.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-xs">{workshop.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-[9px]">
                      <span className="text-blue-100/60">📅 {workshop.date}</span>
                      <span className="text-blue-100/60">⏰ {workshop.time}</span>
                      <span className="text-blue-100/60">👨‍🏫 {workshop.instructor}</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 text-[9px] font-black bg-pink-500/20 text-pink-300 px-2 py-1 rounded hover:bg-pink-500/30 transition">
                    {workshop.spots}
                  </button>
                </div>
              ))}
            </div>
          </div>



           {/* Resources */}
           <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
             <div className="flex items-center gap-2 mb-4">
               <Code className="h-5 w-5 text-[#00c8ff]" />
               <h2 className="text-lg font-black text-white">🔗 External Resources</h2>
             </div>
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
               {resources.map((resource) => (
                 <a
                   key={resource.name}
                   href={resource.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/40 transition"
                 >
                   <span className="text-xl">{resource.icon}</span>
                   <div className="min-w-0">
                     <p className="font-black text-white text-sm group-hover:text-[#00c8ff] truncate">{resource.name}</p>
                     <p className="text-[10px] text-blue-100/40">{resource.desc}</p>
                   </div>
                 </a>
               ))}
             </div>
           </div>



          {/* Curated Learning Paths */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#a855f7]" />
              <h2 className="text-lg font-black text-white">📚 Structured Learning Paths</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {getRecommendedPaths().map((path) => (
                <div key={path.title} className="rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-4 hover:border-[#1e78ff]/40 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`text-2xl mb-1`}>{path.icon}</p>
                      <h3 className="font-black text-white text-sm">{path.title}</h3>
                    </div>
                    <span className="text-[10px] font-black bg-[#1e78ff]/20 text-[#00c8ff] px-2 py-1 rounded-full">{path.level}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {path.courses.map((course, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1e78ff]"></div>
                        <span className="text-blue-100/70">{course}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 rounded-lg bg-[#1e78ff]/15 border border-[#1e78ff]/40 hover:bg-[#1e78ff]/25 text-[#00c8ff] font-black text-xs transition">
                    Start Path
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* Practice Projects */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white">🛠️ Hands-On Projects</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Build a Portfolio Website", desc: "Create a responsive portfolio using HTML, CSS & JavaScript", skills: ["HTML", "CSS", "JavaScript"], difficulty: "Beginner", icon: "💻" },
                { title: "Mobile App Prototyping", desc: "Design a mobile app prototype in Figma with user flows", skills: ["Figma", "UX Design"], difficulty: "Intermediate", icon: "📱" },
                { title: "Music Beat Production", desc: "Produce a 4-bar beat in your DAW with original drums", skills: ["Music Production", "DAW"], difficulty: "Beginner", icon: "🎵" },
                { title: "Blog Post Series", desc: "Write 5 SEO-optimized blog posts on a chosen topic", skills: ["SEO", "Writing", "Content"], difficulty: "Intermediate", icon: "📝" },
                { title: "Character Concept Art", desc: "Design a unique character with multiple poses and expressions", skills: ["Drawing", "Character Design"], difficulty: "Intermediate", icon: "🎨" },
                { title: "YouTube Video Launch", desc: "Create, edit, and publish your first YouTube video", skills: ["Video Production", "Editing", "Storytelling"], difficulty: "Beginner", icon: "📺" },
              ].map((project, idx) => (
                <button key={idx} className="group text-left rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 transition">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{project.icon}</span>
                    <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{project.difficulty}</span>
                  </div>
                  <h4 className="font-black text-white text-sm group-hover:text-emerald-300 transition mb-1">{project.title}</h4>
                  <p className="text-[10px] text-blue-100/60 mb-2 line-clamp-2">{project.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill) => (
                      <span key={skill} className="text-[8px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

           {/* Popular Learning Paths */}
           <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
             <div className="flex items-center gap-2 mb-4">
               <Zap className="h-5 w-5 text-yellow-400" />
               <h2 className="text-lg font-black text-white">⚡ Quick Start Guides</h2>
             </div>
             <div className="space-y-4">
               {[
                 { label: "🚀 30-Day Web Dev Challenge", color: "text-[#00c8ff]", dotColor: "bg-[#1e78ff]/20 text-[#00c8ff]", steps: [
                   { title: "Week 1: HTML & CSS Basics", desc: "Learn semantic HTML and modern CSS" },
                   { title: "Week 2: JavaScript Fundamentals", desc: "DOM manipulation and events" },
                   { title: "Week 3: Build 3 Projects", desc: "Todo app, calculator, weather widget" },
                   { title: "Week 4: Deploy & Share", desc: "Host on GitHub Pages, get feedback" },
                 ]},
                 { label: "🎨 30-Day Art Challenge", color: "text-purple-400", dotColor: "bg-purple-500/20 text-purple-400", steps: [
                   { title: "Week 1: Drawing Fundamentals", desc: "Anatomy, perspective, basic shapes" },
                   { title: "Week 2: Digital Painting", desc: "Color theory, brush techniques" },
                   { title: "Week 3: Character Design", desc: "Create 5 original characters" },
                   { title: "Week 4: Portfolio Piece", desc: "Polish your best work" },
                 ]},
               ].map((path) => (
                 <div key={path.label}>
                   <h3 className={`text-sm font-black mb-2 ${path.color}`}>{path.label}</h3>
                   <div className="space-y-1.5">
                     {path.steps.map((step, idx) => (
                       <div key={idx} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5 hover:border-[#1e78ff]/40 transition cursor-pointer">
                         <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${path.dotColor}`}>
                           {idx + 1}
                         </div>
                         <div className="min-w-0 flex-1">
                           <p className="font-black text-white text-xs">{step.title}</p>
                           <p className="text-[10px] text-blue-100/50">{step.desc}</p>
                         </div>
                         <button className="text-[10px] font-black text-[#00c8ff] hover:text-[#1e78ff] transition whitespace-nowrap">Start</button>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </>
      )}
    </div>
  );
}