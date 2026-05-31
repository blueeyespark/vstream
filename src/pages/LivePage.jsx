import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Radio, Eye, Heart, ChevronLeft, Users, Tv } from "lucide-react";
import { motion } from "framer-motion";
import LiveChat from "@/components/live/LiveChat";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Gaming", "Art", "Tech", "IRL", "Music", "Sports"];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function LivePage() {
  const { user } = useAuth();
  const [selectedStream, setSelectedStream] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
  });

  const liveChannels = channels.filter(c => c.is_live);
  const streams = liveChannels.map(c => ({
    id: c.id,
    title: c.description || `${c.channel_name} is live!`,
    channel: c.channel_name,
    viewers: c.view_count || 0,
    category: c.categories?.[0] || c.category || "IRL",
    thumbnail: c.banner_url,
  }));

  const filtered = activeCategory === "All" ? streams : streams.filter(s => s.category === activeCategory);

  if (selectedStream) {
    return (
      <div className="min-h-screen bg-[#03080f] text-[#e8f4ff] flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#0d1820] bg-[#06101f]">
          <button onClick={() => setSelectedStream(null)} className="flex items-center gap-1.5 text-blue-400/70 hover:text-blue-200 transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-blue-400/50 hover:text-blue-200 transition-colors text-sm">
            Dashboard
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-bold">LIVE</span>
            </div>
            <span className="flex items-center gap-1 text-blue-300/60 text-xs"><Eye className="w-3.5 h-3.5" />{fmt(selectedStream.viewers)}</span>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="aspect-video bg-black relative">
              <img
                src={selectedStream.thumbnail || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop`}
                alt={selectedStream.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-5">
                  <Radio className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-lg drop-shadow-lg">{selectedStream.title}</p>
                <p className="text-white/70 text-sm">{selectedStream.channel} · {selectedStream.category}</p>
              </div>
            </div>

            <div className="p-4 border-b border-[#0d1820] flex items-center gap-4 bg-[#06101f]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center text-white font-bold flex-shrink-0">
                {selectedStream.channel?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#e8f4ff] font-semibold truncate">{selectedStream.channel}</p>
                <p className="text-blue-400/50 text-sm">{selectedStream.category}</p>
              </div>
              <button className="bg-[#1e78ff] hover:bg-[#3d8fff] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" /> Follow
              </button>
            </div>

            <div className="flex-1 p-4 bg-[#03080f]">
              <LiveChat streamId={selectedStream.id} user={user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#e8f4ff]">Browse Live</h1>
            <p className="text-sm text-blue-400/50">{streams.length} live streams right now</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold">{streams.length} Live</span>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[#1e78ff] text-white"
                  : "border border-[#12305f] bg-[#06101f] text-blue-200/60 hover:border-[#1e78ff]/60 hover:text-blue-100"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((stream, i) => (
              <motion.button
                key={stream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedStream(stream)}
                className="group text-left rounded-2xl border border-[#12305f]/70 bg-[#06101f] overflow-hidden hover:border-[#1e78ff]/50 hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-video">
                  <img
                    src={stream.thumbnail || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop&sig=${stream.id}`}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 rounded-full px-2 py-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">LIVE</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Users className="w-3 h-3" />{fmt(stream.viewers)}
                  </div>
                </div>
                <div className="p-3 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {stream.channel?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#e8f4ff] text-sm font-semibold line-clamp-1 group-hover:text-[#00c8ff] transition-colors">{stream.title}</p>
                    <p className="text-blue-400/50 text-xs mt-0.5">{stream.channel}</p>
                    <span className="text-xs bg-[#1e78ff]/12 text-[#00c8ff] px-2 py-0.5 rounded-full mt-1 inline-block font-semibold">{stream.category}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-7 h-7 text-red-400/40" />
            </div>
            <p className="text-[#e8f4ff] font-bold text-lg mb-2">No live streams right now</p>
            <p className="text-blue-400/40 text-sm mb-6">Go live from Creator OS to appear here</p>
            <Link to="/CreatorOS" className="inline-flex items-center gap-2 bg-[#1e78ff] hover:bg-[#3d8fff] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
              <Tv className="w-4 h-4" /> Open Creator OS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}