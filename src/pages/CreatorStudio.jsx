import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clapperboard,
  Edit3,
  Eye,
  FileVideo,
  Folder,
  Gauge,
  Heart,
  Image,
  Layers,
  Library,
  MessageSquare,
  Mic2,
  MonitorUp,
  Play,
  Plus,
  Radio,
  Search,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Upload,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ProductionHub from "@/components/studio/ProductionHub";
import PlanningHub from "@/components/studio/PlanningHub";
import AnalyticsHub from "@/components/studio/AnalyticsHub";
import AdvancedAnalyticsHub from "@/components/studio/AdvancedAnalyticsHub";
import CommunityManagementHub from "@/components/studio/CommunityManagementHub";
import MonetizationHub from "@/components/studio/MonetizationHub";
import TeamManagement from "@/components/studio/TeamManagement";
import ChannelEditor from "@/components/studio/ChannelEditor";
import IntegrationsHub from "@/components/studio/IntegrationsHub";
import VStreamAIAssistant from "@/components/ai/VStreamAIAssistant";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sections = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, tagline: "Creator command center" },
  { id: "production", label: "Production", icon: Clapperboard, tagline: "Idea to publish pipeline" },
  { id: "live", label: "Live Control Room", icon: Radio, tagline: "Streams, scenes, chat, clips" },
  { id: "library", label: "Content Library", icon: Library, tagline: "Media, assets, drafts" },
  { id: "analytics", label: "Analytics", icon: BarChart3, tagline: "Growth and revenue insight" },
  { id: "community", label: "Community Hub", icon: MessageSquare, tagline: "Comments, rooms, moderation" },
  { id: "monetization", label: "Monetization", icon: CircleDollarSign, tagline: "Memberships, sponsors, payouts" },
  { id: "team", label: "Team Workspace", icon: Users, tagline: "Editors, mods, collaborators" },
  { id: "settings", label: "Channel Setup", icon: Settings, tagline: "Brand, integrations, defaults" },
];

const productionStages = ["Idea", "Create", "Edit", "Package", "Publish"];
const fallbackProjects = [
  { id: "draft-1", title: "Neon City stream recap", type: "Short", stage: "Edit", updated: "Today" },
  { id: "draft-2", title: "Blue Room Radio thumbnail", type: "ArtForge", stage: "Package", updated: "Yesterday" },
  { id: "draft-3", title: "Creator Lab upload checklist", type: "Video", stage: "Idea", updated: "This week" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function fmt(value = 0) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value || 0);
}

function Panel({ children, className = "" }) {
  return <section className={cx("rounded-2xl border border-[#12305f]/75 bg-[#06101f]/82 shadow-2xl shadow-black/20 backdrop-blur", className)}>{children}</section>;
}

function SectionHeader({ section, channelName }) {
  const Icon = section.icon;
  return (
    <Panel className="overflow-hidden">
      <div className="relative p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,200,255,0.18),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.16),transparent_34%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-white shadow-lg shadow-blue-950/40">
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#00c8ff]">VStream Creator OS</p>
              <h1 className="truncate text-3xl font-black text-white">{section.label}</h1>
              <p className="mt-1 text-sm text-blue-100/58">{section.tagline} for {channelName || "your channel"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/CreatorStudio?section=production" className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#00a6ff]">
              <Plus className="h-4 w-4" /> New Project
            </Link>
            <Link to="/StreamerDashboard" className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-100 transition hover:bg-red-500/16">
              <Radio className="h-4 w-4" /> Go Live
            </Link>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function CreatorStudio() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyTab = searchParams.get("tab");
  const activeSection = searchParams.get("section") || (legacyTab === "production" ? "production" : legacyTab === "analytics" ? "analytics" : "dashboard");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [streamForm, setStreamForm] = useState({ title: "Untitled VStream Live", category: "Just Chatting", slowMode: true, alerts: true });

  const { data: channels = [] } = useQuery({
    queryKey: ["creator-os-channels"],
    queryFn: () => base44.entities.Channel.list(),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["creator-os-videos", user?.email],
    queryFn: () => base44.entities.Video.list("-created_date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["creator-os-assets", user?.email],
    queryFn: () => base44.entities.MediaAsset.filter({ created_by: user.email }, "-created_date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["creator-os-analytics"],
    queryFn: () => base44.entities.VideoAnalytics.list("-date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const myChannels = useMemo(() => channels.filter((channel) => channel.creator_email === user?.email), [channels, user?.email]);
  const channel = myChannels[0];
  const section = sections.find((item) => item.id === activeSection) || sections[0];
  const channelVideos = videos.filter((video) => !channel?.id || video.channel_id === channel.id);
  const readyVideos = channelVideos.filter((video) => video.status === "ready");
  const drafts = channelVideos.filter((video) => ["draft", "processing", "scheduled"].includes(video.status));
  const totalViews = channelVideos.reduce((sum, video) => sum + (video.view_count || 0), 0);
  const revenueEstimate = Math.round(totalViews * 0.0032);

  const setSection = (id) => {
    setSearchParams({ section: id });
  };

  const stats = {
    videos: readyVideos.length,
    drafts: drafts.length,
    views: totalViews,
    assets: assets.length,
    analytics: analytics.length,
    revenue: revenueEstimate,
  };

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(30,120,255,0.20),transparent_34%),radial-gradient(circle_at_83%_16%,rgba(168,85,247,0.18),transparent_32%),linear-gradient(180deg,rgba(3,8,15,0),#03080f_72%)]" />

      <div className="mx-auto grid max-w-[1880px] gap-5 px-3 py-5 sm:px-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <CreatorSidebar activeSection={activeSection} setSection={setSection} channel={channel} stats={stats} />

        <main className="min-w-0 space-y-5">
          <SectionHeader section={section} channelName={channel?.channel_name} />
          {!channel && <ChannelSetupNotice />}
          {activeSection === "dashboard" && <CreatorDashboard stats={stats} videos={channelVideos} assets={assets} setSection={setSection} />}
          {activeSection === "production" && <ProductionHub />}
          {activeSection === "live" && <LiveControlRoom streamForm={streamForm} setStreamForm={setStreamForm} />}
          {activeSection === "library" && <ContentLibrary videos={channelVideos} assets={assets} filter={libraryFilter} setFilter={setLibraryFilter} query={libraryQuery} setQuery={setLibraryQuery} />}
          {activeSection === "analytics" && <AnalyticsOperatingRoom stats={stats} />}
          {activeSection === "community" && <CommunityOperatingRoom />}
          {activeSection === "monetization" && <MonetizationOperatingRoom stats={stats} />}
          {activeSection === "team" && <TeamOperatingRoom />}
          {activeSection === "settings" && <SettingsOperatingRoom />}
        </main>
      </div>
    </div>
  );
}

function CreatorSidebar({ activeSection, setSection, channel, stats }) {
  return (
    <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <Panel className="overflow-hidden">
        <div className="border-b border-[#12305f]/70 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-lg font-black text-white">
              {(channel?.channel_name || "V").slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{channel?.channel_name || "Set up your channel"}</p>
              <p className="truncate text-xs text-blue-100/45">{channel ? `${fmt(channel.subscriber_count || 0)} followers` : "Creator workspace ready"}</p>
            </div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {sections.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)} className={cx("group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", active ? "bg-[#00c8ff]/14 text-white" : "text-blue-100/64 hover:bg-[#1e78ff]/12 hover:text-white")}>
                <Icon className={cx("h-4 w-4", active ? "text-[#00c8ff]" : "text-blue-300/55 group-hover:text-[#00c8ff]")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{item.label}</span>
                  <span className="block truncate text-[11px] text-blue-100/35">{item.tagline}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-[#12305f]/70 p-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <SidebarMetric label="Videos" value={fmt(stats.videos)} />
            <SidebarMetric label="Assets" value={fmt(stats.assets)} />
            <SidebarMetric label="Views" value={fmt(stats.views)} />
            <SidebarMetric label="Drafts" value={fmt(stats.drafts)} />
          </div>
        </div>
      </Panel>
    </aside>
  );
}

function SidebarMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3">
      <p className="font-black text-white">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/38">{label}</p>
    </div>
  );
}

function ChannelSetupNotice() {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-300" />
          <div>
            <p className="font-black text-white">Channel setup needed</p>
            <p className="text-sm text-blue-100/55">You can explore the creator OS, but publishing and team workflows need a channel.</p>
          </div>
        </div>
        <Link to="/Channel" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:bg-[#00a6ff]">
          Create Channel <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  );
}

function CreatorDashboard({ stats, videos, assets, setSection }) {
  const recent = videos.slice(0, 4);
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

        <Panel className="p-4">
          <HeaderLine icon={Clapperboard} title="Continue Editing" action="Open Production" onAction={() => setSection("production")} />
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
        </Panel>

        <Panel className="p-4">
          <HeaderLine icon={Calendar} title="Production Plan" action="Open Calendar" onAction={() => setSection("production")} />
          <div className="grid gap-2 md:grid-cols-5">
            {productionStages.map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-3">
                <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-[#00c8ff]/12 text-xs font-black text-[#00c8ff]">{index + 1}</span>
                <p className="font-black text-white">{stage}</p>
                <p className="mt-1 text-xs text-blue-100/42">{index === 0 ? "Capture concepts" : index === 4 ? "Schedule or go live" : "Keep assets moving"}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <aside className="space-y-5">
        <VStreamAIAssistant surface="compact" contextType="creator" context={{ title: "Creator OS dashboard", stats, actions: ["Next production step", "Content calendar", "Growth insight", "Publish checklist"] }} />
        <Panel className="p-4">
          <HeaderLine icon={Bell} title="Notifications" />
          <div className="space-y-2">
            {["No urgent upload issues", assets.length ? `${assets.length} assets available for packaging` : "Upload or generate your first reusable asset", "Community moderation queue is clear"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <Panel className="p-4">
      <Icon className="mb-4 h-5 w-5 text-[#00c8ff]" />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</p>
      <p className="mt-2 text-xs text-blue-100/45">{detail}</p>
    </Panel>
  );
}

function HeaderLine({ icon: Icon, title, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#00c8ff]" />
        <h2 className="font-black text-white">{title}</h2>
      </div>
      {action && <button onClick={onAction} className="text-xs font-black text-[#00c8ff] hover:text-white">{action}</button>}
    </div>
  );
}

function LiveControlRoom({ streamForm, setStreamForm }) {
  const [activeScene, setActiveScene] = useState("Starting Soon");
  const [markers, setMarkers] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState(["Welcome viewers as they arrive.", "Pin the stream rules before going live."]);
  const scenes = ["Starting Soon", "Main Camera", "Screen Share", "Guest Split", "BRB", "Outro"];

  const addMarker = () => setMarkers((current) => [`Marker ${current.length + 1} at ${new Date().toLocaleTimeString()}`, ...current]);
  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat((current) => [chatInput.trim(), ...current]);
    setChatInput("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Panel className="p-4">
          <HeaderLine icon={MonitorUp} title="Stream Setup" />
          <div className="grid gap-4 md:grid-cols-2">
            <InputBlock label="Stream title" value={streamForm.title} onChange={(title) => setStreamForm((current) => ({ ...current, title }))} />
            <InputBlock label="Category" value={streamForm.category} onChange={(category) => setStreamForm((current) => ({ ...current, category }))} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <StatusTile label="Health" value="Excellent" color="text-emerald-300" />
            <StatusTile label="Bitrate" value="6.2 Mbps" color="text-[#00c8ff]" />
            <StatusTile label="Latency" value="Low" color="text-purple-200" />
            <StatusTile label="Dropped frames" value="0.1%" color="text-emerald-300" />
          </div>
        </Panel>

        <Panel className="p-4">
          <HeaderLine icon={Layers} title="Scenes and Sources" />
          <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              {scenes.map((scene) => (
                <button key={scene} onClick={() => setActiveScene(scene)} className={cx("w-full rounded-xl border px-3 py-2 text-left text-sm font-black", activeScene === scene ? "border-[#00c8ff] bg-[#00c8ff]/12 text-white" : "border-[#12305f] bg-[#03080f]/55 text-blue-100/55 hover:text-white")}>{scene}</button>
              ))}
            </div>
            <div className="grid min-h-[360px] place-items-center rounded-2xl border border-[#12305f] bg-[radial-gradient(circle_at_center,rgba(30,120,255,0.18),transparent_38%),#020712]">
              <div className="text-center">
                <Play className="mx-auto mb-4 h-10 w-10 text-[#00c8ff]" />
                <h3 className="text-2xl font-black text-white">{activeScene}</h3>
                <p className="mt-2 text-sm text-blue-100/48">Scene preview and source controls are staged here.</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <aside className="space-y-5">
        <VStreamAIAssistant surface="compact" contextType="creator" context={{ title: streamForm.title, category: streamForm.category, actions: ["Livestream plan", "Quick social post", "Moderation actions", "Clip ideas"] }} />
        <Panel className="p-4">
          <HeaderLine icon={MessageSquare} title="Chat Dock" />
          <div className="mb-3 space-y-2">
            {chat.slice(0, 4).map((item) => <div key={item} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">{item}</div>)}
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-sm text-white outline-none" placeholder="Post to chat..." />
            <button onClick={sendChat} className="rounded-xl bg-[#1e78ff] px-3 py-2 text-sm font-black text-white">Send</button>
          </div>
        </Panel>
        <Panel className="p-4">
          <HeaderLine icon={Zap} title="Markers and Clips" action="Add Marker" onAction={addMarker} />
          <div className="space-y-2">
            {markers.length ? markers.map((marker) => <p key={marker} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">{marker}</p>) : <p className="rounded-xl border border-dashed border-[#12305f] p-4 text-sm text-blue-100/42">No stream markers yet.</p>}
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function InputBlock({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]" />
    </label>
  );
}

function StatusTile({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/55 p-3">
      <p className={cx("text-xl font-black", color)}>{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-blue-100/38">{label}</p>
    </div>
  );
}

function ContentLibrary({ videos, assets, filter, setFilter, query, setQuery }) {
  const items = [
    ...videos.map((video) => ({ id: `video-${video.id}`, title: video.title, type: video.status === "live" ? "livestreams" : video.duration_seconds && video.duration_seconds < 90 ? "shorts" : "videos", tag: video.status || "video" })),
    ...assets.map((asset) => ({ id: `asset-${asset.id}`, title: asset.name || asset.title || "Untitled asset", type: normalizeAssetType(asset), tag: asset.asset_type || asset.type || "asset" })),
  ];
  const filtered = items.filter((item) => (filter === "all" || item.type === filter) && (!query || item.title.toLowerCase().includes(query.toLowerCase())));
  const filters = ["all", "videos", "shorts", "livestreams", "images", "ai generations", "drafts", "templates", "assets", "audio", "overlays"];

  return (
    <Panel className="p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <HeaderLine icon={Folder} title="Unified Content Library" />
        <div className="flex min-w-0 gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2">
            <Search className="h-4 w-4 text-blue-300/45" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets, videos, drafts..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-300/35" />
          </div>
          <button className="rounded-xl border border-[#00c8ff]/30 bg-[#00c8ff]/10 px-3 py-2 text-sm font-black text-[#00c8ff]">New Folder</button>
        </div>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={cx("shrink-0 rounded-full border px-3 py-1.5 text-xs font-black capitalize", filter === item ? "border-[#00c8ff] bg-[#00c8ff]/14 text-white" : "border-[#12305f] bg-[#03080f] text-blue-100/55 hover:text-white")}>{item}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <button key={item.id} className="rounded-2xl border border-[#12305f] bg-[#03080f]/58 p-3 text-left transition hover:border-[#00c8ff]/45">
            <div className="mb-3 grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-[#0a1b35] to-[#170a2e] text-[#00c8ff]">
              {item.type.includes("image") || item.type.includes("generation") ? <Image className="h-7 w-7" /> : <FileVideo className="h-7 w-7" />}
            </div>
            <p className="line-clamp-2 text-sm font-black text-white">{item.title}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="rounded-full bg-[#1e78ff]/12 px-2 py-1 font-black capitalize text-[#00c8ff]">{item.type}</span>
              <span className="text-blue-100/35">{item.tag}</span>
            </div>
          </button>
        ))}
        {!filtered.length && (
          <div className="col-span-full rounded-2xl border border-dashed border-[#12305f] p-8 text-center">
            <p className="font-black text-white">No content in this view</p>
            <p className="mt-2 text-sm text-blue-100/50">Upload, generate, or create a project to populate this library.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function normalizeAssetType(asset) {
  const text = `${asset.asset_type || ""} ${asset.type || ""} ${asset.category || ""}`.toLowerCase();
  if (text.includes("audio") || text.includes("music")) return "audio";
  if (text.includes("overlay")) return "overlays";
  if (text.includes("template")) return "templates";
  if (text.includes("draft")) return "drafts";
  if (text.includes("image") || text.includes("thumbnail")) return "images";
  if (text.includes("ai") || text.includes("artforge")) return "ai generations";
  return "assets";
}

function AnalyticsOperatingRoom({ stats }) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard icon={Activity} label="Watch time" value={stats.videos ? `${fmt(stats.videos * 18)}h` : "0h"} detail="Estimated from uploads" />
          <MetricCard icon={Tags} label="CTR" value={stats.videos ? "6.4%" : "0%"} detail="Connect real analytics for precision" />
          <MetricCard icon={Heart} label="Engagement" value={stats.videos ? "4.8%" : "0%"} detail="Likes, comments, saves" />
          <MetricCard icon={CircleDollarSign} label="Revenue" value={`$${fmt(stats.revenue)}`} detail="Estimated snapshot" />
        </div>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deep">Deep Dive</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><AnalyticsHub /></TabsContent>
          <TabsContent value="deep"><AdvancedAnalyticsHub /></TabsContent>
        </Tabs>
      </div>
      <aside className="space-y-5">
        <VStreamAIAssistant surface="compact" contextType="analytics" context={{ title: "Creator analytics", stats, actions: ["Summarize performance", "Improve retention", "Find opportunity", "Next experiment"] }} />
      </aside>
    </div>
  );
}

function CommunityOperatingRoom() {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel className="p-4">
        <HeaderLine icon={MessageSquare} title="Community Management" />
        <CommunityManagementHub />
      </Panel>
      <aside className="space-y-5">
        <VStreamAIAssistant surface="compact" contextType="communities" context={{ title: "Creator community", actions: ["Moderation scan", "Conversation prompt", "Event idea", "Pinned message"] }} />
        <Panel className="p-4">
          <HeaderLine icon={Shield} title="Creator Rooms" />
          {["Announcements", "Members", "Watch parties", "Mod queue"].map((room) => <Link key={room} to="/Communities" className="mb-2 flex items-center justify-between rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm font-black text-blue-100/65 hover:text-white">{room}<ChevronRight className="h-4 w-4" /></Link>)}
        </Panel>
      </aside>
    </div>
  );
}

function MonetizationOperatingRoom({ stats }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard icon={CircleDollarSign} label="Estimated revenue" value={`$${fmt(stats.revenue)}`} detail="Views-based estimate" />
        <MetricCard icon={Users} label="Memberships" value="0" detail="Connect membership provider" />
        <MetricCard icon={Zap} label="Donations" value="$0" detail="Stream tips and support" />
        <MetricCard icon={Boxes} label="Store hooks" value="Ready" detail="Merch and sponsors" />
      </div>
      <MonetizationHub />
    </div>
  );
}

function TeamOperatingRoom() {
  return (
    <Panel className="p-4">
      <HeaderLine icon={Users} title="Team Workspace" />
      <TeamManagement />
    </Panel>
  );
}

function SettingsOperatingRoom() {
  return (
    <Tabs defaultValue="channel">
      <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
        <TabsTrigger value="channel"><Edit3 className="mr-2 h-4 w-4" />Channel</TabsTrigger>
        <TabsTrigger value="integrations"><Sparkles className="mr-2 h-4 w-4" />Integrations</TabsTrigger>
        <TabsTrigger value="planning"><Calendar className="mr-2 h-4 w-4" />Planning</TabsTrigger>
      </TabsList>
      <TabsContent value="channel"><ChannelEditor /></TabsContent>
      <TabsContent value="integrations"><IntegrationsHub /></TabsContent>
      <TabsContent value="planning"><PlanningHub /></TabsContent>
    </Tabs>
  );
}
