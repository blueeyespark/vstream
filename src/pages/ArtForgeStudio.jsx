import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles, Layers, Box, Film, Smile, LayoutGrid, Hand, PenTool, Workflow, Image,
  Video, Brain, Sparkles, Plus, Trash2, Copy, Download, Save, Play, Pause, Upload,
  Settings, Cpu, Database, GitBranch, Clock, CheckCircle2, Loader2,
  GripVertical, SlidersHorizontal, MousePointer2, Type, Search, Star, X,
  Zap, RefreshCw, Eye, ChevronDown,
  Heart, Grid3X3, List, ImagePlus, RotateCcw, ArrowUpRight,
  FlipHorizontal, Crop, Layers2, Shuffle,
  History, Move,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import TracerMode from "@/components/artforge/TracerMode";
import HandHelperMode from "@/components/artforge/HandHelperMode";
import Model3DMode from "@/components/artforge/Model3DMode";

const CREATION_MODES = [
  { id: "image", label: "Image", icon: WandSparkles, hint: "Text → stunning art", prompt: "A cinematic neon cyberpunk dragon over a rainy city, dramatic lighting, ultra-sharp detail, 8K", color: "from-blue-500 to-violet-600", badge: null },
  { id: "2d_model", label: "2D Model", icon: Layers, hint: "Sprites & PNGTubers", prompt: "Cute streamer mascot character sheet with idle, talking, happy, angry states, clean white background, transparent PNG", color: "from-violet-500 to-fuchsia-500", badge: null },
  { id: "3d_model", label: "3D Model", icon: Box, hint: "Text or image → 3D model", prompt: "Stylized VTuber desk companion robot, rounded body, glowing blue eyes, game-ready low-poly", color: "from-orange-500 to-violet-500", badge: null },
  { id: "video", label: "Video", icon: Film, hint: "AI-generated clips", prompt: "Camera pushes through a glowing portal into a neon cyberpunk cityscape, cinematic vertical short", color: "from-pink-500 to-violet-500", badge: "NEW" },
  { id: "sticker", label: "Sticker", icon: Smile, hint: "Transparent packs", prompt: "Kawaii blue fire mascot sticker pack with bold outline, transparent background, expressive face", color: "from-amber-400 to-orange-500", badge: null },
  { id: "comic", label: "Comic", icon: LayoutGrid, hint: "Panels & strips", prompt: "Four-panel comic about a streamer discovering a magical AI art forge, vibrant manga style", color: "from-emerald-500 to-blue-500", badge: null },
  { id: "tracer", label: "Tracer", icon: PenTool, hint: "Photo → traceable line art", prompt: "Convert to clean anime line art", color: "from-cyan-400 to-blue-500", badge: null },
  { id: "hand_helper", label: "Hand Helper", icon: Hand, hint: "Poseable 3D hand reference", prompt: "Accurate hand drawing reference", color: "from-rose-400 to-pink-600", badge: null },
];

const PROVIDERS = [
  { id: "base44", label: "Base44 Core", note: "Built-in — no key needed", active: true },
  { id: "openai", label: "OpenAI DALL·E 3", note: "Requires OPENAI_API_KEY" },
  { id: "stability", label: "Stability AI SDXL", note: "Requires STABILITY_API_KEY" },
  { id: "replicate", label: "Replicate Flux", note: "Requires REPLICATE_API_TOKEN" },
  { id: "tripo3d", label: "Tripo3D", note: "Best for 3D — Requires TRIPO3D_API_KEY" },
];

const STYLE_PRESETS = [
  { label: "Cinematic", emoji: "🎬" }, { label: "Anime", emoji: "⛩️" }, { label: "Pixel Art", emoji: "🕹️" },
  { label: "VTuber", emoji: "🎭" }, { label: "Photoreal", emoji: "📷" }, { label: "Comic Ink", emoji: "✏️" },
  { label: "Sticker", emoji: "🌟" }, { label: "3D Toy", emoji: "🧸" }, { label: "Low Poly", emoji: "💎" },
  { label: "Neon Noir", emoji: "🌆" }, { label: "Watercolor", emoji: "🎨" }, { label: "Storyboard", emoji: "📋" },
  { label: "Hand Study", emoji: "✋" }, { label: "Tracing Guide", emoji: "📐" }, { label: "Cyberpunk", emoji: "⚡" },
  { label: "Fantasy", emoji: "🧙" }, { label: "Minimalist", emoji: "⬜" }, { label: "Dark Gothic", emoji: "🦇" },
];

const PROMPT_EXAMPLES = [
  "A majestic phoenix rising from blue digital flames, VTuber mascot style",
  "Cozy streaming desk setup, lofi aesthetic, plants, warm lighting, isometric",
  "Dynamic anime battle scene, two characters clashing, motion blur, manga ink",
  "Cute chibi version of a gaming rabbit, holding a controller, transparent background",
  "Abstract neon wave art, flowing liquid light, blue and purple palette, 4K",
  "Cyberpunk Tokyo street at night, rain reflection, neon signs, HDR photography",
  "Kawaii cloud mascot character sheet, 6 expressions, white background",
  "Epic space battle thumbnail, dramatic lighting, hyperrealistic ships",
];

const CAMERA_PRESETS = ["Static", "Slow push-in", "Orbit", "Dolly zoom", "Handheld", "Parallax", "Top-down", "POV"];
const ASPECTS = ["16:9", "9:16", "1:1", "4:5", "3:4", "21:9"];

function safeJsonParse(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function cls(...parts) { return parts.filter(Boolean).join(" "); }

// ─── Sub-components ────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children, action, className = "", noPad = false }) {
  return (
    <section className={cls("rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 shadow-xl shadow-black/30 backdrop-blur", className)}>
      {(title || Icon) && (
        <div className="flex items-center justify-between border-b border-[#1a3a60]/50 px-4 py-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-[#a855f7]" />}
            {title && <h3 className="text-sm font-black text-white">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className={noPad ? "" : "p-4"}>{children}</div>
    </section>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">{children}</label>;
}

function JobPill({ status }) {
  const map = {
    queued: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    running: "bg-blue-500/15 text-blue-300 border-blue-500/30 animate-pulse",
    complete: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    failed: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return <span className={cls("rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize", map[status] || map.queued)}>{status}</span>;
}

function AspectButton({ value, current, onClick }) {
  const active = value === current;
  const [w, h] = value.split(":").map(Number);
  const ratio = w / h;
  const boxW = ratio >= 1 ? 28 : Math.round(28 * ratio);
  const boxH = ratio <= 1 ? 28 : Math.round(28 / ratio);
  return (
    <button onClick={onClick} className={cls("flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition", active ? "border-[#a855f7]/60 bg-[#a855f7]/15 text-white" : "border-[#1a3a60]/60 bg-[#03080f]/60 text-blue-200/50 hover:text-white hover:border-[#1a3a60]")}>
      <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <div className={cls("border-2 rounded", active ? "border-[#a855f7]" : "border-current")} style={{ width: boxW, height: boxH }} />
      </div>
      <span className="text-[10px] font-black">{value}</span>
    </button>
  );
}

function GenerationCard({ job, onClick }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-2xl border border-[#1a3a60]/60 bg-[#030e1f] cursor-pointer"
      onClick={onClick}>
      <div className="aspect-square overflow-hidden bg-[#020812]">
        {job.result_url ? (
          job.mode === "video"
            ? <video src={job.result_url} className="h-full w-full object-cover" muted />
            : <img src={job.result_url} alt={job.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center">
            {job.status === "running"
              ? <div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-[#a855f7]" /><p className="text-xs text-blue-200/50">Generating…</p></div>
              : job.status === "failed"
              ? <div className="text-center"><X className="mx-auto mb-2 h-8 w-8 text-red-400" /><p className="text-xs text-red-300">Failed</p></div>
              : <Loader2 className="h-8 w-8 animate-spin text-blue-300/30" />}
          </div>
        )}
      </div>
      {job.result_url && (
        <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-t from-black/80 via-transparent to-black/20">
          <div className="flex justify-end gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className={cls("grid h-7 w-7 place-items-center rounded-full backdrop-blur transition", liked ? "bg-red-500 text-white" : "bg-black/50 text-white hover:bg-red-500")}>
              <Heart className="h-3.5 w-3.5" />
            </button>
            <a href={job.result_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white hover:bg-[#1e78ff] backdrop-blur transition">
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
          <div>
            <p className="line-clamp-2 text-xs font-black text-white">{job.title}</p>
            <p className="mt-0.5 text-[10px] text-white/50 capitalize">{job.mode}</p>
          </div>
        </div>
      )}
      {job.status === "running" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a60]">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ArtForgeStudio({ embedded = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const promptRef = useRef(null);

  // Core state
  const [mode, setMode] = useState("image");
  const [provider, setProvider] = useState("base44");
  const [prompt, setPrompt] = useState(CREATION_MODES[0].prompt);
  const [negativePrompt, setNegativePrompt] = useState("blurry, broken hands, extra fingers, watermark, low quality, distorted anatomy, text artifacts");
  const [styles, setStyles] = useState(["Cinematic"]);
  const [aspect, setAspect] = useState("16:9");
  const [camera, setCamera] = useState("Slow push-in");
  const [duration, setDuration] = useState(6);
  const [seed, setSeed] = useState(12345);
  const [quality, setQuality] = useState("high");
  const [referenceImages, setReferenceImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("generate");
  const [galleryView, setGalleryView] = useState("grid"); // grid | list
  const [assetSearch, setAssetSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showPromptIdeas, setShowPromptIdeas] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [promptHistory, setPromptHistory] = useState(() => safeJsonParse(localStorage.getItem("artforge_prompt_history"), []));

  // Canvas / workflow state
  const [layers, setLayers] = useState(() => safeJsonParse(localStorage.getItem("artforge_layers"), [
    { id: uid("layer"), name: "Background", type: "image", opacity: 100, locked: false, visible: true },
    { id: uid("layer"), name: "Subject", type: "character", opacity: 100, locked: false, visible: true },
    { id: uid("layer"), name: "Effects", type: "lighting", opacity: 65, locked: false, visible: true },
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

  const currentMode = CREATION_MODES.find((m) => m.id === mode) || CREATION_MODES[0];
  const CurrentModeIcon = currentMode.icon;

  // Persist
  useEffect(() => localStorage.setItem("artforge_layers", JSON.stringify(layers)), [layers]);
  useEffect(() => localStorage.setItem("artforge_nodes", JSON.stringify(nodes)), [nodes]);
  useEffect(() => localStorage.setItem("artforge_scenes", JSON.stringify(scenes)), [scenes]);
  useEffect(() => localStorage.setItem("artforge_jobs", JSON.stringify(jobs.slice(0, 50))), [jobs]);
  useEffect(() => localStorage.setItem("artforge_memory", JSON.stringify(memory)), [memory]);
  useEffect(() => localStorage.setItem("artforge_prompt_history", JSON.stringify(promptHistory.slice(0, 30))), [promptHistory]);

  // Assets
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
      const matchText = !q || `${asset.name || ""} ${asset.description || ""} ${asset.category || ""}`.toLowerCase().includes(q);
      const matchFilter = assetFilter === "all" || (asset.type || asset.category || "") === assetFilter;
      return matchText && matchFilter;
    });
  }, [assets, assetSearch, assetFilter]);

  const pipelinePrompt = useMemo(() => {
    const styleLine = styles.length ? `Style: ${styles.join(", ")}.` : "";
    const sceneLine = mode === "video" ? `Scenes: ${scenes.map((s) => `${s.name} ${s.seconds}s ${s.camera}`).join("; ")}.` : "";
    const tracerLine = mode === "tracer" ? "Include simplified pose construction lines, tracing-safe contours, high-contrast edges." : "";
    const handLine = mode === "hand_helper" ? "Prioritize accurate hand anatomy: palm block, knuckles, 5 fingers, gesture variants." : "";
    return [prompt, styleLine, `Aspect: ${aspect}.`, mode !== "image" ? `Camera: ${camera}.` : "", sceneLine, tracerLine, handLine, `Negative: ${negativePrompt}.`]
      .filter(Boolean).join(" ");
  }, [prompt, styles, aspect, camera, scenes, mode, negativePrompt]);

  const toggleStyle = (style) => setStyles((prev) => prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]);

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
    for (const file of fileList.slice(0, 6)) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) setReferenceImages((prev) => [...prev, res.file_url].slice(0, 8));
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    toast.success("Reference image added");
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional AI art director. Rewrite this into a production-grade generation prompt for "${currentMode.label}". Preserve the user's idea. Add: precise composition, lighting, color palette, style details, camera angle, technical quality descriptors. Return ONLY the improved prompt, no preamble or explanation.\n\nUser idea: ${prompt}`,
      });
      const text = typeof response === "string" ? response : response?.text || response?.content || "";
      if (text) { setPrompt(text.slice(0, 1500).trim()); toast.success("✨ Prompt enhanced"); }
    } catch { toast.error("Prompt enhancer failed"); } finally { setIsEnhancing(false); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Enter a description first"); return; }
    setIsGenerating(true);

    // Save to prompt history
    setPromptHistory((prev) => [{ prompt, mode, styles, aspect, date: new Date().toISOString() }, ...prev].slice(0, 30));

    const generationCount = Math.min(batchCount, 4);
    for (let i = 0; i < generationCount; i++) {
      const jobId = uid("job");
      const currentSeed = seed + i;
      const job = { id: jobId, title: `${currentMode.label}: ${prompt.slice(0, 50)}`, mode, provider, status: "running", progress: 20, created_at: new Date().toISOString() };
      setJobs((prev) => [job, ...prev]);

      try {
        let resultUrl;
        let resultType = mode;

        try {
          const response = await base44.functions.invoke("generateArtForgeAsset", {
            mode, provider, prompt: pipelinePrompt, negativePrompt, aspectRatio: aspect,
            durationSeconds: duration, seed: currentSeed, quality, referenceImages, layers, nodes, scenes,
          });
          const data = response?.data || response;
          resultUrl = data?.url || data?.assetUrl || data?.modelUrl || data?.videoUrl;
          resultType = data?.type || resultType;
        } catch (_) {}

        if (!resultUrl) {
          if (mode === "video") {
            const video = await base44.integrations.Core.GenerateVideo({ prompt: pipelinePrompt, duration: Math.min(duration, 8), aspect_ratio: aspect === "9:16" ? "9:16" : "16:9" });
            resultUrl = video?.url; resultType = "video";
          } else {
            const image = await base44.integrations.Core.GenerateImage({ prompt: pipelinePrompt, existing_image_urls: referenceImages.length ? referenceImages : undefined });
            resultUrl = image?.url;
            resultType = ["tracer", "hand_helper"].includes(mode) ? "image" : mode;
          }
        }

        if (!resultUrl) throw new Error("No result returned");

        const saved = await base44.entities.MediaAsset.create({
          name: `${currentMode.label} · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          type: resultType, asset_type: mode === "video" ? "export" : "graphic",
          url: resultUrl, file_url: resultUrl, thumbnail_url: resultUrl,
          category: mode, description: prompt.slice(0, 500),
          tags: ["artforge", mode, ...styles.slice(0, 4)],
        });

        setJobs((prev) => prev.map((item) => item.id === jobId ? { ...item, status: "complete", progress: 100, result_url: resultUrl } : item));
        setSelectedAsset(saved || { url: resultUrl, type: resultType, name: job.title });
        queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
        if (generationCount === 1) toast.success("✨ Generation complete!");
      } catch (error) {
        setJobs((prev) => prev.map((item) => item.id === jobId ? { ...item, status: "failed", progress: 100, error: error.message } : item));
        toast.error(`Generation failed: ${error.message}`);
      }
    }
    setIsGenerating(false);
    if (generationCount > 1) toast.success(`✨ Batch of ${generationCount} complete!`);
  };

  useEffect(() => {
    if (!embedded) navigate("/CreatorOS?section=artforge", { replace: true });
  }, [embedded, navigate]);

  const copyPrompt = async () => { await navigator.clipboard.writeText(pipelinePrompt); toast.success("Prompt copied"); };

  const handleSaveProject = async () => {
    try {
      await base44.entities.MediaAsset.create({
        name: `ArtForge Project · ${new Date().toLocaleDateString()}`,
        type: "project", asset_type: "template", category: "artforge_project",
        description: JSON.stringify({ mode, prompt, styles, aspect, quality }).slice(0, 2000),
        tags: ["artforge", "project", mode],
      });
      queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
      toast.success("Project saved");
    } catch { toast.error("Save failed"); }
  };

  const completedJobs = jobs.filter((j) => j.status === "complete" && j.result_url);
  const runningJobs = jobs.filter((j) => j.status === "running");
  const assetTypes = ["all", ...Array.from(new Set(assets.map((a) => a.type || a.category).filter(Boolean)))];

  const tabs = [
    { id: "generate", label: "Generate", icon: WandSparkles },
    { id: "gallery", label: "Gallery", icon: Grid3X3, badge: completedJobs.length || null },
    { id: "canvas", label: "Canvas", icon: Layers },
    { id: "workflow", label: "Workflow", icon: Workflow },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!embedded) return null;

  return (
    <div className="text-blue-50 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#1a3a60]/50 bg-[#06101f]/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899]">
            <WandSparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">ArtForge AI</h2>
            <p className="text-[10px] text-blue-200/40">Powered by Base44 + {provider === "base44" ? "Built-in" : PROVIDERS.find(p => p.id === provider)?.label}</p>
          </div>
          {runningJobs.length > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-3 py-1">
              <Loader2 className="h-3 w-3 animate-spin text-[#a855f7]" />
              <span className="text-xs font-black text-purple-300">{runningJobs.length} generating…</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> {completedJobs.length} created
          </span>
          <button onClick={handleSaveProject} className="rounded-xl border border-[#1a3a60]/60 px-3 py-1.5 text-xs font-black text-blue-200/60 hover:text-white transition">
            <Save className="mr-1.5 inline h-3 w-3" /> Save Project
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-[#1a3a60]/50 bg-[#06101f]/80 p-1.5">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cls("relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition",
              activeTab === id ? "bg-[#a855f7]/20 text-white border border-[#a855f7]/40" : "text-blue-200/45 hover:text-white hover:bg-white/5 border border-transparent")}>
            <Icon className="h-3.5 w-3.5" />{label}
            {badge > 0 && <span className="ml-0.5 rounded-full bg-[#a855f7] px-1.5 py-0.5 text-[9px] font-black text-white">{badge}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── GENERATE TAB ─────────────────────────────────────────────── */}
        {activeTab === "generate" && (
          <motion.div key="generate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">

            {/* Left: Mode + Settings */}
            <aside className="space-y-4">
              {/* Mode selector */}
              <Panel title="Creation Mode" icon={Sparkles}>
                <div className="grid grid-cols-2 gap-2">
                  {CREATION_MODES.map((item) => {
                    const Icon = item.icon;
                    const active = mode === item.id;
                    return (
                      <button key={item.id} onClick={() => handleModeChange(item)}
                        className={cls("relative group rounded-xl border p-2.5 text-left transition-all", active ? "border-[#a855f7]/60 bg-[#a855f7]/15 shadow-lg shadow-purple-950/30" : "border-[#1a3a60]/60 bg-[#03080f]/60 hover:border-[#a855f7]/30 hover:bg-[#a855f7]/5")}>
                        {item.badge && <span className="absolute right-2 top-2 rounded-full bg-[#a855f7] px-1.5 py-0.5 text-[8px] font-black text-white">{item.badge}</span>}
                        <div className={cls("mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", item.color)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-xs font-black text-white">{item.label}</div>
                        <p className="mt-0.5 text-[10px] text-blue-100/38 leading-4">{item.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </Panel>

              {/* Aspect ratio */}
              <Panel title="Aspect Ratio" icon={Crop}>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECTS.map((a) => <AspectButton key={a} value={a} current={aspect} onClick={() => setAspect(a)} />)}
                </div>
              </Panel>

              {/* Quality & Provider */}
              <Panel title="Output Settings" icon={Cpu}>
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Quality</FieldLabel>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[["draft", "Fast"], ["high", "High"], ["ultra", "Ultra"]].map(([val, lbl]) => (
                        <button key={val} onClick={() => setQuality(val)}
                          className={cls("rounded-lg border py-2 text-xs font-black transition", quality === val ? "border-[#a855f7]/60 bg-[#a855f7]/15 text-white" : "border-[#1a3a60]/60 text-blue-200/50 hover:text-white")}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Provider</FieldLabel>
                    <select value={provider} onChange={(e) => setProvider(e.target.value)}
                      className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7]">
                      {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <p className="mt-1 text-[10px] text-blue-200/30">{PROVIDERS.find((p) => p.id === provider)?.note}</p>
                  </div>
                  {mode !== "image" && (
                    <div>
                      <FieldLabel>Camera / Motion</FieldLabel>
                      <select value={camera} onChange={(e) => setCamera(e.target.value)}
                        className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7]">
                        {CAMERA_PRESETS.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {mode === "video" && (
                    <div>
                      <FieldLabel>Duration: {duration}s</FieldLabel>
                      <div className="flex gap-2">
                        {[4, 6, 8].map((d) => (
                          <button key={d} onClick={() => setDuration(d)}
                            className={cls("flex-1 rounded-lg border py-1.5 text-xs font-black transition", duration === d ? "border-[#a855f7]/60 bg-[#a855f7]/15 text-white" : "border-[#1a3a60]/60 text-blue-200/50 hover:text-white")}>
                            {d}s
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <FieldLabel>Batch Count</FieldLabel>
                    <div className="flex gap-2">
                      {[1, 2, 4].map((n) => (
                        <button key={n} onClick={() => setBatchCount(n)}
                          className={cls("flex-1 rounded-lg border py-1.5 text-xs font-black transition", batchCount === n ? "border-[#a855f7]/60 bg-[#a855f7]/15 text-white" : "border-[#1a3a60]/60 text-blue-200/50 hover:text-white")}>
                          ×{n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </aside>

            {/* Center: Specialty modes OR generic prompt */}
            <section className="space-y-4 min-w-0">
              {/* Specialty mode panels */}
              {mode === "tracer" && (
                <TracerMode
                  isGenerating={isGenerating}
                  selectedAsset={selectedAsset}
                  onGenerate={({ prompt: p, referenceImages: refs, quality: q, aspect: a }) => {
                    setPrompt(p); setReferenceImages(refs || []); setQuality(q || "high"); setAspect(a || "1:1");
                    setTimeout(() => handleGenerate(), 50);
                  }}
                />
              )}
              {mode === "hand_helper" && (
                <HandHelperMode
                  isGenerating={isGenerating}
                  selectedAsset={selectedAsset}
                  onGenerate={({ prompt: p, quality: q, aspect: a }) => {
                    setPrompt(p); setQuality(q || "high"); setAspect(a || "1:1");
                    setTimeout(() => handleGenerate(), 50);
                  }}
                />
              )}
              {mode === "3d_model" && (
                <Model3DMode
                  isGenerating={isGenerating}
                  selectedAsset={selectedAsset}
                  onGenerate={({ prompt: p, provider: prov, referenceImages: refs, quality: q, aspect: a }) => {
                    setPrompt(p); if (prov) setProvider(prov); setReferenceImages(refs || []); setQuality(q || "ultra"); setAspect(a || "1:1");
                    setTimeout(() => handleGenerate(), 50);
                  }}
                />
              )}
              {/* Generic prompt box for all other modes */}
              {!["tracer", "hand_helper", "3d_model"].includes(mode) && <Panel noPad>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CurrentModeIcon className="h-4 w-4 text-[#a855f7]" />
                      <span className="text-sm font-black text-white">{currentMode.label} Prompt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowPromptIdeas(!showPromptIdeas)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#1a3a60]/60 px-2.5 py-1.5 text-xs font-black text-blue-200/60 hover:text-white transition">
                        <Shuffle className="h-3 w-3" /> Ideas
                      </button>
                      <button onClick={handleEnhancePrompt} disabled={isEnhancing}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#a855f7]/20 to-[#1e78ff]/20 border border-[#a855f7]/30 px-3 py-1.5 text-xs font-black text-purple-200 hover:from-[#a855f7]/30 hover:to-[#1e78ff]/30 transition disabled:opacity-40">
                        {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                        AI Enhance
                      </button>
                    </div>
                  </div>

                  <textarea ref={promptRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
                    placeholder={currentMode.prompt}
                    className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm leading-6 text-white outline-none placeholder:text-blue-200/18 focus:border-[#a855f7]/60 transition" />

                  {/* Prompt ideas dropdown */}
                  <AnimatePresence>
                    {showPromptIdeas && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] overflow-hidden">
                        <p className="border-b border-[#1a3a60]/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-200/40">Prompt Inspiration</p>
                        <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                          {PROMPT_EXAMPLES.map((ex) => (
                            <button key={ex} onClick={() => { setPrompt(ex); setShowPromptIdeas(false); }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs text-blue-100/60 hover:bg-[#1e78ff]/10 hover:text-white transition">
                              {ex}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Style presets */}
                  <div>
                    <FieldLabel>Style Presets</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLE_PRESETS.map(({ label, emoji }) => (
                        <button key={label} onClick={() => toggleStyle(label)}
                          className={cls("rounded-full border px-2.5 py-1 text-[11px] font-bold transition",
                            styles.includes(label) ? "border-[#a855f7]/70 bg-[#a855f7]/20 text-white" : "border-[#1a3a60]/50 text-blue-200/40 hover:text-white hover:border-[#1a3a60]")}>
                          {emoji} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced toggle */}
                  <button onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs text-blue-200/40 hover:text-white transition">
                    <ChevronDown className={cls("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180")} />
                    Advanced options
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                        <div>
                          <FieldLabel>Negative Prompt</FieldLabel>
                          <input value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                            className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7]" />
                        </div>
                        <div>
                          <FieldLabel>Seed (for reproducible results)</FieldLabel>
                          <div className="flex gap-2">
                            <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)}
                              className="min-w-0 flex-1 rounded-lg border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-[#a855f7]" />
                            <button onClick={() => setSeed(Math.floor(Math.random() * 99999))}
                              className="rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-blue-300 hover:text-white transition" title="Randomize seed">
                              <Shuffle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reference images */}
                  <div className="rounded-xl border border-dashed border-[#1a3a60]/60 bg-[#030e1f]/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white">Reference Images <span className="text-blue-200/35">({referenceImages.length}/8)</span></p>
                        <p className="text-[10px] text-blue-200/30">Style, consistency, pose references — img2img</p>
                      </div>
                      <label className="cursor-pointer rounded-lg border border-[#1a3a60]/60 bg-[#030e1f] px-2.5 py-1.5 text-xs font-black text-blue-200/60 hover:text-white transition">
                        <ImagePlus className="mr-1 inline h-3 w-3" /> Add
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleReferenceUpload(e.target.files)} />
                      </label>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {referenceImages.length === 0
                        ? <p className="py-1 text-xs text-blue-200/25">No references — add images above for img2img</p>
                        : referenceImages.map((url) => (
                          <div key={url} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-[#1a3a60]/50 group">
                            <img src={url} alt="reference" className="h-full w-full object-cover" />
                            <button onClick={() => setReferenceImages((prev) => prev.filter((u) => u !== url))}
                              className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Generate button */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleGenerate} disabled={isGenerating}
                      className="flex flex-1 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#1e78ff] px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-950/40 transition hover:opacity-90 disabled:opacity-50">
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      {isGenerating ? "Generating…" : batchCount > 1 ? `Generate ×${batchCount}` : "Generate"}
                    </button>
                    <button onClick={copyPrompt} className="flex items-center gap-2 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-4 py-3 text-sm font-black text-blue-200 hover:bg-[#a855f7]/10 transition">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Panel>

              } {/* end !specialty modes */}

              {/* Preview / Output — shown for all non-specialty modes */}
              {!["tracer", "hand_helper", "3d_model"].includes(mode) && <Panel title="Latest Output" icon={Eye}
                action={selectedAsset?.url && (
                  <div className="flex gap-2">
                    <button onClick={() => { setPrompt(selectedAsset.description || prompt); toast.success("Loaded for variation"); }}
                      className="flex items-center gap-1 rounded-lg bg-[#1a3a60]/60 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/20 transition">
                      <RefreshCw className="h-3 w-3" /> Vary
                    </button>
                    <a href={selectedAsset.url || selectedAsset.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-[#1e78ff]/15 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/25 transition">
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                )}>
                <div className="relative grid min-h-[340px] place-items-center overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,.12),transparent_55%),linear-gradient(135deg,#030712,#071326_45%,#0d1f3d)]">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(168,85,247,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,.4) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
                  {isGenerating && (
                    <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-2 border-[#a855f7]/30 animate-ping absolute inset-0" />
                        <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#a855f7]/60 bg-[#a855f7]/15">
                          <Loader2 className="h-7 w-7 animate-spin text-[#a855f7]" />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-white">Generating {currentMode.label}…</p>
                        <p className="mt-1 text-sm text-blue-200/50">Cooking up something amazing ✨</p>
                      </div>
                    </div>
                  )}
                  {!isGenerating && (selectedAsset?.url || selectedAsset?.file_url) ? (
                    <div className="relative z-10 p-4 w-full flex flex-col items-center">
                      {selectedAsset.type === "video"
                        ? <video src={selectedAsset.url || selectedAsset.file_url} controls className="max-h-[400px] max-w-full rounded-xl shadow-2xl shadow-purple-950/40" />
                        : <img src={selectedAsset.url || selectedAsset.file_url} alt="output" className="max-h-[400px] max-w-full rounded-xl object-contain shadow-2xl shadow-purple-950/40" />}
                      <p className="mt-3 text-center text-xs text-blue-200/40">{selectedAsset.name}</p>
                    </div>
                  ) : !isGenerating && (
                    <div className="relative z-10 max-w-sm text-center px-6">
                      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#1e78ff]/20 border border-[#a855f7]/30">
                        <CurrentModeIcon className="h-8 w-8 text-[#a855f7]" />
                      </div>
                      <h2 className="text-lg font-black text-white">Your creation appears here</h2>
                      <p className="mt-2 text-sm text-blue-200/40">Write a prompt, pick a style, and hit Generate.</p>
                      <button onClick={() => { if (promptRef.current) promptRef.current.focus(); }}
                        className="mt-4 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/10 px-4 py-2 text-sm font-black text-purple-300 hover:bg-[#a855f7]/20 transition">
                        Start Creating →
                      </button>
                    </div>
                  )}
                </div>
              </Panel>}
            </section>

            {/* Right: Queue + Pipeline */}
            <aside className="space-y-4">
              {/* Render queue with mini thumbnails */}
              <Panel title={`Queue (${jobs.length})`} icon={Clock}
                action={jobs.length > 0 && (
                  <button onClick={() => setJobs([])} className="text-[10px] text-blue-200/35 hover:text-red-300 transition">Clear</button>
                )}>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {jobs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1a3a60]/50 p-5 text-center">
                      <p className="text-sm text-blue-200/30">No renders yet</p>
                    </div>
                  ) : jobs.slice(0, 12).map((job) => (
                    <button key={job.id} onClick={() => job.result_url && setSelectedAsset({ url: job.result_url, type: job.mode, name: job.title })}
                      className={cls("w-full rounded-xl border p-2.5 text-left transition flex items-center gap-3",
                        job.result_url ? "border-[#1a3a60]/50 hover:border-[#a855f7]/40" : "border-[#1a3a60]/40 cursor-default")}>
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[#030e1f] border border-[#1a3a60]/40">
                        {job.result_url
                          ? <img src={job.result_url} alt="" className="h-full w-full object-cover" />
                          : <div className="grid h-full place-items-center">
                            {job.status === "running" ? <Loader2 className="h-4 w-4 animate-spin text-[#a855f7]" /> : job.status === "failed" ? <X className="h-4 w-4 text-red-400" /> : <Clock className="h-4 w-4 text-blue-200/20" />}
                          </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-xs font-black text-white">{job.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <JobPill status={job.status} />
                        </div>
                        {job.status === "running" && (
                          <div className="mt-1.5 h-1 rounded-full bg-[#1a3a60]/50">
                            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#1e78ff] animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Pipeline preview */}
              <Panel title="Pipeline Prompt" icon={GitBranch}
                action={<button onClick={copyPrompt} className="rounded-lg p-1.5 text-blue-300/50 hover:text-white transition"><Copy className="h-3.5 w-3.5" /></button>}>
                <pre className="max-h-[180px] overflow-auto whitespace-pre-wrap rounded-xl border border-[#1a3a60]/40 bg-[#030e1f]/80 p-3 text-[11px] leading-5 text-blue-100/45">{pipelinePrompt}</pre>
              </Panel>

              {/* AI Memory */}
              <Panel title="AI Style Memory" icon={Brain}
                action={<button onClick={() => setMemory((prev) => [...prev, "New rule…"])}
                  className="rounded-lg bg-[#a855f7]/20 px-2.5 py-1.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30">
                  <Plus className="mr-1 inline h-3 w-3" />Add
                </button>}>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {memory.map((item, i) => (
                    <div key={i} className="flex gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-2.5">
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a855f7]/70" />
                      <textarea value={item} onChange={(e) => setMemory((prev) => prev.map((r, idx) => idx === i ? e.target.value : r))}
                        rows={2} className="min-h-8 flex-1 resize-none bg-transparent text-xs text-white outline-none" />
                      <button onClick={() => setMemory((prev) => prev.filter((_, idx) => idx !== i))} className="text-blue-200/25 hover:text-red-300 transition shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>
          </motion.div>
        )}

        {/* ── GALLERY TAB ──────────────────────────────────────────────── */}
        {activeTab === "gallery" && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Panel noPad>
              <div className="flex items-center gap-3 border-b border-[#1a3a60]/50 p-4">
                <WandSparkles className="h-4 w-4 text-[#a855f7]" />
                <h3 className="font-black text-white flex-1">Creations Gallery ({filteredAssets.length})</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-blue-300/40" />
                    <input value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Search…"
                      className="w-32 bg-transparent text-sm text-white outline-none placeholder:text-blue-300/25" />
                  </div>
                  <select value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)}
                    className="rounded-xl border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-xs text-white outline-none">
                    {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="flex rounded-xl border border-[#1a3a60]/60 overflow-hidden">
                    <button onClick={() => setGalleryView("grid")} className={cls("px-2.5 py-2 transition", galleryView === "grid" ? "bg-[#a855f7]/20 text-white" : "text-blue-200/40 hover:text-white")}>
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setGalleryView("list")} className={cls("px-2.5 py-2 transition", galleryView === "list" ? "bg-[#a855f7]/20 text-white" : "text-blue-200/40 hover:text-white")}>
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {/* Recent job grid */}
                {completedJobs.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#a855f7]/70">Just Created</p>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {completedJobs.slice(0, 12).map((job) => (
                        <GenerationCard key={job.id} job={job} onClick={() => setSelectedAsset({ url: job.result_url, type: job.mode, name: job.title })} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Saved assets */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/35">Saved Assets ({filteredAssets.length})</p>
                  {galleryView === "grid" ? (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {filteredAssets.map((asset) => (
                        <button key={asset.id} onClick={() => { setSelectedAsset(asset); setActiveTab("generate"); }}
                          className="group overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/80 text-left transition hover:border-[#a855f7]/50">
                          <div className="aspect-square bg-[#020812] overflow-hidden">
                            {(asset.url || asset.file_url || asset.thumbnail_url)
                              ? <img src={asset.thumbnail_url || asset.url || asset.file_url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              : <div className="grid h-full place-items-center text-blue-200/20"><WandSparkles className="h-8 w-8" /></div>}
                          </div>
                          <div className="p-2.5">
                            <p className="truncate text-xs font-black text-white">{asset.name || "Untitled"}</p>
                            <p className="mt-0.5 text-[10px] text-blue-200/35 capitalize">{asset.type || asset.category || "asset"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAssets.map((asset) => (
                        <button key={asset.id} onClick={() => { setSelectedAsset(asset); setActiveTab("generate"); }}
                          className="flex w-full items-center gap-3 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/80 p-3 text-left transition hover:border-[#a855f7]/40">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#020812]">
                            {(asset.url || asset.thumbnail_url) ? <img src={asset.thumbnail_url || asset.url} alt="" className="h-full w-full object-cover" /> : <WandSparkles className="h-5 w-5 text-blue-200/20 m-auto mt-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-black text-white">{asset.name || "Untitled"}</p>
                            <p className="text-xs text-blue-200/35 capitalize">{asset.type || asset.category || "asset"}</p>
                          </div>
                          <a href={asset.url || asset.file_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="rounded-lg p-1.5 text-blue-200/40 hover:text-white hover:bg-[#1a3a60]/60 transition">
                            <Download className="h-4 w-4" />
                          </a>
                        </button>
                      ))}
                    </div>
                  )}
                  {!filteredAssets.length && (
                    <div className="rounded-xl border border-dashed border-[#1a3a60]/50 p-12 text-center">
                      <WandSparkles className="mx-auto mb-3 h-10 w-10 text-[#a855f7]/25" />
                      <p className="font-black text-blue-200/50">No saved assets yet</p>
                      <p className="mt-1 text-xs text-blue-200/30">Generate something in the Studio tab to see it here.</p>
                      <button onClick={() => setActiveTab("generate")} className="mt-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#1e78ff] px-4 py-2 text-sm font-black text-white hover:opacity-90 transition">
                        Start Generating
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── CANVAS TAB ───────────────────────────────────────────────── */}
        {activeTab === "canvas" && (
          <motion.div key="canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid gap-4 xl:grid-cols-[1fr_280px]">
            <Panel title="Layer Canvas" icon={Layers}>
              <div className="relative min-h-[600px] overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[#050b14]">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(168,85,247,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,.25) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/90 p-1.5 backdrop-blur z-10">
                  {[MousePointer2, Move, Type, PenTool, Crop, FlipHorizontal, SlidersHorizontal].map((Icon, idx) => (
                    <button key={idx} className="grid h-8 w-8 place-items-center rounded-lg text-blue-200/40 hover:bg-[#a855f7]/20 hover:text-white transition">
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                {selectedAsset?.url ? (
                  <div className="absolute inset-0 grid place-items-center p-16">
                    <img src={selectedAsset.url} alt="canvas" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" style={{ opacity: layers[1]?.opacity / 100 || 1 }} />
                  </div>
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="h-[320px] w-[480px] rounded-2xl border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/5 to-[#1e78ff]/5 shadow-2xl shadow-purple-950/40 flex items-center justify-center">
                        <div className="text-center">
                          <WandSparkles className="mx-auto mb-3 h-10 w-10 text-[#a855f7]/30" />
                          <p className="text-sm font-black text-white/50">Generate an asset first</p>
                          <p className="mt-1 text-xs text-blue-200/25">Then use layers to composite and adjust</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/90 p-2 backdrop-blur text-xs text-blue-100/40">
                  <span>Canvas · {aspect}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {layers.filter(l => l.visible !== false).length} visible layers</span>
                </div>
              </div>
            </Panel>
            <Panel title="Layers" icon={Layers2}
              action={<button onClick={() => setLayers((prev) => [...prev, { id: uid("layer"), name: `Layer ${prev.length + 1}`, type: "paint", opacity: 100, locked: false, visible: true }])}
                className="rounded-lg bg-[#a855f7]/20 px-2.5 py-1.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30">
                <Plus className="mr-1 inline h-3 w-3" />Add
              </button>}>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <div key={layer.id} className="rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-blue-200/20 shrink-0" />
                      <input value={layer.name} onChange={(e) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, name: e.target.value } : l))}
                        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none" />
                      <button onClick={() => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, visible: !(l.visible !== false) } : l))}
                        className="text-blue-200/40 hover:text-white transition shrink-0">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))} className="text-blue-200/25 hover:text-red-300 transition shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <FieldLabel>Opacity {layer.opacity}%</FieldLabel>
                    <input type="range" min="0" max="100" value={layer.opacity}
                      onChange={(e) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, opacity: Number(e.target.value) } : l))}
                      className="w-full accent-[#a855f7]" />
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── WORKFLOW TAB ─────────────────────────────────────────────── */}
        {activeTab === "workflow" && (
          <motion.div key="workflow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <Panel title="Node Pipeline" icon={Workflow}
              action={<button onClick={() => setNodes((prev) => [...prev, { id: uid("node"), type: "Custom", label: "New Node", status: "ready" }])}
                className="rounded-lg bg-[#a855f7]/20 px-2.5 py-1.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30">
                <Plus className="mr-1 inline h-3 w-3" />Node
              </button>}>
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {nodes.map((node, index) => (
                  <div key={node.id} className="relative rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/70 p-4">
                    {index < nodes.length - 1 && <div className="absolute -right-3 top-1/2 z-10 hidden h-px w-3 bg-gradient-to-r from-[#a855f7]/50 to-[#1e78ff]/50 2xl:block" />}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#a855f7]/15 px-2 py-0.5 text-[10px] font-black text-purple-300">{node.type}</span>
                      <button onClick={() => setNodes((prev) => prev.filter((n) => n.id !== node.id))} className="text-blue-200/25 hover:text-red-300 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input value={node.label} onChange={(e) => setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, label: e.target.value } : n))}
                      className="mb-3 w-full bg-transparent text-sm font-black text-white outline-none" />
                    <JobPill status={node.status === "ready" ? "queued" : node.status} />
                  </div>
                ))}
              </div>
            </Panel>

            {/* Video Timeline */}
            <Panel title="Video Timeline" icon={Clock}
              action={<button onClick={() => setScenes((prev) => [...prev, { id: uid("scene"), name: `Scene ${prev.length + 1}`, seconds: 3, camera }])}
                className="rounded-lg bg-[#a855f7]/20 px-2.5 py-1.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30">
                <Plus className="mr-1 inline h-3 w-3" />Scene
              </button>}>
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                  <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#a855f7]/20 text-purple-200 hover:bg-[#a855f7]/30"><Play className="h-4 w-4" /></button>
                  <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1a3a60]/40 text-blue-200/60"><Pause className="h-4 w-4" /></button>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a3a60]/50">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#1e78ff]" />
                  </div>
                  <span className="shrink-0 text-sm font-black text-blue-100/60">{scenes.reduce((s, sc) => s + Number(sc.seconds || 0), 0)}s total</span>
                </div>
                <div className="space-y-2">
                  {scenes.map((scene, index) => (
                    <div key={scene.id} className="grid gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3 md:grid-cols-[50px_1fr_80px_130px_36px] md:items-center">
                      <div className="rounded-lg bg-[#a855f7]/15 p-2 text-center text-xs font-black text-purple-300">#{index + 1}</div>
                      <input value={scene.name} onChange={(e) => setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, name: e.target.value } : s))}
                        className="rounded-lg border border-[#1a3a60]/50 bg-[#030e1f] px-3 py-1.5 text-sm text-white outline-none focus:border-[#a855f7]" placeholder="Scene name" />
                      <div className="flex items-center gap-1">
                        <input type="number" min="1" max="60" value={scene.seconds} onChange={(e) => setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, seconds: Number(e.target.value) } : s))}
                          className="w-full rounded-lg border border-[#1a3a60]/50 bg-[#030e1f] px-2 py-1.5 text-sm text-white outline-none" />
                        <span className="shrink-0 text-xs text-blue-200/40">s</span>
                      </div>
                      <input value={scene.camera} onChange={(e) => setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, camera: e.target.value } : s))}
                        className="rounded-lg border border-[#1a3a60]/50 bg-[#030e1f] px-3 py-1.5 text-sm text-white outline-none" placeholder="Camera move" />
                      <button onClick={() => setScenes((prev) => prev.filter((s) => s.id !== scene.id))} className="text-blue-200/30 hover:text-red-300 transition justify-self-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Panel title="Prompt History" icon={History}
              action={promptHistory.length > 0 && (
                <button onClick={() => setPromptHistory([])} className="text-xs text-blue-200/35 hover:text-red-300 transition">Clear all</button>
              )}>
              {promptHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1a3a60]/50 p-10 text-center">
                  <History className="mx-auto mb-3 h-8 w-8 text-blue-200/20" />
                  <p className="font-black text-blue-200/40">No history yet</p>
                  <p className="mt-1 text-xs text-blue-200/25">Your prompt history appears here after generating.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {promptHistory.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a855f7]/15">
                        {(() => { const m = CREATION_MODES.find(m => m.id === entry.mode); const MIcon = m?.icon || WandSparkles; return <MIcon className="h-4 w-4 text-[#a855f7]" />; })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 line-clamp-2">{entry.prompt}</p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-[#a855f7]/15 px-2 py-0.5 text-[10px] font-black text-purple-300 capitalize">{entry.mode}</span>
                          {entry.styles?.slice(0, 2).map((s) => <span key={s} className="rounded-full bg-[#1a3a60]/60 px-2 py-0.5 text-[10px] text-blue-200/50">{s}</span>)}
                          <span className="text-[10px] text-blue-200/30">{new Date(entry.date).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => { setPrompt(entry.prompt); setMode(entry.mode); setStyles(entry.styles || []); setActiveTab("generate"); toast.success("Prompt restored"); }}
                        className="shrink-0 rounded-lg border border-[#1a3a60]/60 px-2.5 py-1.5 text-xs font-black text-blue-200/60 hover:text-white hover:border-[#a855f7]/40 transition">
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </motion.div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4 md:grid-cols-2">
            <Panel title="AI Provider Setup" icon={Settings}>
              <div className="space-y-3">
                {PROVIDERS.map((item) => (
                  <div key={item.id} className={cls("rounded-xl border p-4", item.id === "base44" ? "border-emerald-500/30 bg-emerald-500/5" : "border-[#1a3a60]/50 bg-[#030e1f]/60")}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <h4 className="font-black text-white">{item.label}</h4>
                      {item.id === "base44"
                        ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300">ACTIVE</span>
                        : <span className="rounded-full border border-[#1a3a60]/50 px-2 py-0.5 text-[10px] text-blue-200/35">API KEY NEEDED</span>}
                    </div>
                    <p className="text-xs text-blue-200/40">{item.note}</p>
                    {item.id !== "base44" && <p className="mt-1.5 text-[10px] text-blue-200/25">Set in: Dashboard → Settings → Environment Variables</p>}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="AI Style Memory" icon={Brain}
              action={<button onClick={() => setMemory((prev) => [...prev, "New style rule…"])}
                className="rounded-lg bg-[#a855f7]/20 px-2.5 py-1.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30">
                <Plus className="mr-1 inline h-3 w-3" />Add Rule
              </button>}>
              <p className="mb-3 text-xs text-blue-200/40">These rules are automatically appended to every generation prompt.</p>
              <div className="space-y-2">
                {memory.map((item, i) => (
                  <div key={i} className="flex gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                    <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#a855f7]/70" />
                    <textarea value={item} onChange={(e) => setMemory((prev) => prev.map((r, idx) => idx === i ? e.target.value : r))}
                      rows={2} className="min-h-8 flex-1 resize-none bg-transparent text-sm text-white outline-none" />
                    <button onClick={() => setMemory((prev) => prev.filter((_, idx) => idx !== i))} className="text-blue-200/25 hover:text-red-300 transition shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}