import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreatorOSProvider, useCreatorOS } from "@/lib/CreatorOSContext";
import { useAuth } from "@/lib/AuthContext";
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
import CreatorDashboard from "@/components/studio/CreatorDashboard";
import LiveControlRoom from "@/components/studio/LiveControlRoom";
import { MetricCard, HeaderLine, InputBlock, StatusTile } from "@/components/studio/StudioHelpers";

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
              <Link to="/CreatorOS?section=production" className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#00a6ff]">
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

function CreatorStudioContent() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyTab = searchParams.get("tab");
  const requestedTool = searchParams.get("tool");
  const sectionParam = searchParams.get("section");
  const activeSection =
    sectionParam ||
    (legacyTab === "production" ? "production" : legacyTab === "analytics" ? "analytics" : null) ||
    (requestedTool ? "production" : "dashboard");
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [streamForm, setStreamForm] = useState({ title: "Untitled VStream Live", category: "Just Chatting", slowMode: true, alerts: true });

  const { channel, videos, assets, analytics, stats } = useCreatorOS();
  const section = sections.find((item) => item.id === activeSection) || sections[0];
  const setSection = (id) => {
    setSearchParams({ section: id });
  };

  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(30,120,255,0.20),transparent_34%),radial-gradient(circle_at_83%_16%,rgba(168,85,247,0.18),transparent_32%),linear-gradient(180deg,rgba(3,8,15,0),#03080f_72%)]" />
      <div className="mx-auto grid max-w-[1880px] gap-5 px-3 py-5 sm:px-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <CreatorSidebar activeSection={activeSection} setSection={setSection} channel={channel} stats={stats} />
        <main className="space-y-5">
          <SectionHeader section={section} channelName={channel?.channel_name} />
          {section.id === "dashboard" && <CreatorDashboard stats={stats} videos={videos} assets={assets} setSection={setSection} />}
          {section.id === "production" && <ProductionHub />}
          {section.id === "live" && <LiveControlRoom streamForm={streamForm} setStreamForm={setStreamForm} />}
          {section.id === "library" && <ContentLibrary videos={videos} assets={assets} filter={libraryFilter} setFilter={setLibraryFilter} query={libraryQuery} setQuery={setLibraryQuery} />}
          {section.id === "analytics" && <AnalyticsOperatingRoom stats={stats} />}
          {section.id === "community" && <CommunityOperatingRoom />}
          {section.id === "monetization" && <MonetizationOperatingRoom stats={stats} />}
          {section.id === "team" && <TeamOperatingRoom />}
          {section.id === "settings" && <SettingsOperatingRoom />}
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
