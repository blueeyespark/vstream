import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreatorOSProvider, useCreatorOS } from "@/lib/CreatorOSContext";
import { useAuth } from "@/lib/AuthContext";
import {
  Activity, AlertTriangle, BarChart3, Calendar, CheckCircle2, ChevronRight,
  CircleDollarSign, Clapperboard, Edit3, Eye, FileVideo, Folder, Gauge,
  Image, Library, MessageSquare, Mic2, MonitorUp, Play, Plus, Radio, Search,
  Settings, Sparkles, Tags, Upload, Users, Wand2, Zap, TrendingUp, Clock,
  Video, ArrowUpRight, Star, MoreHorizontal, Layers, WandSparkles, Bell,
  Flame, Globe, Hash, Heart, LayoutDashboard, Lightbulb, Lock, Medal,
  Megaphone, PenTool, Rocket, Send, Shield, Smile, Target, ThumbsUp,
  Timer, Trophy, UserCheck, Wallet, Wifi, X, ChevronDown, ChevronUp,
  BookOpen, Bookmark, Box, Camera, Cast, Film, Gift, Headphones, Map,
  Music, Package, Pause, Repeat, Share2, Shuffle, SkipForward, Sliders,
  Tv, Volume2, Wrench, Flag, Award,
} from "lucide-react";
import ArtForgeStudio from "@/pages/ArtForgeStudio";
import ProductionHub from "@/components/studio/ProductionHub";
import PlanningHub from "@/components/studio/PlanningHub";
import AnalyticsHub from "@/components/studio/AnalyticsHub";
import AdvancedAnalyticsHub from "@/components/studio/AdvancedAnalyticsHub";
import CommunityManagementHub from "@/components/studio/CommunityManagementHub";
import MonetizationHub from "@/components/studio/MonetizationHub";
import TeamManagement from "@/components/studio/TeamManagement";
import ChannelEditor from "@/components/studio/ChannelEditor";
import IntegrationsHub from "@/components/studio/IntegrationsHub";
import LiveControlRoom from "@/components/studio/LiveControlRoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navGroups = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, tagline: "Home & highlights" },
    ],
  },
  {
    label: "Create",
    items: [
      { id: "production", label: "Production", icon: Clapperboard, tagline: "Idea → publish pipeline" },
      { id: "artforge", label: "ArtForge AI", icon: WandSparkles, tagline: "Art, video, stickers, 3D", accent: "purple" },
      { id: "live", label: "Live Room", icon: Radio, tagline: "Streams, scenes, chat", accent: "red" },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "library", label: "Content Library", icon: Library, tagline: "Media, assets, drafts" },
      { id: "analytics", label: "Analytics", icon: BarChart3, tagline: "Growth and revenue" },
      { id: "community", label: "Community", icon: MessageSquare, tagline: "Comments & moderation" },
      { id: "monetization", label: "Monetize", icon: CircleDollarSign, tagline: "Memberships & payouts" },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "team", label: "Team", icon: Users, tagline: "Editors, mods, collabs" },
      { id: "settings", label: "Settings", icon: Settings, tagline: "Brand & integrations" },
    ],
  },
];

const sections = navGroups.flatMap((g) => g.items);

function cx(...classes) { return classes.filter(Boolean).join(" "); }
function fmt(value = 0) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value || 0);
}
function pct(a, b) { return b > 0 ? `+${((a / b) * 100).toFixed(1)}%` : null; }

function Panel({ children, className = "" }) {
  return (
    <section className={cx("rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 shadow-xl shadow-black/20 backdrop-blur", className)}>
      {children}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail, trend, color = "blue", onClick }) {
  const colors = {
    blue: { icon: "text-[#00c8ff]", bg: "bg-[#1e78ff]/12", ring: "hover:border-[#1e78ff]/40", trend: "text-emerald-400" },
    purple: { icon: "text-purple-300", bg: "bg-purple-500/12", ring: "hover:border-purple-500/40", trend: "text-emerald-400" },
    green: { icon: "text-emerald-300", bg: "bg-emerald-500/12", ring: "hover:border-emerald-500/40", trend: "text-emerald-400" },
    amber: { icon: "text-amber-300", bg: "bg-amber-500/12", ring: "hover:border-amber-500/40", trend: "text-emerald-400" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div onClick={onClick} className={cx("rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4 transition-colors", c.ring, onClick && "cursor-pointer")}>
      <div className="flex items-start justify-between mb-3">
        <div className={cx("grid h-9 w-9 place-items-center rounded-xl", c.bg)}>
          <Icon className={cx("h-4 w-4", c.icon)} />
        </div>
        {trend && (
          <span className={cx("flex items-center gap-1 text-xs font-black", c.trend)}>
            <TrendingUp className="h-3 w-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-xs font-black uppercase tracking-widest text-blue-100/40">{label}</p>
      {detail && <p className="mt-1 text-xs text-blue-100/35">{detail}</p>}
    </div>
  );
}

function SectionHeader({ section, channelName, channel }) {
  const Icon = section.icon;
  const isLive = section.id === "live";
  const isPurple = section.id === "artforge";
  return (
    <Panel className="overflow-hidden">
      <div className="relative p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,200,255,0.14),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg",
              isPurple ? "bg-gradient-to-br from-[#a855f7] to-[#ec4899] shadow-purple-950/40"
              : isLive ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-950/40"
              : "bg-gradient-to-br from-[#1e78ff] to-[#a855f7] shadow-blue-950/40")}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#00c8ff]">VStream Creator OS</p>
              <h1 className="text-2xl font-black text-white">{section.label}</h1>
              <p className="text-sm text-blue-100/50">{section.tagline}{channelName ? ` · ${channelName}` : ""}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/CreatorOS?section=production"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#3d8fff] transition">
              <Upload className="h-4 w-4" /> Upload
            </Link>
            <Link to="/StreamerDashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-500/18 transition">
              <Radio className="h-4 w-4" /> Go Live
            </Link>
            {channel && (
              <Link to={`/Channel?id=${channel.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f]/55 px-4 py-2 text-sm font-black text-blue-100/70 hover:text-white transition">
                <Globe className="h-4 w-4" /> View Channel
              </Link>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CreatorStudioContent() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section") || searchParams.get("tab");
  const activeSection = sectionParam || "dashboard";
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [streamForm, setStreamForm] = useState({ title: "Untitled VStream Live", category: "Just Chatting", slowMode: true, alerts: true });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { channel, videos, assets, stats } = useCreatorOS();
  const section = sections.find((s) => s.id === activeSection) || sections[0];
  const setSection = (id) => setSearchParams({ section: id });

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(30,120,255,0.14),transparent_34%),radial-gradient(circle_at_83%_16%,rgba(168,85,247,0.12),transparent_32%)]" />

      <div className={cx("mx-auto grid max-w-[1920px] gap-4 px-3 py-4 sm:px-5 transition-all",
        sidebarCollapsed ? "xl:grid-cols-[72px_minmax(0,1fr)]" : "xl:grid-cols-[260px_minmax(0,1fr)]")}>
        <CreatorSidebar
          activeSection={activeSection}
          setSection={setSection}
          channel={channel}
          stats={stats}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className="space-y-4 min-w-0">
          <SectionHeader section={section} channelName={channel?.channel_name} channel={channel} />
          {!channel && <ChannelSetupNotice />}
          {section.id === "dashboard" && <DashboardContent stats={stats} videos={videos} assets={assets} setSection={setSection} channel={channel} user={user} />}
          {section.id === "production" && <ProductionHub />}
          {section.id === "artforge" && <ArtForgeStudio embedded={true} />}
          {section.id === "live" && <LiveControlRoom streamForm={streamForm} setStreamForm={setStreamForm} />}
          {section.id === "library" && <ContentLibrary videos={videos} assets={assets} filter={libraryFilter} setFilter={setLibraryFilter} query={libraryQuery} setQuery={setLibraryQuery} />}
          {section.id === "analytics" && <AnalyticsSection stats={stats} />}
          {section.id === "community" && <CommunitySection />}
          {section.id === "monetization" && <MonetizationSection stats={stats} />}
          {section.id === "team" && <Panel className="p-4"><TeamManagement /></Panel>}
          {section.id === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

export default function CreatorStudio() {
  return (
    <CreatorOSProvider>
      <CreatorStudioContent />
    </CreatorOSProvider>
  );
}

function CreatorSidebar({ activeSection, setSection, channel, stats, collapsed, setCollapsed }) {
  return (
    <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <Panel className="overflow-hidden">
        {/* Channel header */}
        <div className="border-b border-[#12305f]/70 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-sm font-black text-white shadow-lg shadow-blue-950/40">
              {(channel?.channel_name || "V").slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{channel?.channel_name || "Set up channel"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cx("h-1.5 w-1.5 rounded-full", channel?.is_live ? "bg-red-400 animate-pulse" : "bg-blue-400/30")} />
                  <p className="truncate text-xs text-blue-100/40">{channel ? `${fmt(channel.subscriber_count || 0)} followers` : "Creator workspace"}</p>
                </div>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="shrink-0 rounded-lg p-1 text-blue-100/30 hover:text-white transition">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="p-2 space-y-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1 px-2 text-[9px] font-black uppercase tracking-[0.28em] text-blue-100/25">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  const isPurple = item.accent === "purple";
                  const isRed = item.accent === "red";
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cx(
                        "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all",
                        collapsed && "justify-center",
                        isPurple
                          ? active ? "bg-[#a855f7]/18 text-white" : "text-purple-200/55 hover:bg-[#a855f7]/10 hover:text-purple-100"
                          : isRed
                          ? active ? "bg-red-500/18 text-white" : "text-red-200/55 hover:bg-red-500/10 hover:text-red-100"
                          : active ? "bg-[#1e78ff]/14 text-white" : "text-blue-100/55 hover:bg-[#1e78ff]/8 hover:text-white"
                      )}>
                      <Icon className={cx(
                        "h-4 w-4 shrink-0 transition",
                        isPurple ? active ? "text-[#a855f7]" : "text-purple-400/50 group-hover:text-[#a855f7]"
                        : isRed ? active ? "text-red-400" : "text-red-400/50 group-hover:text-red-400"
                        : active ? "text-[#00c8ff]" : "text-blue-300/45 group-hover:text-[#00c8ff]"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black">{item.label}</span>
                            <span className="block truncate text-[10px] text-blue-100/28">{item.tagline}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {active && <div className={cx("h-1.5 w-1.5 rounded-full", isPurple ? "bg-[#a855f7]" : isRed ? "bg-red-400" : "bg-[#00c8ff]")} />}
                            {isPurple && !active && <span className="rounded-full bg-[#a855f7]/20 px-1.5 py-0.5 text-[9px] font-black text-purple-300">AI</span>}
                            {isRed && channel?.is_live && <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black text-red-300 animate-pulse">LIVE</span>}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Stats footer */}
        {!collapsed && (
          <div className="border-t border-[#12305f]/70 p-3">
            <div className="grid grid-cols-2 gap-2">
              {[["Videos", stats.videos], ["Assets", stats.assets], ["Views", fmt(stats.views)], ["Drafts", stats.drafts]].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-2.5 text-center">
                  <p className="font-black text-white text-sm">{value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/35">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </aside>
  );
}

function ChannelSetupNotice() {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-300" />
          <div>
            <p className="font-black text-white">No channel yet</p>
            <p className="text-sm text-blue-100/50">Create a channel to unlock publishing, analytics, and team tools.</p>
          </div>
        </div>
        <Link to="/Channel" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#3d8fff] transition">
          Create Channel <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  );
}

function DashboardContent({ stats, videos, assets, setSection, channel, user }) {
  const recent = videos.slice(0, 5);
  const topVideos = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 3);
  const recentAssets = assets.slice(0, 4);
  const totalLikes = videos.reduce((s, v) => s + (v.like_count || 0), 0);
  const avgViews = videos.length ? Math.round(stats.views / videos.length) : 0;

  const quickActions = [
    { label: "Upload Video", icon: Upload, section: "production", color: "text-[#1e78ff]", bg: "bg-[#1e78ff]/10 border-[#1e78ff]/25", desc: "Long-form" },
    { label: "Go Live", icon: Radio, href: "/StreamerDashboard", color: "text-red-300", bg: "bg-red-500/8 border-red-400/20", desc: "Stream now" },
    { label: "ArtForge AI", icon: WandSparkles, section: "artforge", color: "text-purple-300", bg: "bg-purple-500/8 border-purple-400/20", desc: "Generate art" },
    { label: "Analytics", icon: BarChart3, section: "analytics", color: "text-emerald-300", bg: "bg-emerald-500/8 border-emerald-400/20", desc: "Deep dive" },
    { label: "Thumbnail", icon: Image, href: "/ThumbnailMaker", color: "text-cyan-300", bg: "bg-cyan-500/8 border-cyan-400/20", desc: "Design" },
    { label: "Shorts", icon: Film, href: "/Shorts", color: "text-amber-300", bg: "bg-amber-500/8 border-amber-400/20", desc: "Short-form" },
  ];

  const growthTips = [
    { icon: Target, text: "Post consistently — 2–3x per week boosts discovery by 40%", color: "text-[#00c8ff]" },
    { icon: ThumbsUp, text: "Reply to comments in the first hour — drives algorithmic reach", color: "text-emerald-400" },
    { icon: Image, text: "A/B test thumbnails — click-through rate is your #1 growth lever", color: "text-purple-400" },
    { icon: Hash, text: "Add 5–8 relevant tags to each video for search visibility", color: "text-amber-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MetricCard icon={Eye} label="Total Views" value={fmt(stats.views)} detail="All-time" trend={stats.views > 0 ? "+12%" : null} color="blue" onClick={() => setSection("analytics")} />
        <MetricCard icon={FileVideo} label="Published" value={fmt(stats.videos)} detail="Ready videos" color="green" onClick={() => setSection("library")} />
        <MetricCard icon={Heart} label="Total Likes" value={fmt(totalLikes)} detail="Engagement" color="purple" />
        <MetricCard icon={CircleDollarSign} label="Est. Revenue" value={`$${fmt(stats.revenue)}`} detail="Views-based CPM" color="amber" onClick={() => setSection("monetization")} />
      </div>

      {/* Quick Actions */}
      <Panel className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-white">Quick Actions</h3>
          <span className="text-xs text-blue-100/35">Creator shortcuts</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {quickActions.map(({ label, icon: Icon, section, href, color, bg, desc }) => {
            const inner = (
              <div className={cx("flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer", bg)}>
                <div className={cx("grid h-9 w-9 place-items-center rounded-xl", bg.replace("border-", "").split(" ")[0])}>
                  <Icon className={cx("h-5 w-5", color)} />
                </div>
                <div>
                  <span className="block text-xs font-black text-white">{label}</span>
                  <span className="block text-[10px] text-blue-100/35">{desc}</span>
                </div>
              </div>
            );
            if (href) return <Link key={label} to={href}>{inner}</Link>;
            return <button key={label} onClick={() => setSection(section)}>{inner}</button>;
          })}
        </div>
      </Panel>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">

          {/* Recent Videos — YouTube Studio style */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">Recent Videos</h3>
              <button onClick={() => setSection("library")} className="flex items-center gap-1 text-xs font-black text-[#00c8ff] hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {recent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#12305f]/60">
                      {["Video", "Status", "Views", "Likes", "Comments"].map((h) => (
                        <th key={h} className="pb-2 text-left text-[10px] font-black uppercase tracking-widest text-blue-100/30 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#12305f]/30">
                    {recent.map((video) => (
                      <tr key={video.id} className="group hover:bg-[#1e78ff]/5 transition">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0a1525]">
                              {video.thumbnail_url
                                ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
                                : <Video className="h-4 w-4 text-blue-200/25" />}
                            </div>
                            <p className="max-w-[180px] truncate font-black text-white">{video.title}</p>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-black",
                            video.status === "ready" ? "bg-emerald-500/15 text-emerald-300"
                            : video.status === "live" ? "bg-red-500/15 text-red-300 animate-pulse"
                            : "bg-yellow-500/15 text-yellow-300")}>
                            {video.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-black text-white">{fmt(video.view_count || 0)}</td>
                        <td className="py-2.5 pr-4 text-blue-100/50">{fmt(video.like_count || 0)}</td>
                        <td className="py-2.5 text-blue-100/50">{fmt(video.comment_count || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#12305f] p-8 text-center">
                <Video className="mx-auto mb-2 h-8 w-8 text-blue-200/20" />
                <p className="font-black text-white">No videos yet</p>
                <p className="mt-1 text-sm text-blue-100/45">Upload your first video to get started.</p>
                <button onClick={() => setSection("production")} className="mt-3 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#3d8fff] transition">
                  Go to Production
                </button>
              </div>
            )}
          </Panel>

          {/* Production pipeline */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">Content Pipeline</h3>
              <button onClick={() => setSection("production")} className="text-xs font-black text-[#00c8ff] hover:underline">Open Studio →</button>
            </div>
            <div className="grid gap-2 grid-cols-5">
              {[
                { stage: "Idea", desc: "Capture concepts", icon: Lightbulb, color: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
                { stage: "Create", desc: "Record or generate", icon: Camera, color: "text-[#00c8ff] bg-[#00c8ff]/10 border-[#00c8ff]/20" },
                { stage: "Edit", desc: "Refine content", icon: Edit3, color: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
                { stage: "Package", desc: "Thumbnail & meta", icon: Package, color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
                { stage: "Publish", desc: "Schedule or live", icon: Rocket, color: "text-[#1e78ff] bg-[#1e78ff]/10 border-[#1e78ff]/20" },
              ].map(({ stage, desc, icon: Icon, color }) => (
                <button key={stage} onClick={() => setSection("production")}
                  className={cx("rounded-xl border p-3 text-center transition hover:-translate-y-0.5", color)}>
                  <Icon className="mx-auto mb-2 h-5 w-5" />
                  <p className="text-xs font-black text-white">{stage}</p>
                  <p className="mt-0.5 text-[10px] text-blue-100/35 hidden lg:block">{desc}</p>
                </button>
              ))}
            </div>
          </Panel>

          {/* Top performing videos */}
          {topVideos.length > 0 && (
            <Panel className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-white flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Top Performers</h3>
                <button onClick={() => setSection("analytics")} className="text-xs font-black text-[#00c8ff] hover:underline">Analytics →</button>
              </div>
              <div className="space-y-2">
                {topVideos.map((video, i) => (
                  <div key={video.id} className="flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3">
                    <span className={cx("text-lg font-black w-6 text-center shrink-0", i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : "text-amber-700")}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </span>
                    <div className="grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0a1525]">
                      {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <Video className="h-4 w-4 text-blue-200/25" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-black text-white">{video.title}</p>
                      <p className="text-xs text-blue-100/40">{fmt(video.view_count || 0)} views · {fmt(video.like_count || 0)} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Channel card */}
          {channel ? (
            <Panel className="overflow-hidden">
              {channel.banner_url
                ? <div className="h-20 w-full overflow-hidden"><img src={channel.banner_url} alt="" className="h-full w-full object-cover" /></div>
                : <div className="h-20 w-full bg-gradient-to-br from-[#1e78ff]/20 to-[#a855f7]/20" />}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-sm font-black text-white shadow-lg -mt-7 border-2 border-[#03080f]">
                    {channel.channel_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-white">{channel.channel_name}</p>
                      {channel.is_verified && <Award className="h-4 w-4 text-[#00c8ff]" />}
                    </div>
                    <p className="text-xs text-blue-100/40">{channel.category || "Creator"}</p>
                  </div>
                  {channel.is_live && (
                    <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-300 animate-pulse border border-red-500/20">● LIVE</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[[fmt(channel.subscriber_count || 0), "Followers"], [fmt(channel.view_count || 0), "Views"], [fmt(videos.length), "Videos"]].map(([v, l]) => (
                    <div key={l} className="rounded-lg border border-[#12305f] bg-[#03080f]/55 py-2">
                      <p className="text-sm font-black text-white">{v}</p>
                      <p className="text-[10px] text-blue-100/35">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => {}} className="rounded-xl bg-[#1e78ff]/10 border border-[#1e78ff]/25 py-2 text-xs font-black text-[#00c8ff] hover:bg-[#1e78ff]/18 transition">
                    Edit Channel
                  </button>
                  <Link to="/StreamerDashboard" className="rounded-xl bg-red-500/10 border border-red-500/20 py-2 text-xs font-black text-red-300 hover:bg-red-500/18 transition text-center">
                    Go Live
                  </Link>
                </div>
              </div>
            </Panel>
          ) : (
            <Panel className="p-5 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1e78ff]/12 mx-auto mb-3">
                <Tv className="h-6 w-6 text-[#00c8ff]" />
              </div>
              <p className="font-black text-white">No Channel Yet</p>
              <p className="mt-1 text-xs text-blue-100/40">Create your channel to get started</p>
              <Link to="/Channel" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#3d8fff] transition">
                Create Channel
              </Link>
            </Panel>
          )}

          {/* Channel Checklist */}
          <Panel className="p-4">
            <h3 className="mb-3 font-black text-white text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-[#00c8ff]" /> Setup Checklist</h3>
            <div className="space-y-2">
              {[
                { label: "Create channel", done: !!channel, section: null, href: "/Channel" },
                { label: "Upload avatar", done: !!channel?.avatar_url, section: "settings" },
                { label: "Add banner", done: !!channel?.banner_url, section: "settings" },
                { label: "Publish first video", done: stats.videos > 0, section: "production" },
                { label: "Enable monetization", done: !!channel?.monetization_enabled, section: "monetization" },
                { label: "Invite team member", done: false, section: "team" },
              ].map(({ label, done, section, href }) => (
                <button key={label} onClick={() => !done && (section ? setSection(section) : null)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-left transition hover:bg-[#1e78ff]/5">
                  <div className={cx("h-5 w-5 shrink-0 rounded-full border-2 grid place-items-center transition",
                    done ? "border-emerald-500 bg-emerald-500/20" : "border-[#12305f] hover:border-[#1e78ff]/50")}>
                    {done && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
                  </div>
                  <span className={cx("flex-1", done ? "text-blue-100/45 line-through" : "text-white")}>{label}</span>
                  {!done && <ChevronRight className="h-3.5 w-3.5 text-blue-100/25" />}
                </button>
              ))}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#12305f]">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] transition-all"
                style={{ width: `${([!!channel, !!channel?.avatar_url, !!channel?.banner_url, stats.videos > 0, !!channel?.monetization_enabled, false].filter(Boolean).length / 6) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-blue-100/35 text-right">
              {[!!channel, !!channel?.avatar_url, !!channel?.banner_url, stats.videos > 0, !!channel?.monetization_enabled, false].filter(Boolean).length}/6 complete
            </p>
          </Panel>

          {/* Growth Tips */}
          <Panel className="p-4">
            <h3 className="mb-3 font-black text-white text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-400" /> Growth Tips</h3>
            <div className="space-y-2">
              {growthTips.map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-start gap-2.5 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-2.5">
                  <Icon className={cx("mt-0.5 h-4 w-4 shrink-0", color)} />
                  <p className="text-xs text-blue-100/60 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Recent Assets */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-400" /> AI Assets</h3>
              <button onClick={() => setSection("artforge")} className="text-xs font-black text-purple-300 hover:underline">ArtForge →</button>
            </div>
            {recentAssets.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="overflow-hidden rounded-xl border border-[#12305f]/60 bg-[#03080f]/55">
                    <div className="aspect-video bg-[#0a1525] overflow-hidden">
                      {(asset.thumbnail_url || asset.url)
                        ? <img src={asset.thumbnail_url || asset.url} alt="" className="h-full w-full object-cover" />
                        : <div className="grid h-full place-items-center"><Image className="h-5 w-5 text-blue-200/20" /></div>}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-black text-white">{asset.name || "Untitled"}</p>
                      <p className="text-[10px] text-blue-100/35">{asset.type || "asset"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#12305f] p-5 text-center">
                <WandSparkles className="mx-auto mb-2 h-6 w-6 text-purple-400/40" />
                <p className="text-xs text-blue-100/40">No AI assets yet</p>
                <button onClick={() => setSection("artforge")} className="mt-2 text-xs font-black text-purple-300 hover:underline">Generate with ArtForge →</button>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ContentLibrary({ videos, assets, filter, setFilter, query, setQuery }) {
  const items = [
    ...videos.map((v) => ({ id: `video-${v.id}`, title: v.title, type: v.status === "live" ? "livestreams" : v.duration_seconds && v.duration_seconds < 90 ? "shorts" : "videos", tag: v.status, thumb: v.thumbnail_url })),
    ...assets.map((a) => ({ id: `asset-${a.id}`, title: a.name || "Untitled", type: normalizeAssetType(a), tag: a.asset_type || a.type || "asset", thumb: a.thumbnail_url || a.url })),
  ];
  const filters = ["all", "videos", "shorts", "livestreams", "images", "ai generations", "assets", "audio", "templates"];
  const filtered = items.filter((i) => (filter === "all" || i.type === filter) && (!query || i.title.toLowerCase().includes(query.toLowerCase())));

  return (
    <Panel className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-black text-white">Content Library ({filtered.length})</h3>
        <div className="flex gap-2">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2">
            <Search className="h-4 w-4 text-blue-300/40 shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-300/30 w-40" />
          </div>
          <button className="rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-xs font-black text-blue-100/50 hover:text-white transition">
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cx("shrink-0 rounded-full border px-3 py-1 text-xs font-black capitalize transition",
              filter === f ? "border-[#00c8ff] bg-[#00c8ff]/12 text-white" : "border-[#12305f] bg-transparent text-blue-100/45 hover:text-white")}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-[#12305f] bg-[#03080f]/70 transition hover:border-[#1e78ff]/40 group cursor-pointer">
            <div className="aspect-video bg-[#0a1525] overflow-hidden relative">
              {item.thumb
                ? <img src={item.thumb} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="grid h-full place-items-center"><FileVideo className="h-7 w-7 text-blue-200/20" /></div>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
                  <Play className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-black text-white">{item.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-[#1e78ff]/10 px-2 py-0.5 text-[10px] font-black capitalize text-[#00c8ff]">{item.type}</span>
                <span className="text-[10px] text-blue-100/30 capitalize">{item.tag}</span>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="col-span-full rounded-xl border border-dashed border-[#12305f] p-10 text-center">
            <Folder className="mx-auto mb-2 h-8 w-8 text-blue-200/20" />
            <p className="font-black text-white">No content in this view</p>
            <p className="mt-1 text-sm text-blue-100/40">Upload videos or generate assets to populate your library.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function normalizeAssetType(asset) {
  const text = `${asset.asset_type || ""} ${asset.type || ""} ${asset.category || ""}`.toLowerCase();
  if (text.includes("audio") || text.includes("music")) return "audio";
  if (text.includes("template")) return "templates";
  if (text.includes("image") || text.includes("thumbnail")) return "images";
  if (text.includes("ai") || text.includes("artforge")) return "ai generations";
  return "assets";
}

function AnalyticsSection({ stats }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MetricCard icon={Clock} label="Watch Time" value={stats.videos ? `${fmt(stats.videos * 18)}h` : "0h"} detail="Estimated total" color="blue" />
        <MetricCard icon={Target} label="CTR" value={stats.videos ? "6.4%" : "—"} detail="Click-through rate" color="green" />
        <MetricCard icon={Heart} label="Engagement" value={stats.videos ? "4.8%" : "—"} detail="Likes, comments, saves" color="purple" />
        <MetricCard icon={CircleDollarSign} label="Est. Revenue" value={`$${fmt(stats.revenue)}`} detail="Views × CPM" color="amber" />
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="mb-4 bg-[#06101f] border border-[#12305f]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deep">Deep Dive</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><AnalyticsHub /></TabsContent>
        <TabsContent value="deep"><AdvancedAnalyticsHub /></TabsContent>
      </Tabs>
    </div>
  );
}

function CommunitySection() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <Panel className="p-4">
        <h3 className="mb-4 font-black text-white">Community Management</h3>
        <CommunityManagementHub />
      </Panel>
      <Panel className="p-4">
        <h3 className="mb-3 font-black text-white text-sm">Creator Rooms</h3>
        <div className="space-y-2">
          {[
            { room: "Announcements", icon: Megaphone, desc: "Broadcast to subscribers" },
            { room: "Members", icon: UserCheck, desc: "Member-only content" },
            { room: "Watch Parties", icon: Tv, desc: "Live co-watch sessions" },
            { room: "Mod Queue", icon: Shield, desc: "Review flagged content" },
          ].map(({ room, icon: Icon, desc }) => (
            <Link key={room} to="/Communities" className="flex items-center gap-3 rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/30 transition group">
              <Icon className="h-4 w-4 text-blue-300/40 group-hover:text-[#00c8ff] transition" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{room}</p>
                <p className="text-xs text-blue-100/35">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-100/25" />
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function MonetizationSection({ stats }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MetricCard icon={CircleDollarSign} label="Est. Revenue" value={`$${fmt(stats.revenue)}`} detail="Views-based CPM" color="amber" />
        <MetricCard icon={Users} label="Memberships" value="0" detail="Connect membership provider" color="blue" />
        <MetricCard icon={Zap} label="Donations" value="$0" detail="Stream tips & support" color="purple" />
        <MetricCard icon={Star} label="Sponsors" value="Ready" detail="Sponsorship management" color="green" />
      </div>
      <MonetizationHub />
    </div>
  );
}

function SettingsSection() {
  return (
    <Tabs defaultValue="channel">
      <TabsList className="mb-4 bg-[#06101f] border border-[#12305f]">
        <TabsTrigger value="channel"><Edit3 className="mr-1.5 h-3.5 w-3.5" />Channel</TabsTrigger>
        <TabsTrigger value="integrations"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Integrations</TabsTrigger>
        <TabsTrigger value="planning"><Calendar className="mr-1.5 h-3.5 w-3.5" />Planning</TabsTrigger>
      </TabsList>
      <TabsContent value="channel"><ChannelEditor /></TabsContent>
      <TabsContent value="integrations"><IntegrationsHub /></TabsContent>
      <TabsContent value="planning"><PlanningHub /></TabsContent>
    </Tabs>
  );
}