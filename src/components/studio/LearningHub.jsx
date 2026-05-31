import { useState } from "react";
import { BookOpen, Code, Play, Star, Clock, Users, ChevronRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const courses = [
  // Beginner Frontend
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript: variables, functions, objects, and async patterns.",
    level: "beginner",
    duration: "4 hours",
    students: 12400,
    rating: 4.8,
    tags: ["JavaScript", "Web Dev", "Fundamentals"],
    icon: "📝",
  },
  {
    id: 2,
    title: "HTML & CSS Essentials",
    description: "Master semantic HTML, responsive CSS, flexbox, grid, and modern layout techniques.",
    level: "beginner",
    duration: "3 hours",
    students: 18000,
    rating: 4.7,
    tags: ["HTML", "CSS", "Frontend"],
    icon: "🏗️",
  },
  {
    id: 3,
    title: "Web Design Principles",
    description: "Design stunning UIs: typography, color theory, layout, accessibility, and responsiveness.",
    level: "beginner",
    duration: "3 hours",
    students: 15600,
    rating: 4.6,
    tags: ["Design", "CSS", "UX"],
    icon: "🎨",
  },
  
  // Intermediate Frontend
  {
    id: 4,
    title: "React Basics to Advanced",
    description: "Master React: hooks, state management, performance optimization, and best practices.",
    level: "intermediate",
    duration: "6 hours",
    students: 8900,
    rating: 4.9,
    tags: ["React", "Frontend", "UI"],
    icon: "⚛️",
  },
  {
    id: 5,
    title: "Vue.js Complete Guide",
    description: "Build reactive UIs with Vue: components, directives, lifecycle, composition API.",
    level: "intermediate",
    duration: "5 hours",
    students: 6200,
    rating: 4.7,
    tags: ["Vue", "Frontend", "Framework"],
    icon: "💚",
  },
  {
    id: 6,
    title: "REST APIs & HTTP Protocols",
    description: "Understand HTTP methods, status codes, RESTful design, CORS, and API authentication.",
    level: "intermediate",
    duration: "4 hours",
    students: 9100,
    rating: 4.8,
    tags: ["API", "HTTP", "Backend"],
    icon: "🌐",
  },

  // Beginner Backend
  {
    id: 7,
    title: "Python for Beginners",
    description: "Learn Python basics: syntax, data structures, functions, and object-oriented programming.",
    level: "beginner",
    duration: "4.5 hours",
    students: 14300,
    rating: 4.8,
    tags: ["Python", "Backend", "Programming"],
    icon: "🐍",
  },
  {
    id: 8,
    title: "Java Essentials",
    description: "Master Java fundamentals: syntax, OOP, collections, exception handling, and streams.",
    level: "beginner",
    duration: "5 hours",
    students: 11200,
    rating: 4.7,
    tags: ["Java", "Backend", "OOP"],
    icon: "☕",
  },

  // Intermediate Backend
  {
    id: 9,
    title: "Building APIs with Node.js",
    description: "Create scalable backend services: Express, authentication, databases, and deployment.",
    level: "intermediate",
    duration: "5 hours",
    students: 7200,
    rating: 4.7,
    tags: ["Node.js", "Backend", "API"],
    icon: "🔌",
  },
  {
    id: 10,
    title: "Spring Boot & Java Web Development",
    description: "Build enterprise Java apps: Spring MVC, dependency injection, REST endpoints, security.",
    level: "intermediate",
    duration: "6.5 hours",
    students: 5800,
    rating: 4.8,
    tags: ["Java", "Spring", "Backend"],
    icon: "🌱",
  },
  {
    id: 11,
    title: "Python Django Framework",
    description: "Build web applications with Django: models, views, templates, authentication, and ORM.",
    level: "intermediate",
    duration: "5.5 hours",
    students: 6400,
    rating: 4.7,
    tags: ["Python", "Django", "Backend"],
    icon: "🎯",
  },

  // Database
  {
    id: 12,
    title: "Database Design & SQL",
    description: "Design normalized databases and write efficient queries: PostgreSQL, indexing, transactions.",
    level: "intermediate",
    duration: "5 hours",
    students: 6800,
    rating: 4.8,
    tags: ["SQL", "Database", "Backend"],
    icon: "🗄️",
  },
  {
    id: 13,
    title: "MongoDB & NoSQL Databases",
    description: "Master NoSQL: document models, querying, indexing, and when to use NoSQL vs SQL.",
    level: "intermediate",
    duration: "4 hours",
    students: 5100,
    rating: 4.6,
    tags: ["MongoDB", "NoSQL", "Database"],
    icon: "🍃",
  },

  // Advanced
  {
    id: 14,
    title: "TypeScript Mastery",
    description: "Leverage TypeScript for type-safe code: generics, interfaces, decorators, and tooling.",
    level: "advanced",
    duration: "4.5 hours",
    students: 5400,
    rating: 4.9,
    tags: ["TypeScript", "Advanced", "Best Practices"],
    icon: "📘",
  },
  {
    id: 15,
    title: "Advanced Java: Concurrency & Performance",
    description: "Master multi-threading, concurrent collections, GC tuning, and performance optimization.",
    level: "advanced",
    duration: "5.5 hours",
    students: 3200,
    rating: 4.8,
    tags: ["Java", "Concurrency", "Advanced"],
    icon: "⚡",
  },
  {
    id: 16,
    title: "System Design for Scalability",
    description: "Design large-scale systems: microservices, caching, load balancing, and distributed systems.",
    level: "advanced",
    duration: "7 hours",
    students: 4100,
    rating: 4.9,
    tags: ["Architecture", "System Design", "Advanced"],
    icon: "🏛️",
  },
  {
    id: 17,
    title: "DevOps & Cloud Deployment",
    description: "Deploy to the cloud: Docker, Kubernetes, CI/CD pipelines, AWS, and infrastructure as code.",
    level: "advanced",
    duration: "6 hours",
    students: 4700,
    rating: 4.8,
    tags: ["DevOps", "Docker", "Cloud"],
    icon: "☁️",
  },

  // Specialized
  {
    id: 18,
    title: "C++ Fundamentals",
    description: "Learn C++: memory management, pointers, templates, and performance-critical code.",
    level: "intermediate",
    duration: "6 hours",
    students: 3800,
    rating: 4.6,
    tags: ["C++", "Systems Programming"],
    icon: "⚙️",
  },
  {
    id: 19,
    title: "Go Programming Language",
    description: "Master Go: goroutines, channels, concurrency patterns, and building high-performance services.",
    level: "intermediate",
    duration: "4.5 hours",
    students: 4200,
    rating: 4.7,
    tags: ["Go", "Concurrency", "Backend"],
    icon: "🐹",
  },
  {
    id: 20,
    title: "Machine Learning with Python",
    description: "Intro to ML: scikit-learn, pandas, numpy, data visualization, and supervised learning.",
    level: "advanced",
    duration: "7 hours",
    students: 5900,
    rating: 4.8,
    tags: ["Python", "ML", "Data Science"],
    icon: "🤖",
  },
];

const resources = [
  { name: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "📚", desc: "Comprehensive web dev reference" },
  { name: "GitHub", url: "https://github.com", icon: "🐙", desc: "Version control & code hosting" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "❓", desc: "Q&A for developers" },
  { name: "Dev.to", url: "https://dev.to", icon: "💻", desc: "Developer articles & tutorials" },
];

export default function LearningHub() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || course.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-xl">
            📚
          </span>
          <div>
            <h1 className="text-2xl font-black text-white">Learning Hub</h1>
            <p className="text-sm text-blue-100/50">Level up your coding skills with curated courses and resources</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
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

      {/* Courses Grid */}
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

            <div className="space-y-2 mb-3 pb-3 border-b border-[#12305f]/50">
              <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                <Clock className="h-3 w-3" /> {course.duration}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-blue-100/50">
                <Users className="h-3 w-3" /> {(course.students / 1000).toFixed(1)}k students
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] text-amber-300">{course.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {course.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#1e78ff]/12 px-2 py-0.5 text-[9px] font-black text-[#00c8ff]">
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
              className="group flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/8 transition"
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

      {/* Drawing Learning Tools */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">✏️</span>
          <h2 className="text-lg font-black text-white">Drawing & Tracing Tools</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "Tracer",
              desc: "Upload an image and use your phone to trace lines and shapes in real-time",
              icon: "📱",
              features: ["Image upload", "Live tracing", "Phone camera", "Line detection"],
            },
            {
              name: "Hand Helper",
              desc: "AI-powered drawing assistant that helps stabilize your strokes and improve technique",
              icon: "🖐️",
              features: ["Stroke stabilization", "Technique tips", "Real-time feedback", "Practice modes"],
            },
          ].map((tool) => (
            <div key={tool.name} className="rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-black text-white">{tool.name}</h3>
                  <p className="text-xs text-blue-100/60 mt-0.5">{tool.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {tool.features.map((feature) => (
                  <span key={feature} className="rounded-full bg-[#1e78ff]/12 px-2 py-0.5 text-[9px] font-black text-[#00c8ff]">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[#a855f7]" />
          <h2 className="text-lg font-black text-white">Popular Learning Paths</h2>
        </div>
        
        <div className="space-y-4">
          {/* Frontend Path */}
          <div>
            <h3 className="text-sm font-black text-[#00c8ff] mb-2">🎨 Frontend Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "HTML & CSS Essentials", desc: "Web fundamentals" },
                { step: 2, title: "JavaScript Fundamentals", desc: "Core language" },
                { step: 3, title: "React Basics to Advanced", desc: "Modern UI library" },
                { step: 4, title: "TypeScript Mastery", desc: "Type-safe code" },
              ].map(({ step, title, desc }) => (
                <div key={`frontend-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e78ff]/20 text-xs font-black text-[#00c8ff] flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Path */}
          <div>
            <h3 className="text-sm font-black text-emerald-400 mb-2">⚙️ Backend Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Python for Beginners", desc: "Beginner-friendly language" },
                { step: 2, title: "REST APIs & HTTP Protocols", desc: "Web API fundamentals" },
                { step: 3, title: "Building APIs with Node.js", desc: "JavaScript backend" },
                { step: 4, title: "Database Design & SQL", desc: "Data persistence" },
                { step: 5, title: "System Design for Scalability", desc: "Large-scale systems" },
              ].map(({ step, title, desc }) => (
                <div key={`backend-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Java Path */}
          <div>
            <h3 className="text-sm font-black text-amber-400 mb-2">☕ Java Developer Path</h3>
            <div className="space-y-1.5">
              {[
                { step: 1, title: "Java Essentials", desc: "Core language & OOP" },
                { step: 2, title: "REST APIs & HTTP Protocols", desc: "Web fundamentals" },
                { step: 3, title: "Spring Boot & Java Web Development", desc: "Enterprise framework" },
                { step: 4, title: "Database Design & SQL", desc: "Data management" },
                { step: 5, title: "Advanced Java: Concurrency & Performance", desc: "Expert level" },
              ].map(({ step, title, desc }) => (
                <div key={`java-${step}`} className="flex items-start gap-3 rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-400 flex-shrink-0">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs">{title}</p>
                    <p className="text-[10px] text-blue-100/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Skills */}
      <div className="rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 p-4 sm:p-6">
        <h3 className="text-lg font-black text-white mb-3">📚 Programming Languages & Frameworks</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { lang: "JavaScript/Node.js", level: "Beginner to Expert", icon: "📝" },
            { lang: "Python", level: "Beginner to Expert", icon: "🐍" },
            { lang: "Java", level: "Beginner to Expert", icon: "☕" },
            { lang: "C++", level: "Intermediate to Expert", icon: "⚙️" },
            { lang: "Go", level: "Intermediate to Expert", icon: "🐹" },
            { lang: "React/Vue.js", level: "Beginner to Expert", icon: "⚛️" },
            { lang: "Django/Flask", level: "Intermediate to Expert", icon: "🎯" },
            { lang: "Spring Boot", level: "Intermediate to Expert", icon: "🌱" },
            { lang: "DevOps & Cloud", level: "Intermediate to Expert", icon: "☁️" },
          ].map(({ lang, level, icon }) => (
            <div key={lang} className="rounded-lg border border-[#12305f]/50 bg-[#03080f]/55 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <p className="font-black text-white text-sm">{lang}</p>
              </div>
              <p className="text-xs text-blue-100/50">{level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Learning Path Section - Hidden */}
      <div className="hidden">
        <div className="space-y-2">
          {[
            { step: 1, title: "JavaScript Fundamentals", desc: "Master core language concepts" },
            { step: 2, title: "Web Design Principles", desc: "Learn UI/UX and CSS" },
            { step: 3, title: "React Basics to Advanced", desc: "Build modern frontends" },
            { step: 4, title: "Building APIs with Node.js", desc: "Create backend services" },
            { step: 5, title: "Database Design & SQL", desc: "Store and query data" },
            { step: 6, title: "TypeScript Mastery", desc: "Write production-grade code" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3 rounded-xl border border-[#12305f]/50 bg-[#03080f]/55 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e78ff]/20 text-xs font-black text-[#00c8ff] flex-shrink-0">
                {step}
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-sm">{title}</p>
                <p className="text-xs text-blue-100/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}