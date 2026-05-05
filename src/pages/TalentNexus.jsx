import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Radio, Gamepad2, Palette, Layers,
  Search, Star, Eye, UserPlus, Sparkles
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

function TalentCard({ channel, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-blue-900/30 bg-[#060d18]/60 hover:border-[#1e78ff]/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20"
    >
      {/* Banner / backdrop */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#1e78ff]/20 to-[#a855f7]/20">
        {channel.banner_url ? (
          <img src={channel.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, hsl(${(index * 47) % 360} 60% 20%), hsl(${(index * 47 + 120) % 360} 60% 15%))` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d18] via-transparent to-transparent" />

        {/* Live badge */}
        {channel.is_live && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}

        {/* Verified */}
        {channel.is_verified && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1e78ff] flex items-center justify-center shadow-lg">
            <Star className="w-3 h-3 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-end gap-3 px-4 -mt-8 mb-3 relative z-10">
        <div className="w-16 h-16 rounded-2xl border-2 border-[#060d18] bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center text-white text-xl font-black overflow-hidden flex-shrink-0 shadow-lg">
          {channel.avatar_url
            ? <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" />
            : channel.channel_name?.charAt(0)}
        </div>
        <div className="pb-1 min-w-0">
          <h3 className="text-sm font-bold text-[#e8f4ff] truncate">{channel.channel_name}</h3>
          <p className="text-xs text-blue-400/50 truncate">{channel.category || "Creator"}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center gap-4 text-xs text-blue-400/50">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {fmt(channel.subscriber_count)} followers</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(channel.view_count)} views</span>
        </div>

        {channel.description && (
          <p className="text-xs text-blue-400/40 line-clamp-2 leading-relaxed">{channel.description}</p>
        )}

        <Link to={`/Channel?id=${channel.id}`} className="block">
          <Button
            variant="outline"
            className="w-full h-8 text-xs gap-1.5 group-hover:bg-[#1e78ff]/10 group-hover:border-[#1e78ff]/40 transition-all"
          >
            <UserPlus className="w-3 h-3" /> View Channel
          </Button>
        </Link>
      </div>
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

  const filtered = channels.filter((c) => {
    const matchSearch = !search || c.channel_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "live") return c.is_live;
    return c.category?.toLowerCase() === activeFilter;
  });

  const liveCount = channels.filter(c => c.is_live).length;

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
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
            Talent Nexus
          </h1>
          <p className="text-blue-400/50 text-sm max-w-lg mx-auto">
            Discover creators, streamers, and artists on our platform. Find your next favorite channel.
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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