import { useMemo, useState } from "react";
import { useCreatorOS } from "@/lib/CreatorOSContext";
import {
  BadgeCheck,
  Box,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Clock,
  Hand,
  Image,
  ImageIcon,
  Layers,
  Library,
  ListChecks,
  Music,
  PackageCheck,
  Palette,
  PenTool,
  Radio,
  Save,
  Send,
  Smile,
  Upload,
  Video,
  WandSparkles,
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

const projectTypes = [
  { id: "upload-video", label: "Upload Video", icon: Upload, format: "Long-form video", mode: "upload", path: ["Upload", "Editor", "Thumbnail", "Metadata", "Publish"] },
  { id: "edit-video", label: "Edit Video", icon: Video, format: "Video edit", mode: "editor", path: ["Select asset", "Timeline", "Audio", "Review", "Publish"] },
  { id: "generate-image", label: "Generate Image", icon: WandSparkles, format: "Image asset", mode: "artforge", path: ["Prompt", "Canvas", "Variants", "Save asset", "Use"] },
  { id: "make-thumbnail", label: "Make Thumbnail", icon: Image, format: "Thumbnail", mode: "artforge", path: ["Prompt", "Generate", "Preview", "Attach"] },
  { id: "create-short", label: "Create Short/Reel", icon: Clapperboard, format: "Vertical short", mode: "editor", path: ["Script", "Scenes", "Timeline", "Render", "Publish"] },
  { id: "make-sticker", label: "Make Sticker", icon: Smile, format: "Sticker pack", mode: "artforge", path: ["Prompt", "Transparent art", "Variants", "Save"] },
  { id: "make-comic", label: "Make Comic", icon: Layers, format: "Comic strip", mode: "artforge", path: ["Story beats", "Panels", "Captions", "Export"] },
  { id: "build-2d", label: "Build 2D Model", icon: Palette, format: "2D model", mode: "artforge", path: ["Character", "Sprite states", "Preview", "Save"] },
  { id: "build-3d", label: "Build 3D Model", icon: Box, format: "3D model", mode: "artforge", path: ["Prompt/reference", "3D checklist", "Preview", "Save"] },
  { id: "trace-pose", label: "Trace / Pose Guide", icon: PenTool, format: "Reference guide", mode: "artforge", path: ["Upload image", "Trace style", "Generate", "Save"] },
  { id: "hand-helper", label: "Hand Helper", icon: Hand, format: "Hand reference", mode: "artforge", path: ["Pose", "View", "Generate", "Save"] },
  { id: "intro-outro", label: "Intro / Outro", icon: Radio, format: "Motion bumper", mode: "editor", path: ["Template", "Brand copy", "Preview", "Export"] },
  { id: "music-audio", label: "Music / Audio", icon: Music, format: "Audio bed", mode: "editor", path: ["Upload music", "Mix", "Preview", "Export"] },
  { id: "publish-package", label: "Publish Package", icon: PackageCheck, format: "Publish bundle", mode: "publish", path: ["Metadata", "Thumbnail", "Checklist", "Schedule", "Publish"] },
];

const demoAssets = [
  { id: "demo-blue-room", name: "Blue Room Radio bumper", asset_type: "audio", category: "demo", type: "audio" },
  { id: "demo-artforge", name: "ArtForge Circle thumbnail", asset_type: "thumbnail", category: "demo", type: "image" },
  { id: "demo-neon-city", name: "Neon City Finals draft", asset_type: "video draft", category: "demo", type: "video" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Panel({ children, className = "" }) {
  return <section className={cx("rounded-2xl border border-[#12305f]/75 bg-[#06101f]/82 shadow-2xl shadow-black/20 backdrop-blur", className)}>{children}</section>;
}

export default function ProductionHub() {
  const { user } = useAuth();
  const [selectedTypeId, setSelectedTypeId] = useState("upload-video");
  const selectedType = projectTypes.find((type) => type.id === selectedTypeId) || projectTypes[0];
  const [activeMode, setActiveMode] = useState(selectedType.mode);
  const [activeStage, setActiveStage] = useState(modeStage(selectedType.mode));
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
  const selectedAsset = displayAssets.find((asset) => asset.id === selectedAssetId) || null;

  const queue = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("artforge_jobs") || "[]").slice(0, 4);
    } catch {
      return [];
    }
  }, [activeMode, draftSaved]);

  const bucketCounts = useMemo(() => {
    const counts = Object.fromEntries(assetBuckets.map((bucket) => [bucket, 0]));
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

  const activeModeMeta = modes.find((mode) => mode.id === activeMode) || modes[0];
  const readiness = [
    { label: "Project type selected", done: Boolean(selectedType) },
    { label: "Asset selected for package", done: Boolean(selectedAsset) },
    { label: "Thumbnail chosen", done: Boolean(publishForm.thumbnail || selectedAsset?.asset_type?.includes("thumbnail")) },
    { label: "Title ready", done: publishForm.title.trim().length > 3 },
    { label: "Visibility chosen", done: Boolean(publishForm.visibility) },
  ];
  const canPublish = readiness.every((item) => item.done);

  const setMode = (modeId) => {
    setActiveMode(modeId);
    setActiveStage(modeStage(modeId));
  };

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

  const selectProjectType = (type) => {
    const newArtforgeMode = artforgeModeMap[type.id] || artforgeInitialMode;
    setArtforgeInitialMode(newArtforgeMode);
    setSelectedTypeId(type.id);
    setMode(type.mode);
    setPublishForm((current) => ({ ...current, title: `${type.label} draft` }));
  };

  const goNext = () => {
    const nextMode = {
      upload: "editor",
      editor: "assets",
      artforge: "assets",
      assets: "publish",
      publish: "publish",
    }[activeMode] || "assets";
    setMode(nextMode);
  };

  return (
    <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-3xl border border-[#12305f]/70 bg-[#03080f] text-[#e8f4ff]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,120,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.07)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(30,120,255,0.20),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(168,85,247,0.18),transparent_32%)]" />

      <div className="relative z-10 grid gap-4 p-3 lg:grid-cols-[280px_minmax(0,1fr)] xl:p-4 2xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <ProductionSidebar selectedTypeId={selectedTypeId} onSelectType={selectProjectType} activeStage={activeStage} setActiveStage={setActiveStage} />

        <main className="min-w-0">
          <Panel className="flex min-h-[calc(100vh-9rem)] min-w-0 flex-col overflow-hidden">
            <ProductionHeader selectedType={selectedType} activeStage={activeStage} activeMode={activeModeMeta} onNext={goNext} />
            <ModeTabs activeMode={activeMode} setMode={setMode} />
            <div className="min-h-0 flex-1 overflow-y-auto p-3 lg:p-4">
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
              />
            </div>
          </Panel>
        </main>

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
  return modes.find((mode) => mode.id === modeId)?.stage || "Create";
}

function ProductionSidebar({ selectedTypeId, onSelectType, activeStage, setActiveStage }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <Panel className="p-3">
        <div className="mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#00c8ff]">Create Project</p>
          <h2 className="text-lg font-black text-white">Choose what to make</h2>
        </div>
        <div className="space-y-2">
          {projectTypes.map((type) => {
            const Icon = type.icon;
            const active = selectedTypeId === type.id;
            return (
              <button key={type.id} onClick={() => onSelectType(type)} className={cx("flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition", active ? "border-[#00c8ff] bg-[#00c8ff]/14 text-white" : "border-[#12305f] bg-[#03080f]/45 text-blue-100/65 hover:border-[#1e78ff]/60 hover:text-white")}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-white"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">{type.label}</span>
                  <span className="block truncate text-[11px] text-blue-100/42">{type.format}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-3">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-[#00c8ff]">Workflow</p>
        <div className="space-y-2">
          {workflowStages.map((stage, index) => {
            const active = activeStage === stage;
            return (
              <button key={stage} onClick={() => setActiveStage(stage)} className={cx("flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition", active ? "border-[#00c8ff] bg-[#00c8ff]/14" : "border-[#12305f] bg-[#03080f]/45 hover:text-white")}>
                <span className={cx("grid h-7 w-7 place-items-center rounded-full text-xs font-black", active ? "bg-[#00c8ff] text-[#020712]" : "bg-[#102344] text-blue-100/58")}>{index + 1}</span>
                <span className="text-sm font-black text-white">{stage}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </aside>
  );
}

function ProductionHeader({ selectedType, activeStage, activeMode, onNext }) {
  const Icon = selectedType.icon;
  return (
    <div className="border-b border-[#12305f]/70 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#00c8ff]">Unified VStream Production</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-white"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-white">{selectedType.label}</h1>
              <p className="truncate text-sm text-blue-100/50">{selectedType.path.join(" -> ")}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#00c8ff]/25 bg-[#00c8ff]/10 px-3 py-1.5 text-xs font-black text-[#00c8ff]">{activeStage}</span>
          <span className="rounded-full border border-[#a855f7]/25 bg-[#a855f7]/10 px-3 py-1.5 text-xs font-black text-purple-100">{activeMode.label}</span>
          <button onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#00a6ff]">
            Next step
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeTabs({ activeMode, setMode }) {
  return (
    <div className="border-b border-[#12305f]/70 px-3 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const active = activeMode === mode.id;
          return (
            <button key={mode.id} onClick={() => setMode(mode.id)} className={cx("flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition", active ? "border-[#00c8ff] bg-[#00c8ff]/15 text-white" : "border-[#12305f] bg-[#03080f]/55 text-blue-100/58 hover:text-white")}>
              <Icon className="h-4 w-4" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductionWorkspace(props) {
  const { activeMode, selectedType, displayAssets, assetFilter, setAssetFilter, bucketCounts, selectedAssetId, setSelectedAssetId, publishForm, setPublishForm, artforgeInitialMode } = props;

  if (activeMode === "upload") return <ToolFrame title="Upload source video" subtitle="Upload connects directly to Editor as the next step."><VideoUpload /></ToolFrame>;
  if (activeMode === "editor") {
    return (
      <div className="space-y-4">
        <ToolFrame title="Video editor" subtitle="Cut, review, and prepare assets for packaging."><VideoEditor /></ToolFrame>
        <div className="grid gap-4 xl:grid-cols-2">
          <ToolFrame title="Intro / Outro" compact><IntroOutroMaker /></ToolFrame>
          <ToolFrame title="Music / Audio" compact><MusicEditor /></ToolFrame>
        </div>
      </div>
    );
  }
  if (activeMode === "artforge") return <ArtForgeStudio embedded initialMode={artforgeInitialMode} />;
  if (activeMode === "assets") return <AssetLibraryPanel assets={displayAssets} assetFilter={assetFilter} setAssetFilter={setAssetFilter} bucketCounts={bucketCounts} selectedAssetId={selectedAssetId} setSelectedAssetId={setSelectedAssetId} />;
  return <PublishPackageForm publishForm={publishForm} setPublishForm={setPublishForm} selectedAsset={displayAssets.find((asset) => asset.id === selectedAssetId)} />;
}

function ToolFrame({ title, subtitle, compact = false, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#12305f] bg-[#03080f]/72">
      <div className="border-b border-[#12305f]/70 px-4 py-3">
        <h3 className="text-lg font-black text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-blue-100/50">{subtitle}</p>}
      </div>
      <div className={cx("min-w-0 overflow-y-auto", compact ? "max-h-[520px]" : "max-h-none xl:max-h-[calc(100vh-21rem)]")}>{children}</div>
    </div>
  );
}


function AssetLibraryPanel({ assets, assetFilter, setAssetFilter, bucketCounts, selectedAssetId, setSelectedAssetId }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00c8ff]">Unified Asset Library</p>
          <h2 className="text-xl font-black text-white">Videos, images, thumbnails, audio, models, drafts</h2>
        </div>
        <Library className="h-5 w-5 text-[#00c8ff]" />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {assetBuckets.map((bucket) => (
          <button key={bucket} onClick={() => setAssetFilter(bucket)} className={cx("shrink-0 rounded-full border px-3 py-1.5 text-xs font-black capitalize", assetFilter === bucket ? "border-[#00c8ff] bg-[#00c8ff]/14 text-white" : "border-[#12305f] bg-[#06101f] text-blue-100/58")}>
            {bucket} <span className="text-blue-200/40">{bucketCounts[bucket] || 0}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => {
          const isDemo = asset.category === 'demo' || asset.id?.toString().startsWith('demo');
          const selected = selectedAssetId === asset.id;
            return (
              <button key={asset.id} onClick={() => setSelectedAssetId(asset.id)} className={cx("relative rounded-2xl border p-3 text-left transition", selected ? "border-[#00c8ff] bg-[#00c8ff]/12" : "border-[#12305f] bg-[#06101f]/70 hover:border-[#1e78ff]/60")}>
              <div className="mb-3 grid h-28 place-items-center rounded-xl bg-gradient-to-br from-[#0a1b35] to-[#170a2e] text-[#00c8ff]"><ImageIcon className="h-7 w-7" /></div>
                  {isDemo && <div className="absolute right-3 top-3 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Demo</div>}
              <p className="truncate text-sm font-black text-white">{asset.name || asset.title || "Untitled asset"}</p>
              <p className="mt-1 text-xs text-blue-100/45">{asset.type || asset.asset_type || asset.category || "asset"}</p>
              {selected && <p className="mt-2 text-xs font-black text-[#00c8ff]">Selected for publish</p>}
            </button>
          );
        })}
      </div>
      {!assets.length && (
        <div className="rounded-2xl border border-dashed border-[#12305f] bg-[#03080f]/55 p-6 text-center">
          <p className="text-sm font-black text-white">No assets yet</p>
          <p className="mt-2 text-xs text-blue-100/50">Upload a video, generate with ArtForge, or save a draft to populate the production library.</p>
        </div>
      )}
    </div>
  );
}

function PublishPackageForm({ publishForm, setPublishForm, selectedAsset }) {
  const fields = [
    ["title", "Title"],
    ["description", "Description"],
    ["category", "Category"],
    ["tags", "Tags"],
    ["thumbnail", "Thumbnail"],
    ["scheduled", "Scheduled publish"],
  ];
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00c8ff]">Publishing Flow</p>
        <h3 className="text-xl font-black text-white">Package your production</h3>
        <p className="mt-1 text-sm text-blue-100/50">{selectedAsset ? `Selected asset: ${selectedAsset.name || selectedAsset.title}` : "Choose an asset from Assets before publishing."}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className={key === "description" ? "lg:col-span-2" : ""}>
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-100/50">{label}</span>
            {key === "description" ? (
              <textarea value={publishForm[key]} onChange={(event) => setPublishForm((current) => ({ ...current, [key]: event.target.value }))} rows={4} className="w-full rounded-xl border border-[#12305f] bg-[#06101f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]" />
            ) : (
              <input value={publishForm[key]} onChange={(event) => setPublishForm((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-xl border border-[#12305f] bg-[#06101f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]" />
            )}
          </label>
        ))}
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-100/50">Visibility</span>
          <select value={publishForm.visibility} onChange={(event) => setPublishForm((current) => ({ ...current, visibility: event.target.value }))} className="w-full rounded-xl border border-[#12305f] bg-[#06101f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]">
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function ProductionRightRail(props) {
  const { selectedType, activeStage, activeMode, assetCount, displayAssets, selectedAssetId, setSelectedAssetId, queue, readiness, canPublish, draftSaved, onSaveDraft } = props;
  return (
    <aside className="space-y-4 lg:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-20 2xl:max-h-[calc(100vh-6rem)] 2xl:overflow-y-auto">
      <Panel className="p-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00c8ff]">Current Project</p>
        <h3 className="mt-2 text-xl font-black text-white">{selectedType.label}</h3>
        <p className="mt-1 text-sm text-blue-100/55">{selectedType.format}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <InfoPill label="Stage" value={activeStage} icon={BadgeCheck} />
          <InfoPill label="Mode" value={activeMode.label} icon={activeMode.icon} />
          <InfoPill label="Assets" value={String(assetCount)} icon={Library} />
          <InfoPill label="Queue" value={String(queue.length)} icon={Clock} />
        </div>
      </Panel>

      <VStreamAIAssistant
        surface="compact"
        contextType="production"
        context={{
          projectType: selectedType.label,
          stage: activeStage,
          mode: activeMode.label,
          assets: assetCount,
          queue: queue.length,
          actions: ["Next production step", "Title ideas", "Thumbnail concept", "Publish checklist"],
        }}
      />

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Library className="h-4 w-4 text-[#00c8ff]" />
          <h3 className="font-black text-white">Package asset</h3>
        </div>
        <div className="space-y-2">
          {displayAssets.slice(0, 4).map((asset) => {
            const selected = selectedAssetId === asset.id;
            return (
              <button key={asset.id} onClick={() => setSelectedAssetId(asset.id)} className={cx("w-full rounded-xl border px-3 py-2 text-left text-xs transition", selected ? "border-[#00c8ff] bg-[#00c8ff]/12 text-white" : "border-[#12305f] bg-[#03080f]/55 text-blue-100/55 hover:text-white")}>
                <span className="block truncate font-black">{asset.name || asset.title || "Untitled asset"}</span>
                <span className="text-blue-100/38">{asset.type || asset.asset_type || "asset"}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[#00c8ff]" />
          <h3 className="font-black text-white">Publish readiness</h3>
        </div>
        <div className="space-y-2">
          {readiness.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f]/55 px-3 py-2 text-sm">
              <CheckCircle2 className={cx("h-4 w-4", item.done ? "text-emerald-300" : "text-blue-900")} />
              <span className={item.done ? "text-blue-50" : "text-blue-100/42"}>{item.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#00c8ff]" />
          <h3 className="font-black text-white">Render queue</h3>
        </div>
        <div className="space-y-2">
          {queue.map((job) => (
            <div key={job.id} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3">
              <p className="line-clamp-1 text-xs font-black text-white">{job.title}</p>
              <p className="mt-1 text-[11px] text-blue-100/42">{job.status || "queued"} - {job.progress || 0}%</p>
            </div>
          ))}
          {!queue.length && <p className="rounded-xl border border-dashed border-[#12305f] p-4 text-center text-xs text-blue-100/42">No renders queued yet.</p>}
        </div>
      </Panel>

      <div className="grid gap-2">
        <button onClick={onSaveDraft} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00c8ff]/30 bg-[#00c8ff]/10 px-4 py-3 text-sm font-black text-[#00c8ff] transition hover:bg-[#00c8ff]/16">
          <Save className="h-4 w-4" />
          {draftSaved ? "Draft saved" : "Save draft"}
        </button>
        <button disabled={!canPublish} title={canPublish ? "Publish package" : "Complete the publish checklist first"} className={cx("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition", canPublish ? "bg-[#1e78ff] text-white hover:bg-[#00a6ff]" : "cursor-not-allowed border border-[#12305f] bg-[#06101f] text-blue-100/35")}>
          <Send className="h-4 w-4" />
          {canPublish ? "Publish" : "Publish locked"}
        </button>
      </div>
    </aside>
  );
}

function InfoPill({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3">
      <Icon className="mb-2 h-4 w-4 text-[#00c8ff]" />
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/38">{label}</p>
      <p className="mt-1 truncate font-black text-white">{value}</p>
    </div>
  );
}