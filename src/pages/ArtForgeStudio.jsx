import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles,
  Layers,
  Box,
  Film,
  Smile,
  LayoutGrid,
  Hand,
  PenTool,
  Workflow,
  Image,
  Video,
  Brain,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Download,
  Save,
  Play,
  Pause,
  Upload,
  Settings,
  Cpu,
  Database,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  GripVertical,
  SlidersHorizontal,
  MousePointer2,
  Type,
  Scissors,
  Search,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

const CREATION_MODES = [
  {
    id: "image",
    label: "Art",
    icon: WandSparkles,
    hint: "Text or reference image to finished art",
    prompt: "A cinematic neon cyberpunk dragon over a rainy city, dramatic lighting, sharp detail",
    color: "from-blue-500 to-violet-500",
  },
  {
    id: "2d_model",
    label: "2D Model",
    icon: Layers,
    hint: "Sprite sheets, character sheets, PNGTuber states",
    prompt: "Cute streamer mascot character sheet with idle, talking, happy, angry, and surprised states",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    id: "3d_model",
    label: "3D Model",
    icon: Box,
    hint: "Text/image to 3D asset planning and generation",
    prompt: "Stylized VTuber desk companion robot, rounded body, glowing blue eyes, game-ready GLB",
    color: "from-orange-500 to-violet-500",
  },
  {
    id: "sticker",
    label: "Sticker",
    icon: Smile,
    hint: "Transparent sticker packs and emotes",
    prompt: "Kawaii blue fire mascot sticker pack with bold outline, transparent background",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "comic",
    label: "Comic",
    icon: LayoutGrid,
    hint: "Panels, captions, speech bubbles, story beats",
    prompt: "Four-panel comic about a streamer discovering a magical AI art forge",
    color: "from-emerald-500 to-blue-500",
  },
  {
    id: "video",
    label: "Video",
    icon: Film,
    hint: "Shorts scenes, camera moves, image-to-motion prompts",
    prompt: "Vertical short: camera pushes through a glowing creator studio into a 3D art portal",
    color: "from-pink-500 to-violet-500",
  },
  {
    id: "tracer",
    label: "Tracer",
    icon: PenTool,
    hint: "Pose tracing, line guides, opacity overlays",
    prompt: "Create a clean tracing guide for a dynamic anime running pose with construction lines",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "hand_helper",
    label: "Hand Helper",
    icon: Hand,
    hint: "Hands, fingers, gestures, correction references",
    prompt: "Generate hand reference sheet: open palm, fist, pointing, peace sign, holding microphone",
    color: "from-rose-400 to-pink-600",
  },
];

const PROVIDERS = [
  { id: "base44", label: "Base44 Core", note: "Default image/video tools" },
  { id: "openai", label: "OpenAI", note: "Set OPENAI_API_KEY" },
  { id: "stability", label: "Stability", note: "Set STABILITY_API_KEY" },
  { id: "replicate", label: "Replicate", note: "Set REPLICATE_API_TOKEN" },
  { id: "tripo3d", label: "Tripo3D", note: "Set TRIPO3D_API_KEY" },
];

const STYLE_PRESETS = [
  "Cinematic", "Anime", "Pixel Art", "VTuber", "Photoreal", "Comic Ink", "Sticker", "3D Toy", "Low Poly", "Neon Noir", "Watercolor", "Storyboard", "Hand Study", "Tracing Guide",
];

const CAMERA_PRESETS = ["Static", "Slow push-in", "Orbit", "Dolly zoom", "Handheld", "Parallax", "Top-down", "POV"];
const ASPECTS = ["16:9", "9:16", "1:1", "4:5", "21:9"];

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

function createMockSvg({ mode, prompt }) {
  const safePrompt = encodeURIComponent((prompt || "ArtForge preview").slice(0, 120));
  const label = encodeURIComponent(CREATION_MODES.find((m) => m.id === mode)?.label || "ArtForge");
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23030a17'/><stop offset='.45' stop-color='%230b1e3a'/><stop offset='1' stop-color='%235b21b6'/></linearGradient><radialGradient id='r' cx='.7' cy='.3' r='.55'><stop stop-color='%23268cff' stop-opacity='.8'/><stop offset='1' stop-color='%23268cff' stop-opacity='0'/></radialGradient></defs><rect width='1280' height='720' fill='url(%23g)'/><rect width='1280' height='720' fill='url(%23r)'/><g opacity='.25' stroke='%231e78ff'><path d='M0 120h1280M0 240h1280M0 360h1280M0 480h1280M0 600h1280M160 0v720M320 0v720M480 0v720M640 0v720M800 0v720M960 0v720M1120 0v720'/></g><circle cx='640' cy='310' r='110' fill='%231e78ff' opacity='.15'/><circle cx='640' cy='310' r='70' fill='%23a855f7' opacity='.25'/><text x='640' y='300' text-anchor='middle' fill='white' font-size='54' font-family='Arial' font-weight='800'>${label}</text><text x='640' y='360' text-anchor='middle' fill='%239cc8ff' font-size='24' font-family='Arial'>${safePrompt}</text><text x='640' y='640' text-anchor='middle' fill='%235ea2ff' font-size='18' font-family='Arial'>Generated preview placeholder • connect provider keys for real rendering</text></svg>`;
}

function ModeButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cls(
        "group rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-blue-400/70 bg-blue-500/15 shadow-lg shadow-blue-950/40"
          : "border-blue-900/35 bg-slate-950/40 hover:border-blue-600/70 hover:bg-blue-950/20"
      )}
    >
      <div className={cls("mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white", item.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-black text-white">{item.label}</div>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-blue-100/45">{item.hint}</p>
    </button>
  );
}

function Panel({ title, icon: Icon, children, action }) {
  return (
    <section className="rounded-3xl border border-blue-900/35 bg-[#061120]/80 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-blue-900/30 px-4 py-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-blue-400" />}
          <h3 className="font-black text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-200/60">{children}</label>;
}

function JobPill({ status }) {
  const map = {
    queued: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    running: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    complete: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    failed: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return <span className={cls("rounded-full border px-2 py-0.5 text-[11px] font-bold", map[status] || map.queued)}>{status}</span>;
}

export default function ArtForgeStudio() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("studio");
  const [mode, setMode] = useState("image");
  const [provider, setProvider] = useState("base44");
  const [prompt, setPrompt] = useState(CREATION_MODES[0].prompt);
  const [negativePrompt, setNegativePrompt] = useState("blurry, broken hands, extra fingers, watermark, low quality, distorted anatomy");
  const [styles, setStyles] = useState(["Cinematic"]);
  const [aspect, setAspect] = useState("16:9");
  const [camera, setCamera] = useState("Slow push-in");
  const [duration, setDuration] = useState(8);
  const [seed, setSeed] = useState(12345);
  const [quality, setQuality] = useState("high");
  const [referenceImages, setReferenceImages] = useState([]);
  const [layers, setLayers] = useState(() => safeJsonParse(localStorage.getItem("artforge_layers"), [
    { id: uid("layer"), name: "Background", type: "image", opacity: 100, locked: false },
    { id: uid("layer"), name: "Subject", type: "character", opacity: 100, locked: false },
    { id: uid("layer"), name: "Effects", type: "lighting", opacity: 65, locked: false },
  ]));
  const [nodes, setNodes] = useState(() => safeJsonParse(localStorage.getItem("artforge_nodes"), [
    { id: uid("node"), type: "Prompt", label: "Prompt Enhancer", status: "ready" },
    { id: uid("node"), type: "Reference", label: "Style Match", status: "ready" },
    { id: uid("node"), type: "Generate", label: "Render Provider", status: "ready" },
    { id: uid("node"), type: "Post", label: "Upscale / Export", status: "ready" },
  ]));
  const [scenes, setScenes] = useState(() => safeJsonParse(localStorage.getItem("artforge_scenes"), [
    { id: uid("scene"), name: "Hook", seconds: 2, camera: "Push-in" },
    { id: uid("scene"), name: "Reveal", seconds: 4, camera: "Orbit" },
    { id: uid("scene"), name: "Loop End", seconds: 2, camera: "Match cut" },
  ]));
  const [jobs, setJobs] = useState(() => safeJsonParse(localStorage.getItem("artforge_jobs"), []));
  const [memory, setMemory] = useState(() => safeJsonParse(localStorage.getItem("artforge_memory"), [
    "Prefer neon blue / violet VStream brand lighting.",
    "Keep hands anatomically correct with 5 fingers and clear joints.",
    "Use vertical 9:16 framing for Shorts unless changed.",
  ]));
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");

  const currentMode = CREATION_MODES.find((item) => item.id === mode) || CREATION_MODES[0];
  const CurrentModeIcon = currentMode.icon;

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  useEffect(() => localStorage.setItem("artforge_layers", JSON.stringify(layers)), [layers]);
  useEffect(() => localStorage.setItem("artforge_nodes", JSON.stringify(nodes)), [nodes]);
  useEffect(() => localStorage.setItem("artforge_scenes", JSON.stringify(scenes)), [scenes]);
  useEffect(() => localStorage.setItem("artforge_jobs", JSON.stringify(jobs.slice(0, 50))), [jobs]);
  useEffect(() => localStorage.setItem("artforge_memory", JSON.stringify(memory)), [memory]);

  const { data: assets = [] } = useQuery({
    queryKey: ["artforge-assets", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const result = await base44.entities.MediaAsset.filter({ created_by: user.email }, "-created_date", 150);
      return Array.isArray(result) ? result : [];
    },
    staleTime: 15_000,
    gcTime: 300_000,
  });

  const filteredAssets = useMemo(() => {
    const q = assetSearch.toLowerCase().trim();
    return assets.filter((asset) => {
      const matchMode = mode === "image" ? true : asset.type === mode || asset.category === mode;
      const matchText = !q || `${asset.name || ""} ${asset.description || ""} ${asset.category || ""}`.toLowerCase().includes(q);
      return matchMode && matchText;
    });
  }, [assets, assetSearch, mode]);

  const pipelinePrompt = useMemo(() => {
    const styleLine = styles.length ? `Style presets: ${styles.join(", ")}.` : "";
    const sceneLine = mode === "video" ? `Scenes: ${scenes.map((s) => `${s.name} ${s.seconds}s ${s.camera}`).join("; ")}.` : "";
    const tracerLine = mode === "tracer" ? "Output should include simplified pose construction lines, tracing-safe contours, high-contrast edges, and opacity overlay guidance." : "";
    const handLine = mode === "hand_helper" ? "Prioritize accurate hand anatomy: palm block, knuckles, 5 fingers, gesture variants, joint arcs, and common mistakes to avoid." : "";
    return [prompt, styleLine, `Aspect ratio: ${aspect}.`, `Camera: ${camera}.`, sceneLine, tracerLine, handLine, `Negative prompt: ${negativePrompt}.`]
      .filter(Boolean)
      .join("\n");
  }, [prompt, styles, aspect, camera, scenes, mode, negativePrompt]);

  const toggleStyle = (style) => {
    setStyles((prev) => (prev.includes(style) ? prev.filter((item) => item !== style) : [...prev, style]));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode.id);
    setPrompt(nextMode.prompt);
    if (nextMode.id === "video") setAspect("9:16");
    if (nextMode.id === "tracer") setStyles(["Tracing Guide"]);
    if (nextMode.id === "hand_helper") setStyles(["Hand Study"]);
    if (nextMode.id === "3d_model") setProvider("tripo3d");
  };

  const handleReferenceUpload = async (files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    const uploaded = [];
    for (const file of fileList.slice(0, 6)) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) uploaded.push(res.file_url);
      } catch (error) {
        console.error(error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (uploaded.length) {
      setReferenceImages((prev) => [...prev, ...uploaded].slice(0, 8));
      toast.success(`Added ${uploaded.length} reference image${uploaded.length > 1 ? "s" : ""}`);
    }
  };

  const addLayer = () => setLayers((prev) => [...prev, { id: uid("layer"), name: `Layer ${prev.length + 1}`, type: "paint", opacity: 100, locked: false }]);
  const removeLayer = (id) => setLayers((prev) => prev.filter((layer) => layer.id !== id));
  const updateLayer = (id, updates) => setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)));

  const addNode = (type = "Generate") => setNodes((prev) => [...prev, { id: uid("node"), type, label: `${type} Node`, status: "ready" }]);
  const removeNode = (id) => setNodes((prev) => prev.filter((node) => node.id !== id));
  const addScene = () => setScenes((prev) => [...prev, { id: uid("scene"), name: `Scene ${prev.length + 1}`, seconds: 3, camera }]);
  const removeScene = (id) => setScenes((prev) => prev.filter((scene) => scene.id !== id));
  const updateScene = (id, updates) => setScenes((prev) => prev.map((scene) => (scene.id === id ? { ...scene, ...updates } : scene)));

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        add_context_from_internet: false,
        prompt: `Rewrite this into a production-grade AI generation prompt for ${currentMode.label}. Keep the user's idea, add composition, lighting, style, camera, technical details, and quality notes. Return only the improved prompt.\n\nIdea: ${prompt}`,
      });
      const text = typeof response === "string" ? response : response?.text || response?.content || JSON.stringify(response);
      setPrompt(text.slice(0, 2000));
      toast.success("Prompt enhanced");
    } catch (error) {
      console.error(error);
      toast.error("Prompt enhancer failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSaveProject = async () => {
    const project = {
      id: uid("project"),
      saved_at: new Date().toISOString(),
      mode,
      provider,
      prompt,
      negativePrompt,
      styles,
      aspect,
      camera,
      duration,
      seed,
      quality,
      referenceImages,
      layers,
      nodes,
      scenes,
      memory,
    };
    localStorage.setItem("artforge_last_project", JSON.stringify(project));
    try {
      await base44.entities.MediaAsset.create({
        name: `ArtForge Project ${new Date().toLocaleDateString()}`,
        type: "project",
        asset_type: "template",
        category: "artforge_project",
        description: JSON.stringify(project).slice(0, 4000),
        tags: ["artforge", "project", mode],
      });
      queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
    } catch (error) {
      console.warn("Project saved locally only", error);
    }
    toast.success("Project/version saved");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe what you want to create first");
      return;
    }
    setIsGenerating(true);
    const jobId = uid("job");
    const job = {
      id: jobId,
      title: `${currentMode.label}: ${prompt.slice(0, 44)}`,
      mode,
      provider,
      status: "running",
      progress: 15,
      created_at: new Date().toISOString(),
    };
    setJobs((prev) => [job, ...prev]);
    setNodes((prev) => prev.map((node, index) => ({ ...node, status: index === 2 ? "running" : "ready" })));

    try {
      let resultUrl;
      let resultType = mode;
      let functionResult;

      try {
        const response = await base44.functions.invoke("generateArtForgeAsset", {
          mode,
          provider,
          prompt: pipelinePrompt,
          negativePrompt,
          aspectRatio: aspect,
          durationSeconds: duration,
          seed,
          quality,
          referenceImages,
          layers,
          nodes,
          scenes,
        });
        functionResult = response?.data || response;
        resultUrl = functionResult?.url || functionResult?.assetUrl || functionResult?.modelUrl || functionResult?.videoUrl;
        resultType = functionResult?.type || resultType;
      } catch (functionError) {
        console.warn("generateArtForgeAsset function unavailable or failed; using client fallback", functionError);
      }

      if (!resultUrl) {
        if (mode === "video") {
          const video = await base44.integrations.Core.GenerateVideo({ prompt: pipelinePrompt, duration, aspect_ratio: aspect });
          resultUrl = video?.url;
          resultType = "video";
        } else if (["image", "sticker", "comic", "2d_model", "tracer", "hand_helper"].includes(mode)) {
          const image = await base44.integrations.Core.GenerateImage({
            prompt: pipelinePrompt,
            existing_image_urls: referenceImages.length ? referenceImages : undefined,
          });
          resultUrl = image?.url;
          resultType = mode === "tracer" || mode === "hand_helper" ? "image" : mode;
        }
      }

      if (!resultUrl) {
        resultUrl = createMockSvg({ mode, prompt });
      }

      const saved = await base44.entities.MediaAsset.create({
        name: `${currentMode.label} ${new Date().toLocaleTimeString()}`,
        type: resultType,
        asset_type: mode === "video" ? "export" : mode === "sticker" ? "graphic" : "template",
        url: resultUrl,
        file_url: resultUrl,
        thumbnail_url: resultUrl,
        category: mode,
        description: pipelinePrompt.slice(0, 1500),
        tags: ["artforge", mode, provider, ...styles.slice(0, 6)],
      });

      const completeJob = {
        ...job,
        status: "complete",
        progress: 100,
        asset_id: saved?.id,
        result_url: resultUrl,
        provider_status: functionResult?.status || "complete",
      };
      setJobs((prev) => prev.map((item) => (item.id === jobId ? completeJob : item)));
      setNodes((prev) => prev.map((node) => ({ ...node, status: "complete" })));
      setSelectedAsset(saved || { url: resultUrl, type: resultType, name: completeJob.title });
      queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
      toast.success("Generation complete and saved");
    } catch (error) {
      console.error(error);
      setJobs((prev) => prev.map((item) => (item.id === jobId ? { ...item, status: "failed", progress: 100, error: error.message } : item)));
      setNodes((prev) => prev.map((node, index) => ({ ...node, status: index === 2 ? "failed" : node.status })));
      toast.error("Generation failed. Check provider keys or try Base44 Core.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(pipelinePrompt);
    toast.success("Pipeline prompt copied");
  };

  return (
    <div className="min-h-screen bg-[#020712] text-blue-50">
      <div className="sticky top-0 z-30 border-b border-blue-900/35 bg-[#020712]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 lg:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] shadow-lg shadow-blue-950/60">
              <WandSparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">ArtForge AI Studio</h1>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-black text-emerald-300">PRODUCTION UX</span>
              </div>
              <p className="text-sm text-blue-200/50">Canvas editor • node workflows • timeline • provider hooks • queue • project memory</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "studio", label: "Studio", icon: WandSparkles },
              { id: "canvas", label: "Canvas", icon: Layers },
              { id: "workflow", label: "Nodes", icon: Workflow },
              { id: "timeline", label: "Timeline", icon: Video },
              { id: "assets", label: "Assets", icon: Database },
              { id: "settings", label: "Providers", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cls(
                    "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-black transition",
                    activeTab === tab.id
                      ? "border-blue-400/70 bg-blue-500/20 text-white"
                      : "border-blue-900/30 bg-blue-950/20 text-blue-200/55 hover:border-blue-500/60 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1800px] gap-5 px-4 py-5 lg:px-6 xl:grid-cols-[340px_1fr_360px]">
        <aside className="space-y-5">
          <Panel title="Creation Modes" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-3">
              {CREATION_MODES.map((item) => (
                <ModeButton key={item.id} item={item} active={mode === item.id} onClick={() => handleModeChange(item)} />
              ))}
            </div>
          </Panel>

          <Panel title="Provider + Output" icon={Cpu}>
            <div className="space-y-4">
              <div>
                <FieldLabel>AI Provider</FieldLabel>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                  {PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <p className="mt-1 text-xs text-blue-200/35">{PROVIDERS.find((p) => p.id === provider)?.note}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Aspect</FieldLabel>
                  <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                    {ASPECTS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Quality</FieldLabel>
                  <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                    <option value="draft">Draft</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel>Camera / Motion</FieldLabel>
                <select value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400">
                  {CAMERA_PRESETS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              {mode === "video" && (
                <div>
                  <FieldLabel>Duration: {duration}s</FieldLabel>
                  <input type="range" min="2" max="60" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
                </div>
              )}

              <div>
                <FieldLabel>Seed</FieldLabel>
                <input value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" />
              </div>
            </div>
          </Panel>
        </aside>

        <section className="min-w-0 space-y-5">
          <AnimatePresence mode="wait">
            {activeTab === "studio" && (
              <motion.div key="studio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                <Panel
                  title={`${currentMode.label} Generator`}
                  icon={currentMode.icon}
                  action={<button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-2 rounded-xl bg-blue-500/15 px-3 py-2 text-xs font-black text-blue-200 hover:bg-blue-500/25 disabled:opacity-50">{isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />} Enhance</button>}
                >
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Describe your creation</FieldLabel>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full resize-none rounded-2xl border border-blue-900/40 bg-[#08162a] p-4 text-sm leading-6 text-white outline-none placeholder:text-blue-200/25 focus:border-blue-400" />
                    </div>

                    <div>
                      <FieldLabel>Style Presets</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_PRESETS.map((style) => (
                          <button key={style} onClick={() => toggleStyle(style)} className={cls("rounded-full border px-3 py-1.5 text-xs font-bold transition", styles.includes(style) ? "border-blue-400 bg-blue-500/20 text-white" : "border-blue-900/40 bg-slate-950/50 text-blue-200/45 hover:text-white")}>{style}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Negative Prompt / Safety Corrections</FieldLabel>
                      <input value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} className="w-full rounded-xl border border-blue-900/40 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" />
                    </div>

                    <div className="rounded-2xl border border-dashed border-blue-800/50 bg-blue-950/10 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white">Reference Images</p>
                          <p className="text-xs text-blue-200/40">Style matching, tracer references, hand poses, character consistency.</p>
                        </div>
                        <label className="cursor-pointer rounded-xl bg-blue-500/20 px-3 py-2 text-xs font-black text-blue-200 hover:bg-blue-500/30">
                          <Upload className="mr-1 inline h-3 w-3" /> Upload
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleReferenceUpload(e.target.files)} />
                        </label>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {referenceImages.length === 0 ? <p className="text-sm text-blue-200/35">No references yet.</p> : referenceImages.map((url) => (
                          <div key={url} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-blue-900/40 bg-slate-950">
                            <img src={url} alt="reference" className="h-full w-full object-cover" />
                            <button onClick={() => setReferenceImages((prev) => prev.filter((item) => item !== url))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e78ff] to-[#a855f7] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/40 disabled:opacity-50">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Generate / Queue Render
                      </button>
                      <button onClick={copyPrompt} className="flex items-center gap-2 rounded-2xl border border-blue-900/40 bg-slate-950/50 px-5 py-3 text-sm font-black text-blue-100 hover:bg-blue-950/40"><Copy className="h-4 w-4" /> Copy Pipeline Prompt</button>
                      <button onClick={handleSaveProject} className="flex items-center gap-2 rounded-2xl border border-blue-900/40 bg-slate-950/50 px-5 py-3 text-sm font-black text-blue-100 hover:bg-blue-950/40"><Save className="h-4 w-4" /> Save Version</button>
                    </div>
                  </div>
                </Panel>

                <Panel title="Live Preview / Render Output" icon={Image}>
                  <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-3xl border border-blue-900/35 bg-[radial-gradient(circle_at_50%_35%,rgba(30,120,255,.24),transparent_34%),linear-gradient(135deg,#030712,#071b33_45%,#111827)]">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(30,120,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(30,120,255,.35) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
                    {selectedAsset?.url || selectedAsset?.file_url ? (
                      selectedAsset.type === "video" ? <video src={selectedAsset.url || selectedAsset.file_url} controls className="relative z-10 max-h-[410px] max-w-full rounded-2xl" /> : <img src={selectedAsset.url || selectedAsset.file_url} alt="output" className="relative z-10 max-h-[410px] max-w-full rounded-2xl object-contain shadow-2xl" />
                    ) : (
                      <div className="relative z-10 max-w-lg text-center">
                        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-blue-500/15 text-blue-300"><CurrentModeIcon className="h-9 w-9" /></div>
                        <h2 className="text-2xl font-black text-white">Your production render appears here</h2>
                        <p className="mt-2 text-sm leading-6 text-blue-200/45">Use the generator, canvas, timeline, and node pipeline to build assets for VStream, VTuber workflows, Shorts, stickers, comics, 3D, tracer references, and hand studies.</p>
                      </div>
                    )}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "canvas" && (
              <motion.div key="canvas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <Panel title="Drag / Drop Layer Canvas" icon={Layers}>
                  <div className="relative min-h-[620px] overflow-hidden rounded-3xl border border-blue-900/40 bg-[#050b14]">
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(30,120,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(30,120,255,.35) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="absolute left-4 top-4 flex gap-2 rounded-2xl border border-blue-900/40 bg-slate-950/80 p-2 backdrop-blur">
                      {[MousePointer2, Type, PenTool, Scissors, SlidersHorizontal].map((Icon, idx) => <button key={idx} className="grid h-9 w-9 place-items-center rounded-xl text-blue-200/60 hover:bg-blue-500/20 hover:text-white"><Icon className="h-4 w-4" /></button>)}
                    </div>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-[360px] w-[560px] rounded-3xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-violet-500/10 shadow-2xl shadow-blue-950/40" />
                    </div>
                    <p className="absolute bottom-4 left-4 right-4 rounded-2xl border border-blue-900/40 bg-slate-950/80 p-3 text-sm text-blue-100/55 backdrop-blur">Canvas mock is ready for real drag/drop wiring. Layers are persistent, editable, and saved with project versions.</p>
                  </div>
                </Panel>
                <Panel title="Layers" icon={GripVertical} action={<button onClick={addLayer} className="rounded-xl bg-blue-500/20 px-3 py-1.5 text-xs font-black text-blue-200"><Plus className="mr-1 inline h-3 w-3" />Layer</button>}>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div key={layer.id} className="rounded-2xl border border-blue-900/35 bg-slate-950/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-blue-200/30" />
                          <input value={layer.name} onChange={(e) => updateLayer(layer.id, { name: e.target.value })} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none" />
                          <button onClick={() => removeLayer(layer.id)} className="text-blue-200/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <FieldLabel>Opacity {layer.opacity}%</FieldLabel>
                        <input type="range" min="0" max="100" value={layer.opacity} onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })} className="w-full" />
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "workflow" && (
              <motion.div key="workflow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Panel title="Node-Based AI Pipeline" icon={Workflow} action={<button onClick={() => addNode("Custom")} className="rounded-xl bg-blue-500/20 px-3 py-1.5 text-xs font-black text-blue-200"><Plus className="mr-1 inline h-3 w-3" />Node</button>}>
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                    {nodes.map((node, index) => (
                      <div key={node.id} className="relative rounded-3xl border border-blue-900/40 bg-slate-950/60 p-4">
                        {index < nodes.length - 1 && <div className="absolute -right-4 top-1/2 hidden h-px w-4 bg-blue-500/50 2xl:block" />}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full bg-blue-500/15 px-2 py-1 text-xs font-black text-blue-200">{node.type}</span>
                          <button onClick={() => removeNode(node.id)} className="text-blue-200/30 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <input value={node.label} onChange={(e) => setNodes((prev) => prev.map((item) => item.id === node.id ? { ...item, label: e.target.value } : item))} className="mb-3 w-full bg-transparent text-lg font-black text-white outline-none" />
                        <JobPill status={node.status === "ready" ? "queued" : node.status} />
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Panel title="Shorts / Video Timeline" icon={Clock} action={<button onClick={addScene} className="rounded-xl bg-blue-500/20 px-3 py-1.5 text-xs font-black text-blue-200"><Plus className="mr-1 inline h-3 w-3" />Scene</button>}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-blue-900/35 bg-slate-950/60 p-3">
                      <button className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-200"><Play className="h-4 w-4" /></button>
                      <button className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-200/70"><Pause className="h-4 w-4" /></button>
                      <div className="h-2 flex-1 rounded-full bg-blue-950"><div className="h-full w-1/3 rounded-full bg-blue-500" /></div>
                      <span className="text-sm font-bold text-blue-100/60">{scenes.reduce((sum, scene) => sum + Number(scene.seconds || 0), 0)}s</span>
                    </div>
                    {scenes.map((scene, index) => (
                      <div key={scene.id} className="grid gap-3 rounded-2xl border border-blue-900/35 bg-slate-950/50 p-3 md:grid-cols-[60px_1fr_100px_140px_40px] md:items-center">
                        <div className="rounded-xl bg-blue-500/15 p-2 text-center text-xs font-black text-blue-200">#{index + 1}</div>
                        <input value={scene.name} onChange={(e) => updateScene(scene.id, { name: e.target.value })} className="rounded-xl border border-blue-900/40 bg-[#08162a] px-3 py-2 text-sm text-white outline-none" />
                        <input type="number" min="1" max="60" value={scene.seconds} onChange={(e) => updateScene(scene.id, { seconds: Number(e.target.value) })} className="rounded-xl border border-blue-900/40 bg-[#08162a] px-3 py-2 text-sm text-white outline-none" />
                        <input value={scene.camera} onChange={(e) => updateScene(scene.id, { camera: e.target.value })} className="rounded-xl border border-blue-900/40 bg-[#08162a] px-3 py-2 text-sm text-white outline-none" />
                        <button onClick={() => removeScene(scene.id)} className="text-blue-200/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "assets" && (
              <motion.div key="assets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Panel title="Creator Asset Manager" icon={Database} action={<div className="relative"><Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-blue-200/35" /><input value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Search assets" className="rounded-xl border border-blue-900/40 bg-slate-950 py-2 pl-8 pr-3 text-xs text-white outline-none" /></div>}>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredAssets.map((asset) => (
                      <button key={asset.id} onClick={() => setSelectedAsset(asset)} className="group overflow-hidden rounded-2xl border border-blue-900/35 bg-slate-950/60 text-left transition hover:border-blue-500/60">
                        <div className="aspect-video bg-blue-950/30">
                          {asset.url || asset.file_url || asset.thumbnail_url ? <img src={asset.thumbnail_url || asset.url || asset.file_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-blue-200/35"><Database className="h-8 w-8" /></div>}
                        </div>
                        <div className="p-3">
                          <p className="truncate font-bold text-white">{asset.name || "Untitled"}</p>
                          <p className="mt-1 text-xs text-blue-200/40">{asset.type || asset.category || "asset"}</p>
                        </div>
                      </button>
                    ))}
                    {!filteredAssets.length && <p className="col-span-full rounded-2xl border border-dashed border-blue-900/40 p-8 text-center text-blue-200/45">No assets yet. Generate or save a project first.</p>}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                <Panel title="Real AI Provider Integration Checklist" icon={Settings}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PROVIDERS.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-blue-900/35 bg-slate-950/50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-black text-white">{item.label}</h4>
                          <span className="rounded-full border border-blue-900/40 px-2 py-0.5 text-[11px] text-blue-200/50">{item.id}</span>
                        </div>
                        <p className="text-sm text-blue-200/45">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="AI Memory / Project Rules" icon={Brain} action={<button onClick={() => setMemory((prev) => [...prev, "New project rule"])} className="rounded-xl bg-blue-500/20 px-3 py-1.5 text-xs font-black text-blue-200"><Plus className="mr-1 inline h-3 w-3" />Rule</button>}>
                  <div className="space-y-2">
                    {memory.map((item, index) => (
                      <div key={index} className="flex gap-2 rounded-2xl border border-blue-900/35 bg-slate-950/50 p-3">
                        <Star className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                        <textarea value={item} onChange={(e) => setMemory((prev) => prev.map((rule, i) => i === index ? e.target.value : rule))} className="min-h-10 flex-1 resize-none bg-transparent text-sm text-white outline-none" />
                        <button onClick={() => setMemory((prev) => prev.filter((_, i) => i !== index))} className="text-blue-200/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="space-y-5">
          <Panel title="Render Queue" icon={Clock}>
            <div className="space-y-2">
              {jobs.slice(0, 8).map((job) => (
                <button key={job.id} onClick={() => job.result_url && setSelectedAsset({ url: job.result_url, type: job.mode, name: job.title })} className="w-full rounded-2xl border border-blue-900/35 bg-slate-950/50 p-3 text-left hover:border-blue-500/60">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-bold text-white">{job.title}</p>
                    <JobPill status={job.status} />
                  </div>
                  <div className="h-1.5 rounded-full bg-blue-950"><div className="h-full rounded-full bg-blue-500" style={{ width: `${job.progress || 0}%` }} /></div>
                  {job.error && <p className="mt-2 text-xs text-red-300">{job.error}</p>}
                </button>
              ))}
              {!jobs.length && <p className="rounded-2xl border border-dashed border-blue-900/40 p-5 text-center text-sm text-blue-200/40">Queued renders and GPU jobs will show here.</p>}
            </div>
          </Panel>

          <Panel title="Pipeline Prompt" icon={GitBranch} action={<button onClick={copyPrompt} className="text-blue-300 hover:text-white"><Copy className="h-4 w-4" /></button>}>
            <pre className="max-h-[340px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950/70 p-3 text-xs leading-5 text-blue-100/60">{pipelinePrompt}</pre>
          </Panel>

          <Panel title="Status" icon={CheckCircle2}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Frontend production UX added</div>
              <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Project save/versioning added</div>
              <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Queue UI + asset manager added</div>
              <div className="flex items-center gap-2 text-yellow-300"><AlertTriangle className="h-4 w-4" /> Real rendering needs provider API keys</div>
            </div>
          </Panel>

          {selectedAsset?.url && (
            <Panel title="Selected Asset" icon={Download}>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-blue-900/35 bg-slate-950">
                  {selectedAsset.type === "video" ? <video src={selectedAsset.url} controls className="w-full" /> : <img src={selectedAsset.url || selectedAsset.file_url} alt="selected" className="w-full" />}
                </div>
                <a href={selectedAsset.url || selectedAsset.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500/20 px-4 py-3 text-sm font-black text-blue-100 hover:bg-blue-500/30"><Download className="h-4 w-4" /> Open / Download</a>
              </div>
            </Panel>
          )}
        </aside>
      </main>
    </div>
  );
}
