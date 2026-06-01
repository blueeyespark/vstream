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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-gradient-to-r from-[#06101f]/90 to-[#0a1525]/90 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-2xl">
            📚
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white">Learning Hub</h1>
            <p className="text-sm text-blue-100/60 mt-1">Master new skills with 150+ comprehensive courses across coding, art & content creation</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#12305f]/50">
          <div className="text-center">
            <p className="text-2xl font-black text-[#00c8ff]">150+</p>
            <p className="text-xs text-blue-100/50">Total Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-300">0</p>
            <p className="text-xs text-blue-100/50">Students Enrolled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-400">N/A</p>
            <p className="text-xs text-blue-100/50">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 border-b border-[#12305f]/50 min-w-max">
          {[
            { id: "explore", label: "🔍 Explore", icon: "" },
            { id: "coding", label: "💻 Coding", icon: "" },
            { id: "art", label: "🎨 Art", icon: "" },
            { id: "creator", label: "🎬 Creator", icon: "" },
            { id: "design", label: "🖌️ Design", icon: "" },
            { id: "business", label: "💼 Business", icon: "" },
            { id: "music", label: "🎵 Music", icon: "" },
            { id: "photography", label: "📸 Photography", icon: "" },
            { id: "writing", label: "✍️ Writing", icon: "" },
            { id: "mycourses", label: "📚 My Courses", icon: "" },
            { id: "pathgen", label: "🤖 Path Gen", icon: "" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 font-black text-xs sm:text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-b-2 border-[#1e78ff] text-[#00c8ff]"
                  : "border-b-2 border-transparent text-blue-100/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "mycourses" ? (
        <MyCourses />
      ) : activeTab === "pathgen" ? (
        <LearningPathGenerator />
      ) : activeTab === "coding" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-[#00c8ff] mb-4">💻 Learn to Code</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "JavaScript Fundamentals", level: "Beginner", students: "45K", rating: "4.9", icon: "📚" },
                { title: "React.js Mastery", level: "Intermediate", students: "32K", rating: "4.8", icon: "⚛️" },
                { title: "Python for Data Science", level: "Intermediate", students: "28K", rating: "4.7", icon: "🐍" },
                { title: "Web Development Bootcamp", level: "Beginner", students: "56K", rating: "4.9", icon: "🌐" },
                { title: "Advanced TypeScript", level: "Advanced", students: "12K", rating: "4.8", icon: "📘" },
                { title: "Backend with Node.js", level: "Intermediate", students: "19K", rating: "4.7", icon: "⚙️" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/40 transition">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{course.icon}</span>
                    <span className="text-[9px] font-black text-[#00c8ff]">{course.level}</span>
                  </div>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <div className="flex justify-between text-[9px] text-blue-100/50">
                    <span>👥 {course.students}</span>
                    <span>⭐ {course.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "art" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-pink-300 mb-4">🎨 Digital & Traditional Art</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Digital Painting Fundamentals", level: "Beginner", icon: "🎨", price: "Free" },
                { title: "Character Design Essentials", level: "Intermediate", icon: "👤", price: "$49" },
                { title: "Concept Art for Games", level: "Advanced", icon: "🎮", price: "$79" },
                { title: "Illustration Mastery", level: "Intermediate", icon: "✨", price: "$59" },
                { title: "Animation Basics", level: "Beginner", icon: "📽️", price: "Free" },
                { title: "Photoshop Advanced Techniques", level: "Intermediate", icon: "🖼️", price: "$39" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-pink-500/30 bg-pink-500/5 p-3 hover:border-pink-500/60 transition">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{course.icon}</span>
                    <span className="text-[9px] font-black text-pink-300">{course.price}</span>
                  </div>
                  <p className="font-black text-white text-xs">{course.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "creator" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-red-400 mb-4">🎬 Content Creation & YouTube</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "YouTube Channel Mastery", icon: "📺", students: "67K", color: "bg-red-500/10" },
                { title: "Video Editing Pro (Premiere)", icon: "✂️", students: "34K", color: "bg-red-500/10" },
                { title: "Content Strategy & Planning", icon: "📋", students: "28K", color: "bg-red-500/10" },
                { title: "Thumbnail Design Secrets", icon: "🖼️", students: "19K", color: "bg-red-500/10" },
                { title: "Viral Content Techniques", icon: "🚀", students: "45K", color: "bg-red-500/10" },
                { title: "Personal Branding 2026", icon: "⭐", students: "52K", color: "bg-red-500/10" },
              ].map((course, idx) => (
                <button key={idx} className={`text-left rounded-lg border border-red-500/30 ${course.color} p-3 hover:border-red-500/60 transition`}>
                  <p className="text-2xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-blue-100/50">👥 {course.students}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "design" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-purple-300 mb-4">🖌️ UI/UX & Graphic Design</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Figma Complete Course", icon: "🎨", level: "Beginner" },
                { title: "UI Design Principles", icon: "📐", level: "Beginner" },
                { title: "Advanced UX Research", icon: "🔍", level: "Advanced" },
                { title: "Design Systems Mastery", icon: "🧩", level: "Advanced" },
                { title: "Web Design 2026", icon: "🌐", level: "Intermediate" },
                { title: "Mobile App Design", icon: "📱", level: "Intermediate" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 hover:border-purple-500/60 transition">
                  <p className="text-xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-purple-300/60">{course.level}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "business" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-amber-300 mb-4">💼 Business & Entrepreneurship</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Startup Fundamentals", icon: "🚀", duration: "8 weeks" },
                { title: "Sales Mastery", icon: "💰", duration: "6 weeks" },
                { title: "Digital Marketing", icon: "📊", duration: "10 weeks" },
                { title: "Financial Analysis", icon: "📈", duration: "8 weeks" },
                { title: "Leadership & Management", icon: "👔", duration: "12 weeks" },
                { title: "Product Strategy", icon: "🎯", duration: "6 weeks" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 hover:border-amber-500/60 transition">
                  <p className="text-xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-amber-300/60">⏱️ {course.duration}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "music" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-red-300 mb-4">🎵 Music Production & Theory</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Music Production 101", icon: "🎙️", genre: "All Genres" },
                { title: "Beat Making & Hip Hop", icon: "🎧", genre: "Hip Hop" },
                { title: "Electronic Music Production", icon: "🎹", genre: "Electronic" },
                { title: "Music Theory for Producers", icon: "📝", genre: "All" },
                { title: "Mixing & Mastering Pro", icon: "🔊", genre: "All" },
                { title: "Music Publishing 101", icon: "📜", genre: "Business" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-red-500/30 bg-red-500/5 p-3 hover:border-red-500/60 transition">
                  <p className="text-xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-red-300/60">{course.genre}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "photography" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-cyan-300 mb-4">📸 Photography & Videography</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Portrait Photography Basics", icon: "👤", level: "Beginner" },
                { title: "Landscape Photography Mastery", icon: "🏔️", level: "Intermediate" },
                { title: "Studio Lighting Techniques", icon: "💡", level: "Intermediate" },
                { title: "Post-Processing & Lightroom", icon: "✨", level: "Intermediate" },
                { title: "Cinematic Videography", icon: "🎬", level: "Advanced" },
                { title: "Product Photography Pro", icon: "📷", level: "Beginner" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 hover:border-cyan-500/60 transition">
                  <p className="text-xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-cyan-300/60">{course.level}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "writing" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <h2 className="text-lg font-black text-green-300 mb-4">✍️ Writing & Content</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Copywriting Mastery", icon: "✍️", type: "Marketing" },
                { title: "Technical Writing Basics", icon: "📖", type: "Documentation" },
                { title: "Screenwriting 101", icon: "🎬", type: "Creative" },
                { title: "SEO Content Strategy", icon: "🔍", type: "Marketing" },
                { title: "Blog Writing for Success", icon: "📝", type: "Content" },
                { title: "Novel Writing Workshop", icon: "📚", type: "Creative" },
              ].map((course, idx) => (
                <button key={idx} className="text-left rounded-lg border border-green-500/30 bg-green-500/5 p-3 hover:border-green-500/60 transition">
                  <p className="text-xl mb-2">{course.icon}</p>
                  <p className="font-black text-white text-xs mb-1">{course.title}</p>
                  <p className="text-[9px] text-green-300/60">{course.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
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

          {/* Learning Resources Library */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-black text-white">📚 Resource Library</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "MDN Web Docs", type: "Reference", desc: "Comprehensive web dev docs", icon: "📖", url: "#" },
                { name: "Figma Community", type: "Assets", desc: "10k+ design files & components", icon: "🎨", url: "#" },
                { name: "GitHub Awesome Lists", type: "Curated", desc: "Topic-specific resource lists", icon: "⭐", url: "#" },
                { name: "CSS Tricks", type: "Blog", desc: "Advanced CSS techniques & tips", icon: "✨", url: "#" },
                { name: "Dev.to Articles", type: "Blog", desc: "Developer community articles", icon: "📝", url: "#" },
                { name: "Stack Overflow", type: "Q&A", desc: "Ask and answer coding questions", icon: "❓", url: "#" },
                { name: "Codepen", type: "Showcase", desc: "Share & discover code pens", icon: "💻", url: "#" },
                { name: "Behance", type: "Portfolio", desc: "Design inspiration & portfolios", icon: "🎬", url: "#" },
                { name: "Unsplash", type: "Photos", desc: "1M+ free high-quality images", icon: "📸", url: "#" },
              ].map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  className="group rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{resource.icon}</span>
                    <div className="min-w-0">
                      <p className="font-black text-white text-xs group-hover:text-cyan-300 transition">{resource.name}</p>
                      <p className="text-[9px] text-cyan-300/60">{resource.type}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-100/50">{resource.desc}</p>
                </a>
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

          {/* Case Studies & Real-World Examples */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-black text-white">📊 Case Studies</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "How I Built a $1M SaaS in 6 Months", category: "Entrepreneurship", reads: "12.4K", icon: "💼" },
                { title: "Redesigning Airbnb's Search Experience", category: "Product Design", reads: "8.9K", icon: "🎨" },
                { title: "Growing YouTube Channel to 1M Subs", category: "Content Creation", reads: "15.2K", icon: "📺" },
                { title: "Music Producer's Journey to 10M Streams", category: "Music", reads: "6.3K", icon: "🎵" },
              ].map((study, idx) => (
                <button key={idx} className="text-left rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-blue-500/40 transition">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{study.icon}</span>
                    <span className="text-[9px] font-black text-blue-300">{study.reads} reads</span>
                  </div>
                  <h4 className="font-black text-white text-xs mb-1 line-clamp-2">{study.title}</h4>
                  <p className="text-[10px] text-blue-100/50">{study.category}</p>
                </button>
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

          {/* Drawing Tools */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-black text-white">Drawing Tools & Practice</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                <h4 className="font-black text-purple-300 mb-2">🖐️ Hand Helper</h4>
                <p className="text-sm text-blue-100/70 mb-3">Improve stroke stability and hand control with guided drawing exercises.</p>
                <button className="w-full rounded-lg bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 font-black text-sm py-2 transition">
                  Start Practicing
                </button>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <h4 className="font-black text-cyan-300 mb-2">📱 Tracer</h4>
                <p className="text-sm text-blue-100/70 mb-3">Trace lines accurately and build precision with phone-based line tracing exercises.</p>
                <button className="w-full rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-black text-sm py-2 transition">
                  Start Tracing
                </button>
              </div>
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

          {/* Skill Assessment & Progress */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">🎯 Your Skill Level</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { skill: "Programming", level: "Beginner", progress: 25, color: "bg-[#1e78ff]" },
                { skill: "Design", level: "Intermediate", progress: 60, color: "bg-pink-500" },
                { skill: "Content Creation", level: "Beginner", progress: 15, color: "bg-amber-500" },
                { skill: "Music Production", level: "Not Started", progress: 0, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.skill} className="rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3">
                  <p className="text-xs font-black text-white mb-1">{item.skill}</p>
                  <p className="text-[10px] text-blue-100/50 mb-2">{item.level}</p>
                  <div className="w-full bg-[#12305f]/50 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <p className="text-[9px] text-blue-100/40 mt-2">{item.progress}% complete</p>
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