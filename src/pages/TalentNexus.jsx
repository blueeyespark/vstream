import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Radio, Gamepad2, Palette, Layers,
  Search, Star, Eye, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { id: "all",     label: "All",     icon: Users },
  { id: "live",    label: "Live",    icon: Radio },
  { id: "variety", label: "Variety", icon: Layers },
  { id: "art",     label: "Art",     icon: Palette },
  { id: "gaming",  label: "Gaming",  icon: Gamepad2 },
];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

// VFusions-style: full portrait cinematic card — image fills the card, name overlays at bottom
function TalentCard({ channel, index }) {
  const bgColor = `hsl(${(index * 67) % 360} 50% 15%)`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link to={`/Channel?id=${channel.id}`} className="block group relative overflow-hidden rounded-2xl aspect-[3/4] bg-[#060d18] border border-blue-900/30 hover:border-[#00c8ff]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/30 hover:-translate-y-1">
        {/* Full portrait image */}
        {channel.avatar_url ? (
          <img src={channel.avatar_url} alt={channel.channel_name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/10" style={{ background: `linear-gradient(160deg, ${bgColor}, #030810)` }}>
            {channel.channel_name?.charAt(0)}
          </div>
        )}

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Live dot */}
        {channel.is_live && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </div>
        )}

        {/* Verified */}
        {channel.is_verified && (
          <div className="absolute top-3 right-3">
            <Star className="w-4 h-4 text-[#00c8ff]" fill="currentColor" />
          </div>
        )}

        {/* Bottom overlay — name + category */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00c8ff]" />
            <h3 className="text-white font-bold text-sm truncate">{channel.channel_name}</h3>
          </div>
          {channel.category && (
            <div className="flex items-center gap-1 text-[#00c8ff]/70 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3 h-3" /> {channel.category}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmt(channel.subscriber_count)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmt(channel.view_count)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TalentNexus() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
  });

  const liveCount = useMemo(() => channels.filter(c => c.is_live).length, [channels]);

  const filtered = useMemo(() => channels.filter((c) => {
    const matchSearch = !search || c.channel_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "live") return c.is_live;
    return c.category?.toLowerCase() === activeFilter;
  }), [channels, search, activeFilter]);

  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* Header */}
      <div className="border-b border-[#1e78ff]/20 bg-[#030810]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-200 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg px-3 py-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">Talent Nexus</span>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {liveCount} Live
                </span>
              )}
            </div>
          </div>
          <Link to="/Apply">
            <Button className="gap-2 h-8 text-xs bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0">
              <Sparkles className="w-3.5 h-3.5" /> Apply as Talent
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero — VFusions style */}
        <div className="mb-10">
          <p className="text-[#00c8ff] text-xs font-bold uppercase tracking-[0.2em] mb-2">TALENT NEXUS</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Our Roster
          </h1>
          <p className="text-blue-400/50 text-sm max-w-lg leading-relaxed">
            Discover the digital idols redefining virtual entertainment. Each talent brings a unique universe to the stage.
          </p>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeFilter === f.id
                      ? "bg-[#1e78ff]/20 border-[#1e78ff]/50 text-[#1e78ff]"
                      : "border-blue-900/30 text-blue-400/50 hover:border-blue-700/50 hover:text-blue-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  {f.id === "live" && liveCount > 0 && (
                    <span className="bg-red-500/30 text-red-400 text-[10px] font-bold px-1.5 rounded-full">{liveCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/30" />
            <input
              type="text"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-full pl-9 pr-4 py-2 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/40 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Users className="w-12 h-12 mx-auto mb-3 text-blue-400/20" />
            <p className="text-blue-400/40 font-semibold">No creators found</p>
            <p className="text-blue-400/25 text-sm mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((ch, i) => (
              <TalentCard key={ch.id} channel={ch} index={i} />
            ))}
          </div>
        )}

        {/* Apply CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#1e78ff]/10 via-[#a855f7]/10 to-[#1e78ff]/10 border border-[#1e78ff]/20 rounded-2xl p-10">
          <Sparkles className="w-8 h-8 text-[#a855f7] mx-auto mb-3" />
          <h2 className="text-2xl font-black text-[#e8f4ff] mb-2">Want to join the roster?</h2>
          <p className="text-blue-400/50 text-sm mb-6">Apply as a creator and grow your audience on our platform.</p>
          <Link to="/Apply">
            <Button className="gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0 px-8">
              <Sparkles className="w-4 h-4" /> Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}