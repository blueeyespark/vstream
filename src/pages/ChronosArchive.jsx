import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Archive, Play, Search, Clock, Eye,
  Radio, Film, Music, Scissors, LayoutGrid
} from "lucide-react";
import VideoPlayerModal from "@/components/dashboard/VideoPlayerModal";

const TABS = [
  { id: "all",     label: "All",     icon: LayoutGrid },
  { id: "live",    label: "Streams", icon: Radio },
  { id: "vod",     label: "VODs",    icon: Film },
  { id: "clip",    label: "Clips",   icon: Scissors },
  { id: "music",   label: "Music",   icon: Music },
];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function fmtDuration(secs) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ArchiveCard({ video, channel, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="group cursor-pointer bg-[#060d18]/60 border border-blue-900/30 rounded-2xl overflow-hidden hover:border-[#1e78ff]/40 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300"
      onClick={() => onClick(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#050a14]">
        <img
          src={video.thumbnail_url || `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop&sig=${video.id}`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
        {video.duration_seconds > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-semibold px-2 py-0.5 rounded-lg backdrop-blur-sm">
            {fmtDuration(video.duration_seconds)}
          </span>
        )}
        {video.status === "live" && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#c8dff5] line-clamp-2 leading-snug mb-1.5">{video.title}</h3>
        <div className="flex items-center justify-between text-xs text-blue-400/40">
          <span className="flex items-center gap-1 truncate">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex-shrink-0" />
            {channel?.channel_name || "Creator"}
          </span>
          <span className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {fmt(video.view_count)}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {timeAgo(video.published_date || video.created_date)}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChronosArchive() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos = [] } = useQuery({
    queryKey: ["videos-all"],
    queryFn: () => base44.entities.Video.list("-created_date", 100),
    staleTime: 5 * 60 * 1000,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
  });

  const channelMap = useMemo(
    () => channels.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
    [channels]
  );

  const filtered = useMemo(() => {
    return videos
      .filter(v => v.status !== "deleted" && v.status !== "uploading")
      .filter(v => {
        if (activeTab === "live") return v.status === "live";
        if (activeTab === "clip") return v.duration_seconds > 0 && v.duration_seconds < 90;
        if (activeTab === "music") return v.category?.toLowerCase() === "music";
        if (activeTab === "vod") return v.duration_seconds >= 90 && v.status !== "live";
        return true;
      })
      .filter(v => !search || v.title?.toLowerCase().includes(search.toLowerCase()) || channelMap[v.channel_id]?.channel_name?.toLowerCase().includes(search.toLowerCase()));
  }, [videos, activeTab, search, channelMap]);

  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* Header */}
      <div className="border-b border-[#1e78ff]/20 bg-[#030810]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-200 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg px-3 py-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#1e78ff] flex items-center justify-center">
              <Archive className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">Chronos Archive</span>
            <span className="text-xs text-blue-400/30">{filtered.length} videos</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero — VFusions style */}
        <div className="mb-10">
          <p className="text-[#00c8ff] text-xs font-bold uppercase tracking-[0.2em] mb-2">CHRONOS ARCHIVES</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Stream Archive
          </h1>
          <p className="text-blue-400/50 text-sm max-w-lg leading-relaxed">
            Relive every moment. Our cinematic archive preserves every stream, clip, and performance.
          </p>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === t.id
                      ? "bg-[#a855f7]/20 border-[#a855f7]/50 text-[#a855f7]"
                      : "border-blue-900/30 text-blue-400/50 hover:border-blue-700/50 hover:text-blue-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/30" />
            <input
              type="text"
              placeholder="Search archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-full pl-9 pr-4 py-2 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#a855f7]/40 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Archive className="w-12 h-12 mx-auto mb-3 text-blue-400/20" />
            <p className="text-blue-400/40 font-semibold">No videos found</p>
            <p className="text-blue-400/25 text-sm mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((v, i) => (
              <ArchiveCard
                key={v.id}
                video={v}
                channel={channelMap[v.channel_id]}
                index={i}
                onClick={setSelectedVideo}
              />
            ))}
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          channel={channelMap[selectedVideo.channel_id]}
          relatedVideos={filtered}
          channelMap={channelMap}
          onClose={() => setSelectedVideo(null)}
          onSelectVideo={setSelectedVideo}
        />
      )}
    </div>
  );
}