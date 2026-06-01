import { useState } from "react";
import { BookOpen, Code, Play, Star, Clock, Users, ChevronRight, Search, Sparkles, Trophy, Zap, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { expandedCourses, creatorCoursesExpanded, codingCoursesExpanded, artCoursesExpanded } from "@/lib/expandedCoursesData";
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
  const [expandedCategories, setExpandedCategories] = useState({});

  let allCourses = expandedCourses;
  if (courseType === "art") allCourses = artCoursesExpanded;
  if (courseType === "coding") allCourses = codingCoursesExpanded;
  if (courseType === "creator") allCourses = creatorCoursesExpanded;

  const filtered = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Group courses by category
  const groupedCourses = filtered.reduce((acc, course) => {
    const category = course.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(course);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getCourseCount = () => {
    switch(courseType) {
      case "coding": return codingCoursesExpanded.length;
      case "art": return artCoursesExpanded.length;
      case "creator": return creatorCoursesExpanded.length;
      default: return expandedCourses.length;
    }
  };

  return (
    <div className="space-y-4">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="bg-[#06101f] border border-[#12305f] flex flex-wrap">
          <TabsTrigger value="explore">Explore Courses</TabsTrigger>
          <TabsTrigger value="mycourses" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> My Courses
          </TabsTrigger>
          <TabsTrigger value="pathgen" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> AI Path
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "mycourses" ? (
        <MyCourses />
      ) : activeTab === "pathgen" ? (
        <LearningPathGenerator />
      ) : (
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCourseType("coding")}
                className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                  courseType === "coding"
                    ? "bg-[#1e78ff]/20 border border-[#1e78ff]/50 text-white"
                    : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                }`}
              >
                💻 Coding <span className="text-xs opacity-70">({codingCoursesExpanded.length})</span>
              </button>
              <button
                onClick={() => setCourseType("art")}
                className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                  courseType === "art"
                    ? "bg-purple-500/20 border border-purple-500/50 text-purple-300"
                    : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                }`}
              >
                🎨 Art <span className="text-xs opacity-70">({artCoursesExpanded.length})</span>
              </button>
              <button
                onClick={() => setCourseType("creator")}
                className={`px-4 py-2 rounded-lg text-sm font-black transition flex items-center gap-2 ${
                  courseType === "creator"
                    ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                    : "bg-[#06101f] border border-[#12305f]/60 text-blue-100/60 hover:text-white"
                }`}
              >
                🚀 Creator <span className="text-xs opacity-70">({creatorCoursesExpanded.length})</span>
              </button>
            </div>
          </div>

          {/* Courses by Category */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#12305f] bg-[#06101f]/50 p-12 text-center">
              <p className="text-blue-100/60 text-sm">No courses match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCourses).map(([category, courses]) => (
                <div key={category} className="rounded-xl border border-[#12305f]/70 bg-[#06101f]/90 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between gap-3 p-4 hover:bg-[#0a1525]/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{courses[0]?.icon || "📚"}</span>
                      <div className="text-left">
                        <h3 className="font-black text-white text-base">{category}</h3>
                        <p className="text-xs text-blue-100/50">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-[#00c8ff] transition transform ${expandedCategories[category] ? "rotate-180" : ""}`} />
                  </button>

                  {expandedCategories[category] && (
                    <div className="grid gap-3 p-4 border-t border-[#12305f]/50 sm:grid-cols-2 lg:grid-cols-3">
                      {courses.map((course) => (
                        <button
                          key={course.id}
                          className="group text-left rounded-xl border border-[#12305f]/50 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/40 hover:shadow-lg hover:shadow-[#1e78ff]/10 transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xl">{course.icon}</span>
                            <span className="rounded-full bg-[#1e78ff]/20 px-2 py-0.5 text-[9px] font-black text-[#00c8ff] capitalize">
                              {course.level}
                            </span>
                          </div>
                          <h4 className="font-black text-white mb-1 group-hover:text-[#00c8ff] transition text-sm">{course.title}</h4>
                          <p className="text-xs text-blue-100/60 mb-2 line-clamp-2">{course.description}</p>

                          <div className="space-y-0.5 mb-2 pb-2 border-b border-[#12305f]/50">
                            <div className="flex items-center gap-2 text-[9px] text-blue-100/50">
                              <Clock className="h-2.5 w-2.5" /> {course.duration}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-0.5 mb-2">
                            {course.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-[#1e78ff]/10 px-1.5 py-0.5 text-[8px] font-black text-[#00c8ff]">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 font-black text-[#00c8ff] text-xs group-hover:gap-3 transition">
                            <Play className="h-3 w-3" />
                            Learn
                            <ChevronRight className="h-3 w-3 ml-auto" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-sm text-blue-100/50">Showing {filtered.length} of {getCourseCount()} courses in {courseType === "art" ? "Art" : courseType === "creator" ? "Creator Growth" : "Coding"}</p>
          </div>

          {/* Resources */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-[#00c8ff]" />
              <h2 className="text-lg font-black text-white">Recommended Resources</h2>
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

          {/* Learning Paths */}
          <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#a855f7]" />
              <h2 className="text-lg font-black text-white">Popular Learning Paths</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "🎨 Frontend Developer Path", color: "text-[#00c8ff]", dotColor: "bg-[#1e78ff]/20 text-[#00c8ff]", steps: [
                  { title: "HTML & CSS Essentials", desc: "Web fundamentals" },
                  { title: "JavaScript Fundamentals", desc: "Core language" },
                  { title: "React Basics to Advanced", desc: "Modern UI library" },
                  { title: "TypeScript Mastery", desc: "Type-safe code" },
                ]},
                { label: "⚙️ Backend Developer Path", color: "text-emerald-400", dotColor: "bg-emerald-500/20 text-emerald-400", steps: [
                  { title: "Python for Beginners", desc: "Beginner-friendly language" },
                  { title: "Building APIs with Node.js", desc: "JavaScript backend" },
                  { title: "Database Design & SQL", desc: "Data persistence" },
                  { title: "System Design for Scalability", desc: "Large-scale systems" },
                ]},
                { label: "🎨 Digital Artist Path", color: "text-purple-400", dotColor: "bg-purple-500/20 text-purple-400", steps: [
                  { title: "Drawing Fundamentals", desc: "Core techniques & theory" },
                  { title: "Digital Painting Fundamentals", desc: "Learn digital tools" },
                  { title: "Character Design Essentials", desc: "Create unique characters" },
                  { title: "Concept Art for Games", desc: "Production design" },
                ]},
              ].map((path) => (
                <div key={path.label}>
                  <h3 className={`text-sm font-black mb-2 ${path.color}`}>{path.label}</h3>
                  <div className="space-y-1.5">
                    {path.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${path.dotColor}`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-xs">{step.title}</p>
                          <p className="text-[10px] text-blue-100/50">{step.desc}</p>
                        </div>
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