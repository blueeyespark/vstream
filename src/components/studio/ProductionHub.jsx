import { useMemo, useState } from "react";
import { useCreatorOS } from "@/lib/CreatorOSContext";
import {
  BadgeCheck, Box, CheckCircle2, ChevronRight, Clapperboard, Clock,
  Hand, Image, ImageIcon, Layers, Library, ListChecks, Music,
  PackageCheck, Palette, PenTool, Radio, Save, Send, Smile,
  Upload, Video, WandSparkles, Zap, Film, Sparkles, ArrowRight,
  Play, FileVideo, Wand2, Grid2x2, Layers2, Brush, ScanLine,
  LayoutGrid, Star, TrendingUp, Loader2, Circle, CheckCircle, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import VStreamAIAssistant from "@/components/ai/VStreamAIAssistant";
import VideoUpload from "@/pages/VideoUpload";
import VideoEditor from "@/pages/VideoEditor";
import IntroOutroMaker from "@/pages/IntroOutroMaker";
import MusicEditor from "@/pages/MusicEditor";
import ArtForgeStudio from "@/pages/ArtForgeStudio";

const workflowStages = ["Idea", "Assets", "Create", "Edit", "Review", "Publish"];
const assetBuckets = ["videos", "images", "thumbnails", "audio", "models", "stickers", "comics", "drafts", "published"];

const modes = [
  { id: "upload", label: "Upload", icon: Upload, stage: "Assets" },
  { id: "editor", label: "Editor", icon: Video, stage: "Edit" },
  { id: "artforge", label: "ArtForge AI", icon: WandSparkles, stage: "Create" },
  { id: "assets", label: "Assets", icon: Library, stage: "Assets" },
  { id: "publish", label: "Publish", icon: Send, stage: "Publish" },
];

const projectTypeGroups = [
  {
    label: "Video",
    color: "from-blue-500 to-cyan-500",
    accent: "#00c8ff",
    types: [
      { id: "upload-video", label: "Upload Video", icon: Upload, format: "Long-form", mode: "upload", path: ["Upload", "Editor", "Thumbnail", "Metadata", "Publish"] },
      { id: "edit-video", label: "Edit Video", icon: Film, format: "Video edit", mode: "editor", path: ["Select", "Timeline", "Audio", "Review", "Publish"] },
      { id: "create-short", label: "Short / Reel", icon: Clapperboard, format: "Vertical short", mode: "editor", path: ["Script", "Scenes", "Timeline", "Publish"] },
      { id: "intro-outro", label: "Intro / Outro", icon: Radio, format: "Motion bumper", mode: "editor", path: ["Template", "Brand", "Preview", "Export"] },
    ],
  },
  {
    label: "AI Art",
    color: "from-violet-500 to-fuchsia-500",
    accent: "#a855f7",
    types: [
      { id: "generate-image", label: "Generate Image", icon: WandSparkles, format: "Image asset", mode: "artforge", path: ["Prompt", "Canvas", "Variants", "Save"] },
      { id: "make-thumbnail", label: "Thumbnail", icon: Image, format: "Thumbnail", mode: "artforge", path: ["Prompt", "Generate", "Preview", "Attach"] },
      { id: "make-sticker", label: "Sticker Pack", icon: Smile, format: "Sticker pack", mode: "artforge", path: ["Prompt", "Transparent", "Variants", "Save"] },
      { id: "make-comic", label: "Comic Strip", icon: LayoutGrid, format: "Comic strip", mode: "artforge", path: ["Story", "Panels", "Captions", "Export"] },
    ],
  },
  {
    label: "3D / Model",
    color: "from-orange-500 to-violet-500",
    accent: "#f97316",
    types: [
      { id: "build-2d", label: "2D Model", icon: Layers2, format: "Sprites / PNGTuber", mode: "artforge", path: ["Character", "States", "Preview", "Save"] },
      { id: "build-3d", label: "3D Model", icon: Box, format: "3D model", mode: "artforge", path: ["Prompt", "Preview", "Save"] },
      { id: "trace-pose", label: "Tracer", icon: ScanLine, format: "Line art", mode: "artforge", path: ["Upload", "Style", "Generate", "Save"] },
      { id: "hand-helper", label: "Hand Helper", icon: Hand, format: "Pose reference", mode: "artforge", path: ["Pose", "View", "Generate", "Save"] },
    ],
  },
  {
    label: "Audio / Publish",
    color: "from-emerald-500 to-teal-500",
    accent: "#10b981",
    types: [
      { id: "music-audio", label: "Music / Audio", icon: Music, format: "Audio bed", mode: "editor", path: ["Upload", "Mix", "Preview", "Export"] },
      { id: "publish-package", label: "Publish Package", icon: PackageCheck, format: "Bundle", mode: "publish", path: ["Metadata", "Thumbnail", "Checklist", "Publish"] },
    ],
  },
];

// Flat list for easy lookups
const projectTypes = projectTypeGroups.flatMap((g) => g.types);

const demoAssets = [
  { id: "demo-blue-room", name: "Blue Room Radio bumper", asset_type: "audio", category: "demo", type: "audio" },
  { id: "demo-artforge", name: "ArtForge Circle thumbnail", asset_type: "thumbnail", category: "demo", type: "image" },
  { id: "demo-neon-city", name: "Neon City Finals draft", asset_type: "video draft", category: "demo", type: "video" },
];

function cx(...classes) { return classes.filter(Boolean).join(" "); }

function Panel({ children, className = "" }) {
  return (
    <section className={cx("rounded-2xl border border-[#1a3a60]/60 bg-[#06101f]/90 shadow-xl shadow-black/25 backdrop-blur", className)}>
      {children}
    </section>
  );
}

const artforgeModeMap = {
  "generate-image": "image",
  "make-thumbnail": "image",
  "make-sticker": "sticker",
  "make-comic": "comic",
  "build-2d": "2d_model",
  "build-3d": "3d_model",
  "trace-pose": "tracer",
  "hand-helper": "hand_helper",
};

export default function ProductionHub() {
  const { user } = useAuth();
  const [selectedTypeId, setSelectedTypeId] = useState("upload-video");
  const selectedType = projectTypes.find((t) => t.id === selectedTypeId) || projectTypes[0];
  const [activeMode, setActiveMode] = useState(selectedType.mode);
  const [activeStage, setActiveStage] = useState(modeStage(selectedType.mode));
  const [artforgeTab, setArtforgeTab] = useState("generate");
  const [assetFilter, setAssetFilter] = useState("videos");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [artforgeInitialMode, setArtforgeInitialMode] = useState("image");
  const [publishForm, setPublishForm] = useState({
    title: "Untitled VStream production",
    description: "",
    category: "Entertainment",
    tags: "vstream, creator",
    visibility: "public",
    thumbnail: "",
    scheduled: "",
  });

  const { assets: mediaAssets = [] } = useCreatorOS();
  const displayAssets = mediaAssets.length ? mediaAssets : demoAssets;
  const selectedAsset = displayAssets.find((a) => a.id === selectedAssetId) || null;

  const queue = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("artforge_jobs") || "[]").slice(0, 4); } catch { return []; }
  }, [activeMode, draftSaved]);

  const bucketCounts = useMemo(() => {
    const counts = Object.fromEntries(assetBuckets.map((b) => [b, 0]));
    displayAssets.forEach((asset) => {
      const text = `${asset.type || ""} ${asset.asset_type || ""} ${asset.category || ""}`.toLowerCase();
      if (text.includes("video") || text.includes("draft") || text.includes("export")) counts.videos += 1;
      if (text.includes("image") || text.includes("graphic")) counts.images += 1;
      if (text.includes("thumbnail")) counts.thumbnails += 1;
      if (text.includes("audio") || text.includes("music")) counts.audio += 1;
      if (text.includes("3d") || text.includes("model")) counts.models += 1;
      if (text.includes("sticker")) counts.stickers += 1;
      if (text.includes("comic")) counts.comics += 1;
      if (text.includes("project") || text.includes("draft")) counts.drafts += 1;
      if (text.includes("published")) counts.published += 1;
    });
    return counts;
  }, [displayAssets]);

  const activeModeMeta = modes.find((m) => m.id === activeMode) || modes[0];
  const readiness = [
    { label: "Project type selected", done: Boolean(selectedType) },
    { label: "Asset selected", done: Boolean(selectedAsset) },
    { label: "Thumbnail chosen", done: Boolean(publishForm.thumbnail || selectedAsset?.asset_type?.includes("thumbnail")) },
    { label: "Title ready", done: publishForm.title.trim().length > 3 },
    { label: "Visibility set", done: Boolean(publishForm.visibility) },
  ];
  const canPublish = readiness.every((r) => r.done);
  const readinessScore = readiness.filter((r) => r.done).length;

  const setMode = (modeId) => { setActiveMode(modeId); setActiveStage(modeStage(modeId)); };

  const selectProjectType = (type) => {
    const newArtforgeMode = artforgeModeMap[type.id] || artforgeInitialMode;
    setArtforgeInitialMode(newArtforgeMode);
    setSelectedTypeId(type.id);
    setMode(type.mode);
    setPublishForm((c) => ({ ...c, title: `${type.label} draft` }));
  };

  const goNext = () => {
    const nextMode = { upload: "editor", editor: "assets", artforge: "assets", assets: "publish", publish: "publish" }[activeMode] || "assets";
    setMode(nextMode);
  };

  return (
    <div className="relative rounded-2xl border border-[#1a3a60]/60 bg-[#030812] text-[#e8f4ff] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,120,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 grid gap-3 p-3 lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[220px_minmax(0,1fr)_260px] items-start">
        {/* Sidebar */}
        <ProductionSidebar
          selectedTypeId={selectedTypeId}
          onSelectType={selectProjectType}
          activeStage={activeStage}
          setActiveStage={setActiveStage}
        />

        {/* Main workspace */}
        <main className="min-w-0 space-y-2 overflow-x-hidden">
          <Panel>
            <ModeTabs
              activeMode={activeMode}
              setMode={setMode}
              artforgeTab={artforgeTab}
              setArtforgeTab={setArtforgeTab}
            />
            <div className="p-3">
              <ProductionWorkspace
                activeMode={activeMode}
                selectedType={selectedType}
                displayAssets={displayAssets}
                assetFilter={assetFilter}
                setAssetFilter={setAssetFilter}
                bucketCounts={bucketCounts}
                selectedAssetId={selectedAssetId}
                setSelectedAssetId={setSelectedAssetId}
                publishForm={publishForm}
                setPublishForm={setPublishForm}
                artforgeInitialMode={artforgeInitialMode}
                artforgeTab={artforgeTab}
                setArtforgeTab={setArtforgeTab}
              />
            </div>
          </Panel>
        </main>

        {/* Right rail */}
        <ProductionRightRail
          selectedType={selectedType}
          activeStage={activeStage}
          activeMode={activeModeMeta}
          assetCount={mediaAssets.length}
          displayAssets={displayAssets}
          selectedAssetId={selectedAssetId}
          setSelectedAssetId={setSelectedAssetId}
          queue={queue}
          readiness={readiness}
          readinessScore={readinessScore}
          canPublish={canPublish}
          draftSaved={draftSaved}
          onSaveDraft={() => {
            localStorage.setItem("vstream_production_draft", JSON.stringify({ selectedTypeId, activeStage, activeMode, selectedAssetId, publishForm, savedAt: new Date().toISOString() }));
            setDraftSaved(true);
            window.setTimeout(() => setDraftSaved(false), 1600);
          }}
        />
      </div>
    </div>
  );
}

function modeStage(modeId) {
  return modes.find((m) => m.id === modeId)?.stage || "Create";
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

function ProductionSidebar({ selectedTypeId, onSelectType, activeStage, setActiveStage }) {
  return (
    <aside className="space-y-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-0.5">
      {/* Project Types */}
      <Panel>
        <div className="border-b border-[#1a3a60]/50 px-3 py-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#00c8ff]">New Project</p>
          <h2 className="mt-0.5 text-sm font-black text-white">What are you making?</h2>
        </div>
        <div className="p-1.5 space-y-1">
          {projectTypeGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
                <div className={cx("h-1.5 w-1.5 rounded-full bg-gradient-to-br shrink-0", group.color)} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: group.accent }}>{group.label}</span>
              </div>
              <div className="space-y-px">
                {group.types.map((type) => {
                  const Icon = type.icon;
                  const active = selectedTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => onSelectType(type)}
                      className={cx(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all",
                        active
                          ? "bg-[#1e78ff]/15 border border-[#1e78ff]/35 text-white"
                          : "border border-transparent text-blue-100/50 hover:bg-[#0d1f38]/60 hover:text-white"
                      )}
                    >
                      <span className={cx(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-md transition-all",
                        active ? `bg-gradient-to-br ${group.color} text-white` : "bg-[#0d1f38] text-blue-300/50"
                      )}>
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-black leading-tight">{type.label}</span>
                        <span className="block truncate text-[9px] text-blue-100/35 leading-tight">{type.format}</span>
                      </span>
                      {active && <ChevronRight className="h-2.5 w-2.5 shrink-0 text-[#00c8ff]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Workflow stages */}
      <Panel>
        <div className="border-b border-[#1a3a60]/50 px-3 py-2">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#00c8ff]">Workflow</p>
        </div>
        <div className="p-1.5 space-y-px">
          {workflowStages.map((stage, index) => {
            const active = activeStage === stage;
            const past = workflowStages.indexOf(activeStage) > index;
            return (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={cx(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all",
                  active ? "bg-[#00c8ff]/12 border border-[#00c8ff]/30 text-white" : "border border-transparent hover:bg-[#0d1f38]/60 text-blue-100/50 hover:text-white"
                )}
              >
                <span className={cx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black",
                  active ? "bg-[#00c8ff] text-[#020712]" : past ? "bg-emerald-500/20 text-emerald-300" : "bg-[#0d1f38] text-blue-100/40"
                )}>
                  {past ? <CheckCircle className="h-3 w-3" /> : index + 1}
                </span>
                <span className={cx("text-xs font-black", active ? "text-white" : "")}>{stage}</span>
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00c8ff] animate-pulse" />}
              </button>
            );
          })}
        </div>
      </Panel>
    </aside>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function ProductionHeader({ selectedType, activeStage, activeMode, onNext, readinessScore }) {
  const Icon = selectedType.icon;
  const group = projectTypeGroups.find((g) => g.types.some((t) => t.id === selectedType.id));
  const stageIndex = workflowStages.indexOf(activeStage);

  return (
    <Panel>
      <div className="flex items-center gap-3 p-3">
        <div className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", group?.color || "from-blue-500 to-violet-500")}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-black text-white truncate">{selectedType.label}</h1>
            <span className="rounded-full border border-[#1a3a60]/60 bg-[#0d1f38]/80 px-2 py-0.5 text-[9px] font-black text-blue-200/50">{selectedType.format}</span>
          </div>
          <div className="mt-1 flex items-center gap-0.5 overflow-x-auto">
            {selectedType.path.map((step, i) => (
              <span key={step} className="flex items-center gap-0.5 shrink-0">
                <span className={cx(
                  "rounded px-1.5 py-0.5 text-[9px] font-black",
                  i === stageIndex ? "bg-[#00c8ff]/20 text-[#00c8ff]" : i < stageIndex ? "text-emerald-400/70" : "text-blue-200/25"
                )}>{step}</span>
                {i < selectedType.path.length - 1 && <ArrowRight className="h-2 w-2 text-blue-200/15 shrink-0" />}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1a3a60]/50 bg-[#03080f]/60 px-2.5 py-1.5">
            <div className="flex gap-0.5">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className={cx("h-1 w-3 rounded-full transition-all", i < readinessScore ? "bg-emerald-400" : "bg-[#1a3a60]")} />
              ))}
            </div>
            <span className="text-[10px] font-black text-blue-200/40">{readinessScore}/5</span>
          </div>
          <button onClick={onNext} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e78ff] px-3 py-2 text-xs font-black text-white transition hover:bg-[#3d8fff] active:scale-95">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Panel>
  );
}

// ─── Mode Tabs ───────────────────────────────────────────────────────────────

const artforgeTabs = [
  { id: "generate", label: "Generate", icon: WandSparkles },
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
  { id: "canvas", label: "Canvas", icon: Layers2 },
  { id: "workflow", label: "Workflow", icon: Zap },
  { id: "history", label: "History", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

function ModeTabs({ activeMode, setMode, artforgeTab, setArtforgeTab }) {
  // When in artforge mode, show artforge's sub-tabs merged into this bar
  if (activeMode === "artforge") {
    return (
      <div className="border-b border-[#1a3a60]/50 px-2.5 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {/* Back button to exit artforge */}
          <button
            onClick={() => setMode("upload")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1a3a60]/40 px-2 py-1.5 text-xs font-black text-blue-100/40 hover:text-white hover:bg-[#0d1f38]/50 transition-all mr-1"
          >
            <ChevronRight className="h-3 w-3 rotate-180" />
          </button>
          <div className="h-4 w-px bg-[#1a3a60]/60 self-center mr-1" />
          {artforgeTabs.map(({ id, label, icon: Icon }) => {
            const active = artforgeTab === id;
            return (
              <button
                key={id}
                onClick={() => setArtforgeTab(id)}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-black transition-all",
                  active
                    ? "border-[#a855f7]/50 bg-[#a855f7]/15 text-white"
                    : "border-transparent text-blue-100/45 hover:border-[#1a3a60]/60 hover:text-white hover:bg-[#0d1f38]/50"
                )}
              >
                <Icon className={cx("h-3.5 w-3.5", active ? "text-[#a855f7]" : "")} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-[#1a3a60]/50 px-2.5 py-2">
      <div className="flex gap-1 overflow-x-auto">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const active = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              className={cx(
                "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-black transition-all",
                active
                  ? "border-[#00c8ff]/50 bg-gradient-to-r from-[#00c8ff]/15 to-[#1e78ff]/10 text-white shadow-sm"
                  : "border-transparent text-blue-100/45 hover:border-[#1a3a60]/60 hover:text-white hover:bg-[#0d1f38]/50"
              )}
            >
              <Icon className={cx("h-3.5 w-3.5", active ? "text-[#00c8ff]" : "")} />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Workspace ───────────────────────────────────────────────────────────────

function ProductionWorkspace(props) {
  const { activeMode, selectedType, displayAssets, assetFilter, setAssetFilter, bucketCounts, selectedAssetId, setSelectedAssetId, publishForm, setPublishForm, artforgeInitialMode, artforgeTab, setArtforgeTab } = props;

  if (activeMode === "upload") return <VideoUpload />;
  if (activeMode === "editor") return (
    <div className="space-y-4">
      <VideoEditor />
      <div className="grid gap-4 xl:grid-cols-2">
        <IntroOutroMaker />
        <MusicEditor />
      </div>
    </div>
  );
  if (activeMode === "artforge") return <ArtForgeStudio embedded hideModePicker initialMode={artforgeInitialMode} externalTab={artforgeTab} onTabChange={setArtforgeTab} />;
  if (activeMode === "assets") return (
    <AssetLibraryPanel
      assets={displayAssets}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
      bucketCounts={bucketCounts}
      selectedAssetId={selectedAssetId}
      setSelectedAssetId={setSelectedAssetId}
    />
  );
  return <PublishPackageForm publishForm={publishForm} setPublishForm={setPublishForm} selectedAsset={displayAssets.find((a) => a.id === selectedAssetId)} />;
}

function ToolFrame({ title, subtitle, compact = false, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1a3a60]/50 bg-[#030e1f]/60">
      <div className="border-b border-[#1a3a60]/50 px-4 py-3">
        <h3 className="font-black text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-blue-100/45">{subtitle}</p>}
      </div>
      <div className={cx("min-w-0", compact ? "max-h-[520px] overflow-y-auto" : "")}>{children}</div>
    </div>
  );
}

// ─── Asset Library ───────────────────────────────────────────────────────────

function AssetLibraryPanel({ assets, assetFilter, setAssetFilter, bucketCounts, selectedAssetId, setSelectedAssetId }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00c8ff]">Asset Library</p>
          <h2 className="text-lg font-black text-white">Your production files</h2>
        </div>
        <Library className="h-5 w-5 text-[#00c8ff]/60" />
      </div>

      {/* Bucket pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {assetBuckets.map((bucket) => (
          <button
            key={bucket}
            onClick={() => setAssetFilter(bucket)}
            className={cx(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-black capitalize transition-all",
              assetFilter === bucket
                ? "border-[#00c8ff]/50 bg-[#00c8ff]/15 text-white"
                : "border-[#1a3a60]/50 bg-[#030e1f]/60 text-blue-100/45 hover:border-[#1a3a60] hover:text-white"
            )}
          >
            {bucket}
            <span className="ml-1.5 text-blue-200/35">{bucketCounts[bucket] || 0}</span>
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => {
          const isDemo = asset.category === "demo" || asset.id?.toString().startsWith("demo");
          const selected = selectedAssetId === asset.id;
          return (
            <button
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              className={cx(
                "group relative overflow-hidden rounded-2xl border text-left transition-all",
                selected
                  ? "border-[#00c8ff]/60 bg-[#00c8ff]/10 shadow-lg shadow-cyan-950/30"
                  : "border-[#1a3a60]/50 bg-[#030e1f]/80 hover:border-[#1e78ff]/50 hover:bg-[#0d1f38]/80"
              )}
            >
              <div className="grid h-24 place-items-center bg-gradient-to-br from-[#0a1b35] to-[#170a2e]">
                <ImageIcon className="h-7 w-7 text-[#1e78ff]/40" />
              </div>
              {isDemo && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 text-[9px] font-black text-amber-300">Demo</span>
              )}
              {selected && (
                <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#00c8ff]">
                  <CheckCircle2 className="h-3 w-3 text-[#020712]" />
                </span>
              )}
              <div className="p-2.5">
                <p className="truncate text-xs font-black text-white">{asset.name || asset.title || "Untitled"}</p>
                <p className="mt-0.5 text-[10px] text-blue-100/40 capitalize">{asset.type || asset.asset_type || "asset"}</p>
                {selected && <p className="mt-1 text-[10px] font-black text-[#00c8ff]">✓ Selected</p>}
              </div>
            </button>
          );
        })}
      </div>

      {!assets.length && (
        <div className="rounded-2xl border border-dashed border-[#1a3a60]/50 bg-[#030e1f]/40 p-10 text-center">
          <Library className="mx-auto mb-3 h-10 w-10 text-blue-200/15" />
          <p className="font-black text-blue-200/40">No assets yet</p>
          <p className="mt-1 text-xs text-blue-200/25">Upload a video, generate with ArtForge, or save a draft.</p>
        </div>
      )}
    </div>
  );
}

// ─── Publish Form ─────────────────────────────────────────────────────────────

function PublishPackageForm({ publishForm, setPublishForm, selectedAsset }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00c8ff]">Publishing</p>
        <h3 className="text-lg font-black text-white">Package your production</h3>
        {selectedAsset
          ? <p className="mt-1 text-sm text-emerald-300/80">Asset: {selectedAsset.name || selectedAsset.title}</p>
          : <p className="mt-1 text-sm text-amber-300/70">⚠ Choose an asset from Assets before publishing.</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[["title", "Title"], ["description", "Description"], ["category", "Category"], ["tags", "Tags (comma separated)"], ["thumbnail", "Thumbnail URL"], ["scheduled", "Scheduled publish"]].map(([key, label]) => (
          <label key={key} className={key === "description" ? "lg:col-span-2" : ""}>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-blue-100/45">{label}</span>
            {key === "description" ? (
              <textarea value={publishForm[key]} onChange={(e) => setPublishForm((c) => ({ ...c, [key]: e.target.value }))} rows={3}
                className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00c8ff] transition" />
            ) : (
              <input value={publishForm[key]} onChange={(e) => setPublishForm((c) => ({ ...c, [key]: e.target.value }))}
                className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00c8ff] transition" />
            )}
          </label>
        ))}
        <label>
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-blue-100/45">Visibility</span>
          <select value={publishForm.visibility} onChange={(e) => setPublishForm((c) => ({ ...c, visibility: e.target.value }))}
            className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00c8ff] transition">
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
    </div>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────

function ProductionRightRail(props) {
  const { selectedType, activeStage, activeMode, assetCount, displayAssets, selectedAssetId, setSelectedAssetId, queue, readiness, readinessScore, canPublish, draftSaved, onSaveDraft } = props;
  const group = projectTypeGroups.find((g) => g.types.some((t) => t.id === selectedType.id));

  return (
    <aside className="space-y-2 lg:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-20 2xl:max-h-[calc(100vh-5rem)] 2xl:overflow-y-auto">
      {/* Project card */}
      <Panel>
        <div className={cx("rounded-t-2xl px-3 py-2.5", group?.color ? `bg-gradient-to-r ${group.color}` : "bg-gradient-to-r from-blue-600 to-violet-600")}>
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/20 text-white">
              <selectedType.icon style={{ width: 15, height: 15 }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">{selectedType.label}</h3>
              <p className="text-[10px] text-white/65">{selectedType.format}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-2.5">
          <StatCell icon={BadgeCheck} label="Stage" value={activeStage} color="text-[#00c8ff]" />
          <StatCell icon={activeMode.icon} label="Mode" value={activeMode.label} color="text-[#a855f7]" />
          <StatCell icon={Library} label="Assets" value={String(assetCount)} color="text-emerald-400" />
          <StatCell icon={Clock} label="Queue" value={String(queue.length)} color="text-amber-400" />
        </div>
      </Panel>

      {/* AI Assistant */}
      <VStreamAIAssistant
        surface="compact"
        contextType="production"
        context={{
          projectType: selectedType.label,
          stage: activeStage,
          mode: activeMode.label,
          assets: assetCount,
          queue: queue.length,
          actions: ["Next step", "Title ideas", "Thumbnail concept", "Publish checklist"],
        }}
      />

      {/* Package asset */}
      <Panel>
        <div className="flex items-center gap-2 border-b border-[#1a3a60]/50 px-3 py-2">
          <Library className="h-3.5 w-3.5 text-[#00c8ff]" />
          <h3 className="font-black text-white text-xs">Package Asset</h3>
        </div>
        <div className="p-2 space-y-1">
          {displayAssets.slice(0, 4).map((asset) => {
            const selected = selectedAssetId === asset.id;
            return (
              <button key={asset.id} onClick={() => setSelectedAssetId(asset.id)}
                className={cx(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs transition-all",
                  selected ? "border-[#00c8ff]/50 bg-[#00c8ff]/10 text-white" : "border-[#1a3a60]/50 bg-[#030e1f]/60 text-blue-100/50 hover:text-white hover:border-[#1a3a60]"
                )}>
                <span className="block truncate font-black">{asset.name || asset.title || "Untitled"}</span>
                <span className="text-[10px] text-blue-100/35 capitalize">{asset.type || asset.asset_type || "asset"}</span>
              </button>
            );
          })}
          {!displayAssets.length && (
            <p className="rounded-xl border border-dashed border-[#1a3a60]/40 p-3 text-center text-xs text-blue-100/35">No assets yet</p>
          )}
        </div>
      </Panel>

      {/* Publish readiness */}
      <Panel>
        <div className="flex items-center justify-between border-b border-[#1a3a60]/50 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5 text-[#00c8ff]" />
            <h3 className="font-black text-white text-xs">Readiness</h3>
          </div>
          <span className={cx(
            "rounded-full px-1.5 py-0.5 text-[9px] font-black",
            readinessScore === 5 ? "bg-emerald-500/20 text-emerald-300" : "bg-[#1a3a60]/50 text-blue-200/40"
          )}>
            {readinessScore}/5
          </span>
        </div>
        <div className="mx-3 mt-2 h-1 overflow-hidden rounded-full bg-[#1a3a60]/50">
          <div className="h-full rounded-full bg-gradient-to-r from-[#00c8ff] to-emerald-400 transition-all duration-500"
            style={{ width: `${(readinessScore / 5) * 100}%` }} />
        </div>
        <div className="p-2 space-y-1">
          {readiness.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-lg border border-[#1a3a60]/40 bg-[#030e1f]/60 px-2.5 py-1.5">
              {item.done
                ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                : <Circle className="h-3 w-3 shrink-0 text-blue-900/80" />}
              <span className={cx("text-[11px]", item.done ? "text-blue-50" : "text-blue-100/40")}>{item.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Render queue */}
      {queue.length > 0 && (
        <Panel>
          <div className="flex items-center gap-2 border-b border-[#1a3a60]/50 px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 text-[#a855f7] animate-spin" />
            <h3 className="font-black text-white text-xs">Render Queue</h3>
            <span className="ml-auto rounded-full bg-[#a855f7]/20 px-1.5 py-0.5 text-[9px] font-black text-purple-300">{queue.length}</span>
          </div>
          <div className="p-2 space-y-1.5">
            {queue.map((job) => (
              <div key={job.id} className="rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-2.5">
                <p className="line-clamp-1 text-xs font-black text-white">{job.title}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#1a3a60]/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#1e78ff] animate-pulse" style={{ width: `${job.progress || 30}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-blue-100/35 capitalize">{job.status || "queued"} · {job.progress || 0}%</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Actions */}
      <div className="grid gap-1.5">
        <button onClick={onSaveDraft}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f]/80 px-3 py-2.5 text-xs font-black text-blue-200 transition hover:border-[#00c8ff]/40 hover:text-white">
          <Save className="h-3.5 w-3.5" />
          {draftSaved ? "Draft saved ✓" : "Save draft"}
        </button>
        <button
          disabled={!canPublish}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition",
            canPublish
              ? "bg-gradient-to-r from-[#1e78ff] to-[#00a6ff] text-white hover:opacity-90 active:scale-95"
              : "cursor-not-allowed border border-[#1a3a60]/40 bg-[#030e1f]/60 text-blue-100/30"
          )}
        >
          <Send className="h-3.5 w-3.5" />
          {canPublish ? "Publish Now" : "Publish Locked"}
        </button>
      </div>
    </aside>
  );
}

function StatCell({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-[#1a3a60]/40 bg-[#030e1f]/60 p-2">
      <Icon className={cx("mb-1 h-3 w-3", color)} />
      <p className="text-[8px] font-black uppercase tracking-widest text-blue-100/30">{label}</p>
      <p className="mt-0.5 truncate text-[11px] font-black text-white">{value}</p>
    </div>
  );
}