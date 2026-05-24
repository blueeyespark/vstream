import React from "react";
import { Eye, FileVideo, Library, CircleDollarSign, Clapperboard, Calendar } from "lucide-react";

function fmt(value = 0) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value || 0);
}

export default function CreatorDashboard({ stats, videos = [], assets = [], setSection }) {
  const recent = videos.slice(0, 4);
  const fallbackProjects = [
    { id: "draft-1", title: "Neon City stream recap", type: "Short", stage: "Edit", updated: "Today" },
    { id: "draft-2", title: "Blue Room Radio thumbnail", type: "ArtForge", stage: "Package", updated: "Yesterday" },
    { id: "draft-3", title: "Creator Lab upload checklist", type: "Video", stage: "Idea", updated: "This week" },
  ];
  const projects = recent.length ? recent.map((video) => ({ id: video.id, title: video.title, type: video.status || "Video", stage: video.status === "ready" ? "Published" : "Edit", updated: video.created_date ? new Date(video.created_date).toLocaleDateString() : "Recent" })) : fallbackProjects;

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard icon={Eye} label="Total views" value={fmt(stats.views)} detail={stats.videos ? "From real uploads" : "No uploads yet"} />
          <MetricCard icon={FileVideo} label="Published" value={fmt(stats.videos)} detail="Ready videos" />
          <MetricCard icon={Library} label="Assets" value={fmt(stats.assets)} detail="Media and AI generations" />
          <MetricCard icon={CircleDollarSign} label="Revenue" value={`$${fmt(stats.revenue)}`} detail="Estimated snapshot" />
        </div>

        <section className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white">Continue Editing</h3>
            <button onClick={() => setSection("production")} className="text-xs font-black text-[#00c8ff]">Open Production</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {projects.map((project) => (
              <button key={project.id} onClick={() => setSection("production")} className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#00c8ff]/45">
                <p className="line-clamp-2 text-sm font-black text-white">{project.title}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-[#1e78ff]/12 px-2 py-1 font-black text-[#00c8ff]">{project.stage}</span>
                  <span className="text-blue-100/38">{project.updated}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white">Production Plan</h3>
            <button onClick={() => setSection("production")} className="text-xs font-black text-[#00c8ff]">Open Calendar</button>
          </div>
          <div className="grid gap-2 md:grid-cols-5">
            {['Idea','Create','Edit','Package','Publish'].map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-3">
                <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-[#00c8ff]/12 text-xs font-black text-[#00c8ff]">{index+1}</span>
                <p className="font-black text-white">{stage}</p>
                <p className="mt-1 text-xs text-blue-100/42">{index === 0 ? "Capture concepts" : index === 4 ? "Schedule or go live" : "Keep assets moving"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/55 p-4">
          <h4 className="font-black text-sm text-white">Notifications</h4>
          <div className="space-y-2 mt-3">
            {['No urgent upload issues', assets.length ? `${assets.length} assets available for packaging` : 'Upload or generate your first reusable asset', 'Community moderation queue is clear'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4">
      <Icon className="mb-4 h-5 w-5 text-[#00c8ff]" />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</p>
      <p className="mt-2 text-xs text-blue-100/45">{detail}</p>
    </div>
  );
}
