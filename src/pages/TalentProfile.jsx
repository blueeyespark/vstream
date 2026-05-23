import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Eye, Star, Radio, Play, ExternalLink,
  Twitter, Youtube, Twitch, Instagram, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayerModal from "@/components/dashboard/VideoPlayerModal";

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

const SOCIAL_ICONS = {
  twitter: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  instagram: Instagram,
};

export default function TalentProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const channelId = urlParams.get("id");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["videos-all"],
    queryFn: () => base44.entities.Video.list("-created_date", 100),
    staleTime: 5 * 60 * 1000,
  });

  const channel = channels.find(c => c.id === channelId);
  const channelMap = useMemo(() => channels.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}), [channels]);
  const channelVideos = useMemo(
    () => videos.filter(v => v.channel_id === channelId && v.status !== "deleted" && v.status !== "uploading"),
    [videos, channelId]
  );

  if (!channel && channels.length > 0) {
    return (
      <div className="min-h-screen bg-[#030810] flex items-center justify-center text-center p-8">
        <div>
          <p className="text-blue-400/40 text-lg mb-4">Talent not found</p>
          <Link to="/TalentNexus"><Button variant="outline">Back to Roster</Button></Link>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#030810] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-[#1e78ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* Banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {channel.banner_url ? (
          <img src={channel.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1e78ff]/30 via-[#0a1525] to-[#a855f7]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030810] via-[#030810]/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/TalentNexus"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-200 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Roster
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
          {/* Avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-[#030810] flex-shrink-0 shadow-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7]">
            {channel.avatar_url ? (
              <img src={channel.avatar_url} alt={channel.channel_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                {channel.channel_name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white">{channel.channel_name}</h1>
              {channel.is_verified && <Star className="w-5 h-5 text-[#00c8ff]" fill="currentColor" />}
              {channel.is_live && (
                <span className="flex items-center gap-1 bg-red-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE NOW
                </span>
              )}
            </div>
            {channel.category && (
              <div className="flex items-center gap-1.5 text-[#00c8ff] text-xs font-bold uppercase tracking-widest mb-2">
                <Radio className="w-3 h-3" /> {channel.category}
              </div>
            )}
            {channel.description && (
              <p className="text-blue-400/60 text-sm max-w-xl leading-relaxed">{channel.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {channel.is_live && (
              <Button className="gap-2 bg-red-500 hover:bg-red-400 border-0">
                <Radio className="w-4 h-4" /> Watch Live
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" /> Follow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Users, label: "Followers", value: fmt(channel.subscriber_count) },
            { icon: Eye, label: "Total Views", value: fmt(channel.view_count) },
            { icon: Play, label: "Videos", value: channelVideos.length },
          ].map((s, i) => (
            <div key={i} className="bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1.5 text-blue-400/40" />
              <p className="text-2xl font-black text-[#e8f4ff]">{s.value}</p>
              <p className="text-xs text-blue-400/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Social links */}
        {channel.social_links?.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {channel.social_links.map((link, i) => {
              const Icon = SOCIAL_ICONS[link.platform?.toLowerCase()] || Globe;
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#060d18] border border-blue-900/30 hover:border-[#1e78ff]/50 text-blue-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.platform}
                  <ExternalLink className="w-3 h-3 opacity-40" />
                </a>
              );
            })}
          </div>
        )}

        {/* Videos */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <Play className="w-4 h-4 text-[#1e78ff]" />
            <h2 className="text-lg font-black text-[#e8f4ff]">Recent Content</h2>
            <span className="text-xs text-blue-400/30">{channelVideos.length} videos</span>
          </div>

          {channelVideos.length === 0 ? (
            <div className="text-center py-16 text-blue-400/30">No videos yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {channelVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#060d18] mb-2">
                    <img
                      src={video.thumbnail_url || `https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop&sig=${video.id}`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    {video.duration_seconds > 0 && (
                      <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                        {fmtDuration(video.duration_seconds)}
                      </span>
                    )}
                    {video.status === "live" && (
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-[#c8dff5] line-clamp-2 leading-snug">{video.title}</h3>
                  <p className="text-xs text-blue-400/30 mt-0.5">{fmt(video.view_count)} views · {timeAgo(video.published_date || video.created_date)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          channel={channel}
          relatedVideos={channelVideos}
          channelMap={channelMap}
          onClose={() => setSelectedVideo(null)}
          onSelectVideo={setSelectedVideo}
        />
      )}
    </div>
  );
}