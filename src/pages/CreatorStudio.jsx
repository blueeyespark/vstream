import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreatorOSProvider, useCreatorOS } from "@/lib/CreatorOSContext";
import { useAuth } from "@/lib/AuthContext";
import {
  Activity, AlertTriangle, BarChart3, Calendar, CheckCircle2, ChevronRight,
  CircleDollarSign, Clapperboard, Edit3, Eye, FileVideo, Folder, Gauge, Heart,
  Image, Library, MessageSquare, Mic2, MonitorUp, Play, Plus, Radio, Search,
  Settings, Sparkles, Tags, Upload, Users, Wand2, Zap, TrendingUp, Clock,
  Video, ArrowUpRight, Star, MoreHorizontal, Layers, WandSparkles,
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

const sections = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, tagline: "Creator command center" },
  { id: "production", label: "Production", icon: Clapperboard, tagline: "Idea to publish pipeline" },
  { id: "artforge", label: "ArtForge AI", icon: WandSparkles, tagline: "AI art, video, stickers, 3D" },
  { id: "live", label: "Live Room", icon: Radio, tagline: "Streams, scenes, chat, clips" },
  { id: "library", label: "Content Library", icon: Library, tagline: "Media, assets, drafts" },
  { id: "analytics", label: "Analytics", icon: BarChart3, tagline: "Growth and revenue" },
  { id: "community", label: "Community", icon: MessageSquare, tagline: "Comments, rooms, moderation" },
  { id: "monetization", label: "Monetize", icon: CircleDollarSign, tagline: "Memberships, sponsors, payouts" },
  { id: "team", label: "Team", icon: Users, tagline: "Editors, mods, collaborators" },
  { id: "settings", label: "Settings", icon: Settings, tagline: "Brand, integrations, defaults" },
];

function cx(...classes) { return classes.filter(Boolean).join(" "); }
function fmt(value = 0) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value || 0);
}

function Panel({ children, className = "" }) {
  return <section className={cx("rounded-2xl border border-[#12305f]/75 bg-[#06101f]/90 shadow-xl shadow-black/20 backdrop-blur", className)}>{children}</section>;
}

function MetricCard({ icon: Icon, label, value, detail, trend }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4 hover:border-[#1e78ff]/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1e78ff]/12">
          <Icon className="h-4 w-4 text-[#00c8ff]" />
        </div>
        {trend && <span className="flex items-center gap-1 text-xs font-black text-emerald-400"><TrendingUp className="h-3 w-3" />{trend}</span>}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-xs font-black uppercase tracking-widest text-blue-100/40">{label}</p>
      {detail && <p className="mt-1 text-xs text-blue-100/35">{detail}</p>}
    </div>
  );
}

function SectionHeader({ section, channelName }) {
  const Icon = section.icon;
  return (
    <Panel className="overflow-hidden">
      <div className="relative p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,200,255,0.14),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg",
              section.id === "artforge"
                ? "bg-gradient-to-br from-[#a855f7] to-[#ec4899] shadow-purple-950/40"
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
            <Link to="/CreatorOS?section=production" className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#3d8fff] transition">
              <Plus className="h-4 w-4" /> New Project
            </Link>
            <Link to="/StreamerDashboard" className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-500/18 transition">
              <Radio className="h-4 w-4" /> Go Live
            </Link>
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

  const { channel, videos, assets, stats } = useCreatorOS();
  const section = sections.find((s) => s.id === activeSection) || sections[0];
  const setSection = (id) => setSearchParams({ section: id });

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(30,120,255,0.16),transparent_34%),radial-gradient(circle_at_83%_16%,rgba(168,85,247,0.14),transparent_32%)]" />
      <div className="mx-auto grid max-w-[1880px] gap-4 px-3 py-4 sm:px-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CreatorSidebar activeSection={activeSection} setSection={setSection} channel={channel} stats={stats} />
        <main className="space-y-4 min-w-0">
          <SectionHeader section={section} channelName={channel?.channel_name} />
          {!channel && <ChannelSetupNotice />}
          {section.id === "dashboard" && <DashboardContent stats={stats} videos={videos} assets={assets} setSection={setSection} channel={channel} />}
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

function CreatorSidebar({ activeSection, setSection, channel, stats }) {
  return (
    <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <Panel className="overflow-hidden">
        <div className="border-b border-[#12305f]/70 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-base font-black text-white shadow-lg shadow-blue-950/40">
              {(channel?.channel_name || "V").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{channel?.channel_name || "Set up your channel"}</p>
              <p className="truncate text-xs text-blue-100/40">{channel ? `${fmt(channel.subscriber_count || 0)} followers` : "Creator workspace"}</p>
            </div>
          </div>
        </div>
        <nav className="space-y-0.5 p-2">
          {sections.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={cx("group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all",
                  item.id === "artforge"
                    ? active ? "bg-[#a855f7]/18 text-white" : "text-purple-200/60 hover:bg-[#a855f7]/10 hover:text-purple-100"
                    : active ? "bg-[#1e78ff]/14 text-white" : "text-blue-100/55 hover:bg-[#1e78ff]/8 hover:text-white")}>
                <Icon className={cx("h-4 w-4 shrink-0",
                  item.id === "artforge"
                    ? active ? "text-[#a855f7]" : "text-purple-400/50 group-hover:text-[#a855f7] transition"
                    : active ? "text-[#00c8ff]" : "text-blue-300/45 group-hover:text-[#00c8ff] transition")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{item.label}</span>
                  <span className="block truncate text-[10px] text-blue-100/30">{item.tagline}</span>
                </span>
                {active && <div className={cx("h-1.5 w-1.5 rounded-full", item.id === "artforge" ? "bg-[#a855f7]" : "bg-[#00c8ff]")} />}
                {item.id === "artforge" && !active && <span className="shrink-0 rounded-full bg-[#a855f7]/20 px-1.5 py-0.5 text-[9px] font-black text-purple-300">AI</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-[#12305f]/70 p-3">
          <div className="grid grid-cols-2 gap-2">
            {[["Videos", stats.videos], ["Assets", stats.assets], ["Views", fmt(stats.views)], ["Drafts", stats.drafts]].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-2.5">
                <p className="font-black text-white text-sm">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/35">{label}</p>
              </div>
            ))}
          </div>
        </div>

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

function DashboardContent({ stats, videos, assets, setSection, channel }) {
  const recent = videos.slice(0, 4);
  const recentAssets = assets.slice(0, 3);

  const quickActions = [
    { label: "Upload Video", icon: Upload, section: "production", color: "text-[#1e78ff]", bg: "bg-[#1e78ff]/10 border-[#1e78ff]/30" },
    { label: "Go Live", icon: Radio, href: "/StreamerDashboard", color: "text-red-300", bg: "bg-red-500/8 border-red-400/25" },
    { label: "ArtForge AI", icon: Wand2, section: "artforge", color: "text-purple-300", bg: "bg-purple-500/8 border-purple-400/25" },
    { label: "Analytics", icon: BarChart3, section: "analytics", color: "text-emerald-300", bg: "bg-emerald-500/8 border-emerald-400/25" },
    { label: "Content Calendar", icon: Calendar, href: "/ContentCalendar", color: "text-amber-300", bg: "bg-amber-500/8 border-amber-400/25" },
    { label: "Thumbnail Maker", icon: Image, href: "/ThumbnailMaker", color: "text-cyan-300", bg: "bg-cyan-500/8 border-cyan-400/25" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <MetricCard icon={Eye} label="Total views" value={fmt(stats.views)} detail={stats.videos ? "From uploads" : "Upload to start"} trend={stats.views > 0 ? "+12%" : null} />
        <MetricCard icon={FileVideo} label="Published" value={fmt(stats.videos)} detail="Ready videos" />
        <MetricCard icon={Library} label="Assets" value={fmt(stats.assets)} detail="Media & AI art" />
        <MetricCard icon={CircleDollarSign} label="Revenue est." value={`$${fmt(stats.revenue)}`} detail="Views-based" />
      </div>

      {/* Quick actions */}
      <Panel className="p-4">
        <h3 className="mb-3 font-black text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(({ label, icon: Icon, section, href, color, bg }) => {
            const inner = (
              <div className={cx("flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-lg", bg)}>
                <Icon className={cx("h-5 w-5", color)} />
                <span className="text-xs font-black text-white">{label}</span>
              </div>
            );
            if (href) return <Link key={label} to={href}>{inner}</Link>;
            return <button key={label} onClick={() => setSection(section)}>{inner}</button>;
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* Recent videos */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">Recent Videos</h3>
              <button onClick={() => setSection("library")} className="text-xs font-black text-[#00c8ff] hover:underline">View all</button>
            </div>
            {recent.length > 0 ? (
              <div className="space-y-2">
                {recent.map((video) => (
                  <div key={video.id} className="flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-3 hover:border-[#1e78ff]/30 transition group">
                    <div className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0a1525]">
                      {video.thumbnail_url
                        ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        : <Video className="h-5 w-5 text-blue-200/25" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">{video.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-blue-100/40">
                        <span className={cx("rounded-full px-1.5 py-0.5 text-[10px] font-black",
                          video.status === "ready" ? "bg-emerald-500/15 text-emerald-300" : "bg-yellow-500/15 text-yellow-300")}>
                          {video.status}
                        </span>
                        <span>{fmt(video.view_count || 0)} views</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-blue-200/20 group-hover:text-[#00c8ff] transition shrink-0" />
                  </div>
                ))}
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

          {/* Production pipeline stages */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">Production Pipeline</h3>
              <button onClick={() => setSection("production")} className="text-xs font-black text-[#00c8ff] hover:underline">Open</button>
            </div>
            <div className="grid gap-2 grid-cols-5">
              {[["Idea", "Capture concepts"], ["Create", "Record or generate"], ["Edit", "Refine content"], ["Package", "Thumbnail & metadata"], ["Publish", "Schedule or go live"]].map(([stage, desc], i) => (
                <div key={stage} className="rounded-xl border border-[#12305f] bg-[#03080f]/58 p-3 text-center">
                  <div className="mx-auto mb-2 grid h-7 w-7 place-items-center rounded-full bg-[#1e78ff]/12 text-xs font-black text-[#00c8ff]">{i + 1}</div>
                  <p className="text-xs font-black text-white">{stage}</p>
                  <p className="mt-0.5 text-[10px] text-blue-100/35 hidden lg:block">{desc}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Channel info */}
          {channel && (
            <Panel className="overflow-hidden">
              {channel.banner_url && <div className="h-20 w-full overflow-hidden"><img src={channel.banner_url} alt="" className="h-full w-full object-cover" /></div>}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-sm font-black text-white">
                    {channel.channel_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-white">{channel.channel_name}</p>
                    <p className="text-xs text-blue-100/40">{channel.category || "Creator"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[[fmt(channel.subscriber_count || 0), "Followers"], [fmt(channel.view_count || 0), "Views"], [channel.is_live ? "LIVE" : "Offline", "Status"]].map(([v, l]) => (
                    <div key={l} className="rounded-lg border border-[#12305f] bg-[#03080f]/55 py-2">
                      <p className={cx("text-sm font-black", v === "LIVE" ? "text-red-300" : "text-white")}>{v}</p>
                      <p className="text-[10px] text-blue-100/35">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          {/* Recent assets */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white text-sm">Recent Assets</h3>
              <button onClick={() => setSection("artforge")} className="text-xs font-black text-purple-300 hover:underline">ArtForge AI →</button>
            </div>
            {recentAssets.length > 0 ? (
              <div className="space-y-2">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-[#12305f]/60 bg-[#03080f]/55 p-2.5">
                    <div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0a1525]">
                      {(asset.thumbnail_url || asset.url)
                        ? <img src={asset.thumbnail_url || asset.url} alt="" className="h-full w-full object-cover" />
                        : <Image className="h-4 w-4 text-blue-200/25" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-white">{asset.name || "Untitled"}</p>
                      <p className="text-[10px] text-blue-100/35">{asset.type || asset.category || "asset"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#12305f] p-5 text-center">
                <p className="text-xs text-blue-100/40">No assets yet</p>
                <button onClick={() => setSection("artforge")} className="mt-2 text-xs font-black text-purple-300 hover:underline">Generate with ArtForge AI →</button>
              </div>
            )}
          </Panel>

          {/* Status checklist */}
          <Panel className="p-4">
            <h3 className="mb-3 font-black text-white text-sm">Channel Checklist</h3>
            <div className="space-y-2">
              {[
                { label: "Channel created", done: !!channel },
                { label: "Avatar uploaded", done: !!channel?.avatar_url },
                { label: "Banner uploaded", done: !!channel?.banner_url },
                { label: "First video published", done: stats.videos > 0 },
                { label: "Monetization enabled", done: !!channel?.monetization_enabled },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <div className={cx("h-4 w-4 shrink-0 rounded-full border-2 grid place-items-center", done ? "border-emerald-500 bg-emerald-500/20" : "border-[#12305f]")}>
                    {done && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
                  </div>
                  <span className={done ? "text-blue-100/60 line-through" : "text-white"}>{label}</span>
                </div>
              ))}
            </div>
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
          <div key={item.id} className="overflow-hidden rounded-xl border border-[#12305f] bg-[#03080f]/70 transition hover:border-[#1e78ff]/40">
            <div className="aspect-video bg-[#0a1525] overflow-hidden">
              {item.thumb
                ? <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                : <div className="grid h-full place-items-center"><FileVideo className="h-7 w-7 text-blue-200/20" /></div>}
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
        <MetricCard icon={Activity} label="Watch time" value={stats.videos ? `${fmt(stats.videos * 18)}h` : "0h"} detail="Estimated from uploads" />
        <MetricCard icon={Tags} label="CTR" value={stats.videos ? "6.4%" : "—"} detail="Connect YouTube/Twitch for real data" />
        <MetricCard icon={Heart} label="Engagement" value={stats.videos ? "4.8%" : "—"} detail="Likes, comments, saves" />
        <MetricCard icon={CircleDollarSign} label="Revenue est." value={`$${fmt(stats.revenue)}`} detail="Views × CPM estimate" />
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
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
          {["Announcements", "Members", "Watch Parties", "Mod Queue"].map((room) => (
            <Link key={room} to="/Communities" className="flex items-center justify-between rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm font-black text-blue-100/60 hover:text-white hover:border-[#1e78ff]/30 transition">
              {room}<ChevronRight className="h-4 w-4" />
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
        <MetricCard icon={CircleDollarSign} label="Revenue est." value={`$${fmt(stats.revenue)}`} detail="Views-based estimate" />
        <MetricCard icon={Users} label="Memberships" value="0" detail="Connect membership provider" />
        <MetricCard icon={Zap} label="Donations" value="$0" detail="Stream tips and support" />
        <MetricCard icon={Star} label="Sponsors" value="Ready" detail="Sponsorship management" />
      </div>
      <MonetizationHub />
    </div>
  );
}

function SettingsSection() {
  return (
    <Tabs defaultValue="channel">
      <TabsList className="mb-4">
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