import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Bookmark,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Hash,
  Heart,
  Home,
  Lightbulb,
  ListVideo,
  MessageCircle,
  Play,
  PlaySquare,
  Plus,
  Radio,
  Share2,
  Sparkles,
  Star,
  Tv,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VideoPlayerModal from "@/components/dashboard/VideoPlayerModal";

const accentGradient = "linear-gradient(135deg,#1e78ff 0%,#00c8ff 42%,#a855f7 100%)";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Live", icon: Radio, to: "/Live" },
  { label: "Shorts/Reels", icon: PlaySquare, to: "/Shorts" },
  { label: "Communities", icon: Users, to: "/Communities" },
  { label: "Watch Parties", icon: Tv, to: "/?view=parties" },
  { label: "Trending", icon: Flame, to: "/?mood=hype" },
  { label: "Saved", icon: Bookmark, to: "/SavedVideos" },
  { label: "Playlists", icon: ListVideo, to: "/Playlists" },
];

const moods = [
  "For You",
  "Live",
  "Gaming",
  "Music",
  "Art",
  "AI",
  "Learning",
  "Comedy",
  "Sports",
  "World Chat",
];

const demoVideos = [
  {
    id: "demo-video-1",
    title: "Neon City Finals: Creator Watch Party Preview",
    channel_id: "demo-channel-1",
    thumbnail_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&h=506&fit=crop",
    view_count: 284000,
    duration_seconds: 1268,
    created_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "ready",
    category: "gaming",
  },
  {
    id: "demo-video-2",
    title: "ArtForge Circle: Cinematic Thumbnail Workflow",
    channel_id: "demo-channel-2",
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=506&fit=crop",
    view_count: 168900,
    duration_seconds: 842,
    created_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: "ready",
    category: "ai",
  },
  {
    id: "demo-video-3",
    title: "Blue Room Radio: Late Night Set Preview",
    channel_id: "demo-channel-3",
    thumbnail_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&h=506&fit=crop",
    view_count: 92100,
    duration_seconds: 3021,
    created_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "ready",
    category: "music",
  },
  {
    id: "demo-video-4",
    title: "Creator Lab: Upload Your First Video Checklist",
    channel_id: "demo-channel-4",
    thumbnail_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=506&fit=crop",
    view_count: 77400,
    duration_seconds: 615,
    created_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: "ready",
    category: "creator",
  },
];

const demoChannels = [
  { id: "demo-channel-1", channel_name: "Neon City Finals", subscriber_count: 124000, is_live: true, viewer_count: 18420, category: "Demo Live Event" },
  { id: "demo-channel-2", channel_name: "ArtForge Circle", subscriber_count: 98500, is_live: false, viewer_count: 0, category: "Demo AI Tools" },
  { id: "demo-channel-3", channel_name: "Blue Room Radio", subscriber_count: 67000, is_live: false, viewer_count: 0, category: "Demo Music" },
  { id: "demo-channel-4", channel_name: "Creator Lab", subscriber_count: 45100, is_live: false, viewer_count: 0, category: "Demo Creator Help" },
];

const socialPulse = [
  { author: "VStream Guide", handle: "@guide", text: "Demo community pulse: use Communities for world chat, live chat, announcements, events, and creator help.", metric: "Demo thread", tag: "#VStream" },
  { author: "Creator Lab", handle: "@creatorlab", text: "Creator tools are locked for signed-in accounts. Guests can preview discovery and communities.", metric: "Demo note", tag: "#CreatorTools" },
  { author: "ArtForge Circle", handle: "@artforge", text: "ArtForge AI is a protected creator workflow. Sign in to continue from the requested route.", metric: "Demo workflow", tag: "#ArtForgeAI" },
];

const trendTopics = ["#NeonFinals", "#CreatorTools", "#BlueRoomLive", "#PromptBattle", "#WatchTogether"];

function fmt(value = 0) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value || 0);
}

function timeAgo(dateString) {
  if (!dateString) return "Just now";
  const days = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 31) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function duration(seconds) {
  if (!seconds) return "LIVE";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function avatarLabel(channel) {
  return (channel?.channel_name || "V").slice(0, 1).toUpperCase();
}

function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[#12305f]/70 bg-[#06101f]/78 shadow-[0_18px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, action, to }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1e78ff]/30 bg-[#1e78ff]/12">
          <Icon className="h-4 w-4 text-[#00c8ff]" />
        </span>
        <h2 className="truncate text-base font-black text-[#e8f4ff]">{title}</h2>
      </div>
      {action && (
        <Link to={to || "#"} className="flex items-center gap-1 text-xs font-bold text-[#00c8ff] hover:text-white">
          {action}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ title, detail, action, to }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#12305f] bg-[#06101f]/58 p-6 text-center">
      <p className="text-sm font-black text-[#e8f4ff]">{title}</p>
      <p className="mt-2 text-xs leading-5 text-blue-100/52">{detail}</p>
      {action && to && (
        <Link to={to} className="mt-4 inline-flex rounded-xl bg-[#1e78ff] px-4 py-2 text-xs font-black text-white transition hover:bg-[#00a6ff]">
          {action}
        </Link>
      )}
    </div>
  );
}

function LeftSidebar({ user }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 space-y-4">
        <Panel className="p-3">
          <div className="mb-3 px-2 text-xs font-black uppercase tracking-[0.24em] text-blue-300/45">VStream</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-100/72 transition-all hover:bg-[#1e78ff]/14 hover:text-white"
              >
                <item.icon className="h-4 w-4 text-blue-300/65 transition-colors group-hover:text-[#00c8ff]" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </Panel>
      </div>
    </aside>
  );
}

function Hero({ video, channel, onPlay }) {
  return (
    <Panel className="relative overflow-hidden">
      <img src={video.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,200,255,0.26),transparent_34%),linear-gradient(90deg,#03080f_0%,rgba(3,8,15,0.74)_45%,rgba(3,8,15,0.18)_100%)]" />
      <div className="relative z-10 flex flex-col justify-between gap-4 p-4 sm:p-7 min-h-[280px] sm:min-h-[360px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/18 px-2.5 py-1 text-xs font-black text-red-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            FEATURED LIVE
          </span>
          <span className="rounded-full border border-[#00c8ff]/25 bg-[#00c8ff]/12 px-2.5 py-1 text-xs font-bold text-cyan-100">{channel?.category || "Creator Spotlight"}</span>
        </div>
        <div className="max-w-2xl">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#00c8ff]">Tonight on VStream</p>
          <h1 className="text-xl font-black leading-tight text-white sm:text-4xl line-clamp-2">{video.title}</h1>
          <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100/72 hidden sm:block">
            Live creator energy, social conversation, and cinematic discovery in one signal-rich dashboard.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => onPlay(video)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-black text-[#03080f] transition hover:scale-[1.02]">
              <Play className="h-4 w-4 fill-[#03080f]" />
              Watch now
            </button>
            <Link to="/Live" className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-3 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16">
              Browse live
              <Radio className="h-3.5 w-3.5 text-red-300" />
            </Link>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { label: "Watching", value: fmt(channel?.viewer_count || video.view_count || 18400), icon: Users },
            { label: "Creator", value: channel?.channel_name || "VStream", icon: Star },
            { label: "Pulse", value: "Hot", icon: Flame },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 min-w-[90px] rounded-xl border border-white/10 bg-black/28 p-2.5 backdrop-blur">
              <stat.icon className="mb-1.5 h-3.5 w-3.5 text-[#00c8ff]" />
              <p className="text-[10px] text-blue-100/50">{stat.label}</p>
              <p className="truncate text-xs font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function MoodChips({ activeMood, setActiveMood }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {moods.map((mood) => {
        const active = activeMood === mood;
        return (
          <button
            key={mood}
            onClick={() => setActiveMood(mood)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
              active
                ? "border-[#00c8ff] bg-[#00c8ff]/16 text-white shadow-[0_0_24px_rgba(0,200,255,0.16)]"
                : "border-[#12305f] bg-[#06101f] text-blue-200/60 hover:border-[#1e78ff]/60 hover:text-blue-100"
            }`}
          >
            {mood}
          </button>
        );
      })}
    </div>
  );
}

function StoriesRow({ channels }) {
  return (
    <section>
      <SectionTitle icon={Zap} title="Stories & Reels" action="Open reels" to="/Shorts" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {channels.slice(0, 10).map((channel, index) => (
          <Link key={channel.id} to={`/Channel?id=${channel.id}`} className="group w-24 shrink-0">
            <div className="relative mx-auto h-20 w-20 rounded-[1.35rem] p-[2px]" style={{ background: index % 3 === 0 ? accentGradient : "linear-gradient(135deg,#1e78ff,#a855f7)" }}>
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-[#071326] text-xl font-black text-white">
                {channel.avatar_url ? <img src={channel.avatar_url} alt="" className="h-full w-full object-cover" /> : avatarLabel(channel)}
              </div>
              {channel.is_live && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">LIVE</span>}
            </div>
            <p className="mt-2 truncate text-center text-xs font-bold text-blue-100/65 group-hover:text-white">{channel.channel_name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VideoCard({ video, channel, onPlay, featured = false }) {
  return (
    <motion.button
      type="button"
      onClick={() => onPlay(video)}
      whileHover={{ y: -4 }}
      className={`group text-left ${featured ? "lg:col-span-2" : ""}`}
    >
      <div className={`relative overflow-hidden rounded-2xl border border-[#12305f]/70 bg-[#06101f] ${featured ? "aspect-[16/7]" : "aspect-video"}`}>
        <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/10 to-transparent opacity-90" />
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-black text-white">{duration(video.duration_seconds)}</span>
        <span className="absolute left-3 top-3 rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-100 backdrop-blur">
          {video.category || channel?.category || "Video"}
        </span>
        <span className="absolute left-3 top-12 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/14 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Play className="h-5 w-5 fill-white" />
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: accentGradient }}>
          {avatarLabel(channel)}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-black leading-snug text-[#e8f4ff] group-hover:text-[#00c8ff]">{video.title}</h3>
          <p className="mt-1 truncate text-xs font-semibold text-blue-200/55">{channel?.channel_name || "VStream Creator"}</p>
          <p className="mt-0.5 text-xs text-blue-300/38">{fmt(video.view_count)} views - {timeAgo(video.created_date || video.published_date)}</p>
        </div>
      </div>
    </motion.button>
  );
}

function SocialPulse() {
  return (
    <Panel className="p-4">
      <SectionTitle icon={MessageCircle} title="Social Pulse" action="Communities" to="/Communities" />
      <div className="space-y-3">
        {socialPulse.map((post) => (
          <div key={post.author} className="rounded-2xl border border-[#12305f]/55 bg-[#08172d]/68 p-4 transition hover:border-[#00c8ff]/35">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#e8f4ff]">{post.author}</p>
                <p className="text-xs text-blue-300/48">{post.handle}</p>
              </div>
              <span className="rounded-full bg-[#1e78ff]/12 px-2 py-1 text-[10px] font-black text-[#00c8ff]">{post.tag}</span>
            </div>
            <p className="text-sm leading-5 text-blue-100/75">{post.text}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-blue-300/48">
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.metric}</span>
              <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5" />Share</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ContinueWatching({ videos, channelMap, onPlay }) {
  if (!videos.length) return null;
  return (
    <section>
      <SectionTitle icon={Clock} title="Continue Watching" action="History" to="/WatchHistory" />
      <div className="grid gap-3 md:grid-cols-3">
        {videos.slice(0, 3).map((video) => (
          <button key={video.id} onClick={() => onPlay(video)} className="group flex gap-3 rounded-2xl border border-[#12305f]/65 bg-[#06101f]/78 p-2 text-left transition hover:border-[#00c8ff]/45">
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-[#08172d]">
              <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
              <div className="absolute bottom-0 left-0 h-1 w-2/3 bg-[#00c8ff]" />
            </div>
            <div className="min-w-0 py-1">
              <p className="line-clamp-2 text-xs font-black text-[#e8f4ff]">{video.title}</p>
              <p className="mt-1 truncate text-xs text-blue-200/45">{channelMap[video.channel_id]?.channel_name || "Creator"}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#00c8ff]">Resume</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function WatchPartyCard() {
  return (
    <Panel className="relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#a855f7]/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#a855f7]" />
            <p className="text-sm font-black text-[#e8f4ff]">Watch Party Room</p>
          </div>
          <h3 className="text-xl font-black text-white">Co-watch the next big stream with your crew.</h3>
          <p className="mt-2 max-w-xl text-sm text-blue-100/58">Synchronized playback, shared reactions, creator chat, and community rooms built for fandoms.</p>
        </div>
        <Link to="/Communities" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#a855f7]/40 bg-[#a855f7]/16 px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#a855f7]/24">
          Start room
          <Plus className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  );
}

function SuggestedCreators({ channels }) {
  return (
    <section>
      <SectionTitle icon={Sparkles} title="Suggested Creators" action="Browse" to="/TalentNexus" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {channels.slice(0, 6).map((channel) => (
          <Link key={channel.id} to={`/Channel?id=${channel.id}`} className="group rounded-2xl border border-[#12305f]/65 bg-[#06101f]/78 p-4 transition hover:-translate-y-1 hover:border-[#00c8ff]/45">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: accentGradient }}>
                {avatarLabel(channel)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#e8f4ff] group-hover:text-[#00c8ff]">{channel.channel_name}</p>
                <p className="text-xs text-blue-200/45">{fmt(channel.subscriber_count)} followers</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-[#1e78ff]/12 px-2 py-1 font-bold text-[#00c8ff]">{channel.category || "Creator"}</span>
              <span className="font-bold text-blue-100/55">Follow</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RightRail({ liveChannels, trendingVideos, channels, onPlay }) {
  const watchList = trendingVideos.slice(0, 3);
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-4">
        <RailPanel icon={Radio} title="Live Now">
          <div className="space-y-2">
            {liveChannels.length ? liveChannels.slice(0, 4).map((channel) => (
                <Link key={channel.id} to={`/Channel?id=${channel.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#1e78ff]/12">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: accentGradient }}>
                    {avatarLabel(channel)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#06101f] bg-red-500" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-[#e8f4ff]">{channel.channel_name}</span>
                    <span className="block text-[11px] text-blue-300/45">{fmt(channel.viewer_count || 0)} watching</span>
                  </span>
                </Link>
              )) : (
                <p className="rounded-xl border border-dashed border-[#12305f] bg-[#03080f]/50 p-3 text-xs leading-5 text-blue-100/52">No live streams yet. Demo live cards only appear in the main discovery preview.</p>
              )}
          </div>
        </RailPanel>

        <RailPanel icon={Hash} title="Trending Topics">
          <div className="space-y-2">
            {trendTopics.map((topic, index) => (
              <Link key={topic} to={`/?search=${encodeURIComponent(topic)}`} className="flex items-center justify-between rounded-xl px-2 py-2 text-xs transition hover:bg-[#1e78ff]/12">
                <span className="font-black text-blue-100/78">{topic}</span>
                <span className="text-blue-300/38">{fmt((index + 2) * 7400)}</span>
              </Link>
            ))}
          </div>
        </RailPanel>

        <RailPanel icon={Users} title="Who To Follow">
          <div className="space-y-3">
            {channels.slice(0, 3).map((channel) => (
              <Link key={channel.id} to={`/Channel?id=${channel.id}`} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: accentGradient }}>{avatarLabel(channel)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-[#e8f4ff]">{channel.channel_name}</span>
                  <span className="block text-[11px] text-blue-300/42">{channel.category || "Creator"}{String(channel.id).startsWith("demo-") ? " example" : ""}</span>
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#03080f]">Follow</span>
              </Link>
            ))}
          </div>
        </RailPanel>

        <RailPanel icon={Compass} title="What To Watch">
          <div className="space-y-3">
            {watchList.map((video) => (
              <button key={video.id} onClick={() => onPlay(video)} className="group flex w-full gap-3 text-left">
                <span className="aspect-video w-20 shrink-0 overflow-hidden rounded-xl bg-[#08172d]">
                  <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-xs font-black text-[#e8f4ff] group-hover:text-[#00c8ff]">{video.title}</span>
                  <span className="mt-1 block text-[11px] text-blue-300/42">{fmt(video.view_count)} views</span>
                </span>
              </button>
            ))}
          </div>
        </RailPanel>

        <RailPanel icon={Lightbulb} title="Creator Tips">
          <p className="text-sm leading-5 text-blue-100/65">Turn your next stream into three clips, one short, and a community post within the first hour.</p>
        </RailPanel>
      </div>
    </aside>
  );
}

function RailPanel({ icon: Icon, title, children }) {
  return (
    <Panel className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#00c8ff]" />
        <h3 className="text-sm font-black text-[#e8f4ff]">{title}</h3>
      </div>
      {children}
    </Panel>
  );
}



export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMood, setActiveMood] = useState(searchParams.get("mood") === "hype" ? "Live" : "For You");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const query = searchParams.get("search") || "";

  const { data: rawVideos = [] } = useQuery({
    queryKey: ["videos-all"],
    queryFn: () => base44.entities.Video.list("-created_date", 80),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: rawChannels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["my-subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ subscriber_email: user.email, status: "active" }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Filter out ghost data: videos & channels must have valid required fields
  const cleanVideos = rawVideos.filter((v) => v.id && v.title?.trim() && v.channel_id && v.status && v.status !== "deleted" && v.status !== "uploading");
  const cleanChannels = rawChannels.filter((c) => c.id && c.channel_name?.trim() && c.creator_email?.trim());
  
  const hasRealVideos = cleanVideos.length > 0;
  const hasRealChannels = cleanChannels.length > 0;
  const channels = hasRealChannels ? cleanChannels : demoChannels;
  const videos = hasRealVideos ? cleanVideos : demoVideos;

  const channelMap = useMemo(() => channels.reduce((map, channel) => ({ ...map, [channel.id]: channel }), {}), [channels]);
  const liveChannels = useMemo(() => channels.filter((channel) => channel.is_live), [channels]);
  const trendingVideos = useMemo(() => [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)), [videos]);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return videos.filter((video) => {
      // Skip if video lacks required fields
      if (!video.id || !video.title?.trim() || !video.channel_id) return false;
      const channel = channelMap[video.channel_id];
      if (!channel) return false;
      const haystack = `${video.title || ""} ${channel?.channel_name || ""} ${video.category || ""}`.toLowerCase();
      const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesMood =
        activeMood === "For You" ||
        (activeMood === "Live" && (video.status === "live" || channel?.is_live)) ||
        haystack.includes(activeMood.toLowerCase());
      return matchesSearch && matchesMood;
    });
  }, [activeMood, channelMap, query, videos]);

  const heroVideo = trendingVideos[0] || demoVideos[0];
  const heroChannel = channelMap[heroVideo.channel_id] || channels[0];
  const storyChannels = channels.length ? channels : demoChannels;
  const recommended = filteredVideos.length ? filteredVideos : (hasRealVideos ? [] : demoVideos);
  const continueWatching = hasRealVideos ? recommended.slice(1, 4) : [];
  const followedChannelIds = new Set(subscriptions.map((sub) => sub.channel_id));
  const followingCount = followedChannelIds.size || Math.min(3, channels.length);

  const handlePlay = (video) => setSelectedVideo(video);

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(30,120,255,0.22),transparent_34%),radial-gradient(circle_at_83%_16%,rgba(168,85,247,0.20),transparent_32%),linear-gradient(180deg,rgba(3,8,15,0),#03080f_72%)]" />

      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-5 px-3 pb-24 pt-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <LeftSidebar user={user} />

        <main className="min-w-0 space-y-6">
          <Hero video={heroVideo} channel={heroChannel} onPlay={handlePlay} />

          <div className="flex items-center justify-between gap-4">
            <MoodChips activeMood={activeMood} setActiveMood={setActiveMood} />
          </div>

          <StoriesRow channels={storyChannels} />

          <section>
            <SectionTitle icon={Video} title={query ? `Search results for "${query}"` : "Recommended Videos"} action="Explore" to="/?view=explore" />
            <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 2xl:grid-cols-3">
              {recommended.slice(0, 9).map((video, index) => (
                <VideoCard key={video.id} video={video} channel={channelMap[video.channel_id]} onPlay={handlePlay} featured={index === 0 && !query} />
              ))}
            </div>
          </section>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-6">
              {continueWatching.length > 0 ? (
                <ContinueWatching videos={continueWatching} channelMap={channelMap} onPlay={handlePlay} />
              ) : (
                <EmptyState title="No followed creators yet" detail="Follow creators and watch videos to build a real continue-watching queue." action="Browse Communities" to="/Communities" />
              )}
              <WatchPartyCard />
              <SuggestedCreators channels={channels} />
            </div>
            <SocialPulse />
          </div>

          <Panel className="grid gap-4 p-4 sm:grid-cols-3">
            {[
              { label: "Following", value: fmt(followingCount), icon: Heart, color: "text-pink-300" },
              { label: "Live rooms", value: fmt(liveChannels.length || 3), icon: Radio, color: "text-red-300" },
              { label: "Saved ideas", value: "12", icon: Archive, color: "text-[#00c8ff]" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#12305f]/55 bg-[#08172d]/62 p-4">
                <stat.icon className={`mb-3 h-5 w-5 ${stat.color}`} />
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300/45">{stat.label}</p>
              </div>
            ))}
          </Panel>
        </main>

        <RightRail liveChannels={liveChannels} trendingVideos={trendingVideos} channels={channels} onPlay={handlePlay} />
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            channel={channelMap[selectedVideo.channel_id]}
            relatedVideos={videos}
            channelMap={channelMap}
            onClose={() => setSelectedVideo(null)}
            onSelectVideo={handlePlay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}