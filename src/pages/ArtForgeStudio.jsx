import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles, Layers, Box, Film, Smile, LayoutGrid, Hand, PenTool, Workflow, Image,
  Video, Brain, Sparkles, Plus, Trash2, Copy, Download, Save, Play, Pause, Upload,
  Settings, Cpu, Database, GitBranch, Clock, CheckCircle2, AlertTriangle, Loader2,
  GripVertical, SlidersHorizontal, MousePointer2, Type, Scissors, Search, Star, X,
  Zap, RefreshCw, Eye, ChevronRight, Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CREATION_MODES = [
  { id: "image", label: "Art", icon: WandSparkles, hint: "Text or reference image to finished art", prompt: "A cinematic neon cyberpunk dragon over a rainy city, dramatic lighting, ultra-sharp detail, 8K", color: "from-blue-500 to-violet-500" },
  { id: "2d_model", label: "2D Model", icon: Layers, hint: "Sprite sheets, PNGTuber states", prompt: "Cute streamer mascot character sheet with idle, talking, happy, angry, and surprised states, clean white background", color: "from-violet-500 to-fuchsia-500" },
  { id: "3d_model", label: "3D Model", icon: Box, hint: "Text to 3D asset planning", prompt: "Stylized VTuber desk companion robot, rounded body, glowing blue eyes, game-ready low-poly", color: "from-orange-500 to-violet-500" },
  { id: "sticker", label: "Sticker", icon: Smile, hint: "Transparent sticker packs and emotes", prompt: "Kawaii blue fire mascot sticker pack with bold outline, transparent background, expressive face", color: "from-amber-400 to-orange-500" },
  { id: "comic", label: "Comic", icon: LayoutGrid, hint: "Panels, captions, speech bubbles", prompt: "Four-panel comic about a streamer discovering a magical AI art forge, vibrant manga style", color: "from-emerald-500 to-blue-500" },
  { id: "video", label: "Video", icon: Film, hint: "AI-generated short video clips", prompt: "Vertical short: camera pushes through a glowing creator studio into a 3D art portal, cinematic", color: "from-pink-500 to-violet-500" },
  { id: "tracer", label: "Tracer", icon: PenTool, hint: "Pose tracing and line guides", prompt: "Clean tracing guide for a dynamic anime running pose with construction lines and anatomy notes", color: "from-cyan-400 to-blue-500" },
  { id: "hand_helper", label: "Hand Helper", icon: Hand, hint: "Hands, fingers, gesture refs", prompt: "Hand reference sheet: open palm, fist, pointing, peace sign, holding microphone, anatomically correct", color: "from-rose-400 to-pink-600" },
];

const PROVIDERS = [
  { id: "base44", label: "Base44 Core", note: "Built-in — no key needed" },
  { id: "openai", label: "OpenAI DALL·E", note: "Requires OPENAI_API_KEY" },
  { id: "stability", label: "Stability AI", note: "Requires STABILITY_API_KEY" },
  { id: "replicate", label: "Replicate", note: "Requires REPLICATE_API_TOKEN" },
  { id: "tripo3d", label: "Tripo3D", note: "Best for 3D — Requires TRIPO3D_API_KEY" },
];

const STYLE_PRESETS = ["Cinematic", "Anime", "Pixel Art", "VTuber", "Photoreal", "Comic Ink", "Sticker", "3D Toy", "Low Poly", "Neon Noir", "Watercolor", "Storyboard", "Hand Study", "Tracing Guide"];
const CAMERA_PRESETS = ["Static", "Slow push-in", "Orbit", "Dolly zoom", "Handheld", "Parallax", "Top-down", "POV"];
const ASPECTS = ["16:9", "9:16", "1:1", "4:5", "21:9"];

function safeJsonParse(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function cls(...parts) { return parts.filter(Boolean).join(" "); }

function Panel({ title, icon: Icon, children, action, className = "" }) {
  return (
    <section className={cls("rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 shadow-xl shadow-black/30 backdrop-blur", className)}>
      {(title || Icon) && (
        <div className="flex items-center justify-between border-b border-[#1a3a60]/50 px-4 py-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-[#00c8ff]" />}
            {title && <h3 className="text-sm font-black text-white">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-blue-200/55">{children}</label>;
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

function ModeButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className={cls("group rounded-xl border p-3 text-left transition-all duration-200", active ? "border-[#00c8ff]/60 bg-[#00c8ff]/10 shadow-lg shadow-blue-950/40" : "border-[#1a3a60]/60 bg-[#03080f]/60 hover:border-[#1e78ff]/50 hover:bg-[#1e78ff]/8")}>
      <div className={cls("mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white", item.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-black text-white">{item.label}</div>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-blue-100/40">{item.hint}</p>
    </button>
  );
}

export default function ArtForgeStudio({ embedded = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("studio");
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
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const currentMode = CREATION_MODES.find((item) => item.id === mode) || CREATION_MODES[0];
  const CurrentModeIcon = currentMode.icon;

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
      const matchText = !q || `${asset.name || ""} ${asset.description || ""} ${asset.category || ""}`.toLowerCase().includes(q);
      return matchText;
    });
  }, [assets, assetSearch]);

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
    const uploaded = [];
    for (const file of fileList.slice(0, 6)) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) uploaded.push(res.file_url);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (uploaded.length) {
      setReferenceImages((prev) => [...prev, ...uploaded].slice(0, 8));
      toast.success(`Added ${uploaded.length} reference image${uploaded.length > 1 ? "s" : ""}`);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Rewrite this into a production-grade AI image/video generation prompt for "${currentMode.label}". Keep the user's idea, add: composition, lighting, style, camera angle, technical quality notes. Return ONLY the improved prompt, no preamble.\n\nIdea: ${prompt}`,
      });
      const text = typeof response === "string" ? response : response?.text || response?.content || "";
      if (text) {
        setPrompt(text.slice(0, 1500).trim());
        toast.success("Prompt enhanced by AI");
      }
    } catch (error) {
      toast.error("Prompt enhancer failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Enter a description first"); return; }
    setIsGenerating(true);
    const jobId = uid("job");
    const job = { id: jobId, title: `${currentMode.label}: ${prompt.slice(0, 50)}`, mode, provider, status: "running", progress: 20, created_at: new Date().toISOString() };
    setJobs((prev) => [job, ...prev]);
    setNodes((prev) => prev.map((node, i) => ({ ...node, status: i === 2 ? "running" : "ready" })));

    try {
      let resultUrl;
      let resultType = mode;

      // Try backend function first
      try {
        const response = await base44.functions.invoke("generateArtForgeAsset", {
          mode, provider, prompt: pipelinePrompt, negativePrompt, aspectRatio: aspect,
          durationSeconds: duration, seed, quality, referenceImages, layers, nodes, scenes,
        });
        const data = response?.data || response;
        resultUrl = data?.url || data?.assetUrl || data?.modelUrl || data?.videoUrl;
        resultType = data?.type || resultType;
      } catch (_) {}

      // Fallback to built-in integrations
      if (!resultUrl) {
        if (mode === "video") {
          const video = await base44.integrations.Core.GenerateVideo({ prompt: pipelinePrompt, duration: Math.min(duration, 8), aspect_ratio: aspect === "9:16" ? "9:16" : "16:9" });
          resultUrl = video?.url;
          resultType = "video";
        } else {
          const image = await base44.integrations.Core.GenerateImage({
            prompt: pipelinePrompt,
            existing_image_urls: referenceImages.length ? referenceImages : undefined,
          });
          resultUrl = image?.url;
          resultType = ["tracer", "hand_helper"].includes(mode) ? "image" : mode;
        }
      }

      if (!resultUrl) throw new Error("No result returned from provider");

      const saved = await base44.entities.MediaAsset.create({
        name: `${currentMode.label} · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        type: resultType,
        asset_type: mode === "video" ? "export" : "graphic",
        url: resultUrl,
        file_url: resultUrl,
        thumbnail_url: resultUrl,
        category: mode,
        description: prompt.slice(0, 500),
        tags: ["artforge", mode, ...styles.slice(0, 4)],
      });

      setJobs((prev) => prev.map((item) => item.id === jobId ? { ...item, status: "complete", progress: 100, result_url: resultUrl } : item));
      setNodes((prev) => prev.map((node) => ({ ...node, status: "complete" })));
      setSelectedAsset(saved || { url: resultUrl, type: resultType, name: job.title });
      queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
      toast.success("Generation complete!");
    } catch (error) {
      setJobs((prev) => prev.map((item) => item.id === jobId ? { ...item, status: "failed", progress: 100, error: error.message } : item));
      setNodes((prev) => prev.map((node, i) => ({ ...node, status: i === 2 ? "failed" : node.status })));
      toast.error(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async () => { await navigator.clipboard.writeText(pipelinePrompt); toast.success("Prompt copied"); };

  const handleSaveProject = async () => {
    try {
      await base44.entities.MediaAsset.create({
        name: `ArtForge Project · ${new Date().toLocaleDateString()}`,
        type: "project",
        asset_type: "template",
        category: "artforge_project",
        description: JSON.stringify({ mode, prompt, styles, aspect, quality }).slice(0, 2000),
        tags: ["artforge", "project", mode],
      });
      queryClient.invalidateQueries({ queryKey: ["artforge-assets"] });
      toast.success("Project saved");
    } catch { toast.error("Save failed"); }
  };

  const tabs = [
    { id: "studio", label: "Studio", icon: WandSparkles },
    { id: "canvas", label: "Canvas", icon: Layers },
    { id: "workflow", label: "Nodes", icon: Workflow },
    { id: "timeline", label: "Timeline", icon: Video },
    { id: "assets", label: "Assets", icon: Database },
    { id: "providers", label: "Providers", icon: Settings },
  ];

  return (
    <div className={embedded ? "text-blue-50" : "min-h-screen bg-[#020712] text-blue-50"}>
      {!embedded && (
        <div className="sticky top-0 z-30 border-b border-[#1a3a60]/50 bg-[#020712]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] shadow-lg shadow-blue-950/60">
                <WandSparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-white">ArtForge AI Studio</h1>
                  <span className="rounded-full border border-[#00c8ff]/30 bg-[#00c8ff]/10 px-2 py-0.5 text-[10px] font-black text-[#00c8ff]">BETA</span>
                </div>
                <p className="text-xs text-blue-200/45">AI art, video, stickers, 3D models and more</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={cls("flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition",
                    activeTab === id ? "border-[#1e78ff]/60 bg-[#1e78ff]/15 text-white" : "border-[#1a3a60]/50 bg-transparent text-blue-200/50 hover:border-[#1e78ff]/40 hover:text-white")}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={embedded ? "grid gap-4 p-3 xl:grid-cols-[260px_minmax(0,1fr)_280px]" : "mx-auto grid max-w-[1800px] gap-4 px-4 py-4 lg:px-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]"}>
        {/* Left sidebar */}
        <aside className="space-y-4">
          <Panel title="Creation Mode" icon={Sparkles}>
            <div className="grid grid-cols-2 gap-2">
              {CREATION_MODES.map((item) => (
                <ModeButton key={item.id} item={item} active={mode === item.id} onClick={() => handleModeChange(item)} />
              ))}
            </div>
          </Panel>

          <Panel title="Output Settings" icon={Cpu}>
            <div className="space-y-3">
              <div>
                <FieldLabel>AI Provider</FieldLabel>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]">
                  {PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <p className="mt-1 text-[11px] text-blue-200/35">{PROVIDERS.find((p) => p.id === provider)?.note}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Aspect</FieldLabel>
                  <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]">
                    {ASPECTS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Quality</FieldLabel>
                  <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]">
                    <option value="draft">Draft</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </div>
              {mode !== "image" && (
                <div>
                  <FieldLabel>Camera / Motion</FieldLabel>
                  <select value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]">
                    {CAMERA_PRESETS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {mode === "video" && (
                <div>
                  <FieldLabel>Duration: {duration}s</FieldLabel>
                  <input type="range" min="4" max="8" step="2" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-[#1e78ff]" />
                  <div className="flex justify-between text-[10px] text-blue-200/35"><span>4s</span><span>6s</span><span>8s</span></div>
                </div>
              )}
              <div>
                <FieldLabel>Seed (reproducible results)</FieldLabel>
                <div className="flex gap-2">
                  <input value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)} className="min-w-0 flex-1 rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]" />
                  <button onClick={() => setSeed(Math.floor(Math.random() * 99999))} className="rounded-lg border border-[#1a3a60]/60 bg-[#03080f] px-2 py-2 text-blue-300 hover:text-white">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        </aside>

        {/* Center content */}
        <section className="min-w-0 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === "studio" && (
              <motion.div key="studio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <Panel title={`${currentMode.label} Generator`} icon={currentMode.icon}
                  action={
                    <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 rounded-lg bg-[#a855f7]/15 px-3 py-1.5 text-xs font-black text-purple-300 transition hover:bg-[#a855f7]/25 disabled:opacity-40">
                      {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                      AI Enhance
                    </button>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>Describe your creation</FieldLabel>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
                        placeholder={currentMode.prompt}
                        className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm leading-6 text-white outline-none placeholder:text-blue-200/20 focus:border-[#1e78ff]" />
                    </div>

                    <div>
                      <FieldLabel>Style Presets</FieldLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {STYLE_PRESETS.map((style) => (
                          <button key={style} onClick={() => toggleStyle(style)}
                            className={cls("rounded-full border px-2.5 py-1 text-[11px] font-bold transition",
                              styles.includes(style) ? "border-[#1e78ff]/70 bg-[#1e78ff]/20 text-white" : "border-[#1a3a60]/50 bg-transparent text-blue-200/40 hover:text-white")}>
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Negative Prompt</FieldLabel>
                      <input value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                        className="w-full rounded-lg border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-[#1e78ff]" />
                    </div>

                    {/* Reference images */}
                    <div className="rounded-xl border border-dashed border-[#1a3a60]/60 bg-[#030e1f]/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-white">Reference Images</p>
                          <p className="text-[11px] text-blue-200/35">Style, character consistency, pose references</p>
                        </div>
                        <label className="cursor-pointer rounded-lg bg-[#1e78ff]/20 px-3 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/30">
                          <Upload className="mr-1 inline h-3 w-3" /> Upload
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleReferenceUpload(e.target.files)} />
                        </label>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {referenceImages.length === 0
                          ? <p className="py-2 text-xs text-blue-200/30">No references — drag or upload images above</p>
                          : referenceImages.map((url) => (
                            <div key={url} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-[#1a3a60]/50">
                              <img src={url} alt="reference" className="h-full w-full object-cover" />
                              <button onClick={() => setReferenceImages((prev) => prev.filter((u) => u !== url))} className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-red-600/80">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={handleGenerate} disabled={isGenerating}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1e78ff] to-[#a855f7] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-950/40 transition hover:opacity-90 disabled:opacity-50">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {isGenerating ? "Generating…" : "Generate"}
                      </button>
                      <button onClick={copyPrompt} className="flex items-center gap-2 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-4 py-2.5 text-sm font-black text-blue-200 hover:bg-[#1e78ff]/10">
                        <Copy className="h-4 w-4" /> Copy Prompt
                      </button>
                      <button onClick={handleSaveProject} className="flex items-center gap-2 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-4 py-2.5 text-sm font-black text-blue-200 hover:bg-[#1e78ff]/10">
                        <Save className="h-4 w-4" /> Save Project
                      </button>
                    </div>
                  </div>
                </Panel>

                {/* Preview panel */}
                <Panel title="Output Preview" icon={Image}
                  action={selectedAsset?.url && (
                    <a href={selectedAsset.url || selectedAsset.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-[#1e78ff]/15 px-3 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/25">
                      <Download className="h-3 w-3" /> Download
                    </a>
                  )}>
                  <div className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[radial-gradient(circle_at_50%_35%,rgba(30,120,255,.18),transparent_50%),linear-gradient(135deg,#030712,#071b33_45%,#0d1f3d)]">
                    <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(30,120,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,120,255,.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                    {isGenerating && (
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 px-6 py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-[#1e78ff]" />
                          <div>
                            <p className="font-black text-white">Generating {currentMode.label}…</p>
                            <p className="text-sm text-blue-200/50">This may take 10–30 seconds</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!isGenerating && (selectedAsset?.url || selectedAsset?.file_url) ? (
                      <div className="relative z-10 p-4">
                        {selectedAsset.type === "video"
                          ? <video src={selectedAsset.url || selectedAsset.file_url} controls className="max-h-[360px] max-w-full rounded-xl shadow-2xl" />
                          : <img src={selectedAsset.url || selectedAsset.file_url} alt="output" className="max-h-[360px] max-w-full rounded-xl object-contain shadow-2xl" />}
                        <p className="mt-2 text-center text-xs text-blue-200/40">{selectedAsset.name}</p>
                      </div>
                    ) : !isGenerating && (
                      <div className="relative z-10 max-w-sm text-center">
                        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#1e78ff]/15 text-[#1e78ff]">
                          <CurrentModeIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-black text-white">Your output appears here</h2>
                        <p className="mt-2 text-sm text-blue-200/40">Write a prompt, pick a style, and hit Generate.</p>
                      </div>
                    )}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "canvas" && (
              <motion.div key="canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4 xl:grid-cols-[1fr_280px]">
                <Panel title="Layer Canvas" icon={Layers}>
                  <div className="relative min-h-[600px] overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[#050b14]">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(30,120,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,120,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div className="absolute left-3 top-3 flex gap-1.5 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/90 p-1.5 backdrop-blur">
                      {[MousePointer2, Type, PenTool, Scissors, SlidersHorizontal].map((Icon, idx) => (
                        <button key={idx} className="grid h-8 w-8 place-items-center rounded-lg text-blue-200/50 hover:bg-[#1e78ff]/20 hover:text-white transition">
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
                        <div className="h-[320px] w-[500px] rounded-2xl border border-[#1e78ff]/20 bg-gradient-to-br from-[#1e78ff]/8 to-[#a855f7]/8 shadow-2xl shadow-blue-950/40" />
                      </div>
                    )}
                    <p className="absolute bottom-3 left-3 right-3 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/90 p-3 text-xs text-blue-100/45 backdrop-blur">
                      Generate an asset first, then use layers to composite and adjust opacity.
                    </p>
                  </div>
                </Panel>
                <Panel title="Layers" icon={GripVertical}
                  action={<button onClick={() => setLayers((prev) => [...prev, { id: uid("layer"), name: `Layer ${prev.length + 1}`, type: "paint", opacity: 100, locked: false }])}
                    className="rounded-lg bg-[#1e78ff]/20 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/30">
                    <Plus className="mr-1 inline h-3 w-3" />Add
                  </button>}>
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div key={layer.id} className="rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-blue-200/25 shrink-0" />
                          <input value={layer.name} onChange={(e) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, name: e.target.value } : l))}
                            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none" />
                          <button onClick={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))} className="text-blue-200/30 hover:text-red-300 transition shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <FieldLabel>Opacity {layer.opacity}%</FieldLabel>
                        <input type="range" min="0" max="100" value={layer.opacity}
                          onChange={(e) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, opacity: Number(e.target.value) } : l))}
                          className="w-full accent-[#1e78ff]" />
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "workflow" && (
              <motion.div key="workflow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Panel title="Node Pipeline" icon={Workflow}
                  action={<button onClick={() => setNodes((prev) => [...prev, { id: uid("node"), type: "Custom", label: "New Node", status: "ready" }])}
                    className="rounded-lg bg-[#1e78ff]/20 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/30">
                    <Plus className="mr-1 inline h-3 w-3" />Node
                  </button>}>
                  <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                    {nodes.map((node, index) => (
                      <div key={node.id} className="relative rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/70 p-4">
                        {index < nodes.length - 1 && <div className="absolute -right-3 top-1/2 z-10 hidden h-px w-3 bg-gradient-to-r from-[#1e78ff]/50 to-[#a855f7]/50 2xl:block" />}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full bg-[#1e78ff]/15 px-2 py-0.5 text-[10px] font-black text-blue-300">{node.type}</span>
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
                  <p className="mt-4 text-xs text-blue-200/35">Nodes execute sequentially when you hit Generate. Drag to reorder (coming soon).</p>
                </Panel>
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Panel title="Video Timeline" icon={Clock}
                  action={<button onClick={() => setScenes((prev) => [...prev, { id: uid("scene"), name: `Scene ${prev.length + 1}`, seconds: 3, camera }])}
                    className="rounded-lg bg-[#1e78ff]/20 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/30">
                    <Plus className="mr-1 inline h-3 w-3" />Scene
                  </button>}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1e78ff]/20 text-blue-200 hover:bg-[#1e78ff]/30"><Play className="h-4 w-4" /></button>
                      <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1a3a60]/40 text-blue-200/60 hover:bg-[#1a3a60]/70"><Pause className="h-4 w-4" /></button>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a3a60]/50">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7]" />
                      </div>
                      <span className="shrink-0 text-sm font-black text-blue-100/60">{scenes.reduce((s, scene) => s + Number(scene.seconds || 0), 0)}s total</span>
                    </div>
                    <div className="space-y-2">
                      {scenes.map((scene, index) => (
                        <div key={scene.id} className="grid gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3 md:grid-cols-[50px_1fr_80px_130px_36px] md:items-center">
                          <div className="rounded-lg bg-[#1e78ff]/15 p-2 text-center text-xs font-black text-blue-300">#{index + 1}</div>
                          <input value={scene.name} onChange={(e) => setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, name: e.target.value } : s))}
                            className="rounded-lg border border-[#1a3a60]/50 bg-[#030e1f] px-3 py-1.5 text-sm text-white outline-none focus:border-[#1e78ff]" placeholder="Scene name" />
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

            {activeTab === "assets" && (
              <motion.div key="assets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Panel title={`Asset Library (${filteredAssets.length})`} icon={Database}
                  action={
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-blue-200/35" />
                      <input value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Search…"
                        className="rounded-lg border border-[#1a3a60]/50 bg-[#030e1f] py-1.5 pl-7 pr-3 text-xs text-white outline-none focus:border-[#1e78ff]" />
                    </div>
                  }>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredAssets.map((asset) => (
                      <button key={asset.id} onClick={() => { setSelectedAsset(asset); setActiveTab("studio"); }}
                        className="group overflow-hidden rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/80 text-left transition hover:border-[#1e78ff]/50">
                        <div className="aspect-video bg-[#030e1f] overflow-hidden">
                          {(asset.url || asset.file_url || asset.thumbnail_url)
                            ? <img src={asset.thumbnail_url || asset.url || asset.file_url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="grid h-full place-items-center text-blue-200/20"><Database className="h-8 w-8" /></div>}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-black text-white">{asset.name || "Untitled"}</p>
                          <p className="mt-0.5 text-[11px] text-blue-200/40">{asset.type || asset.category || "asset"}</p>
                        </div>
                      </button>
                    ))}
                    {!filteredAssets.length && (
                      <div className="col-span-full rounded-xl border border-dashed border-[#1a3a60]/50 p-10 text-center">
                        <Database className="mx-auto mb-3 h-8 w-8 text-blue-200/20" />
                        <p className="font-black text-blue-200/50">No assets yet</p>
                        <p className="mt-1 text-xs text-blue-200/30">Generate something in Studio tab first.</p>
                      </div>
                    )}
                  </div>
                </Panel>
              </motion.div>
            )}

            {activeTab === "providers" && (
              <motion.div key="providers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <Panel title="AI Provider Setup" icon={Settings}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {PROVIDERS.map((item) => (
                      <div key={item.id} className={cls("rounded-xl border p-4", item.id === "base44" ? "border-emerald-500/30 bg-emerald-500/5" : "border-[#1a3a60]/50 bg-[#030e1f]/60")}>
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-black text-white">{item.label}</h4>
                          {item.id === "base44"
                            ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300">ACTIVE</span>
                            : <span className="rounded-full border border-[#1a3a60]/50 px-2 py-0.5 text-[10px] text-blue-200/40">API KEY NEEDED</span>}
                        </div>
                        <p className="text-xs text-blue-200/45">{item.note}</p>
                        {item.id !== "base44" && (
                          <p className="mt-2 text-[11px] text-blue-200/30">Set in: Dashboard → Settings → Environment Variables</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="AI Project Memory" icon={Brain}
                  action={<button onClick={() => setMemory((prev) => [...prev, "New rule…"])}
                    className="rounded-lg bg-[#1e78ff]/20 px-2.5 py-1.5 text-xs font-black text-blue-200 hover:bg-[#1e78ff]/30">
                    <Plus className="mr-1 inline h-3 w-3" />Add Rule
                  </button>}>
                  <div className="space-y-2">
                    {memory.map((item, index) => (
                      <div key={index} className="flex gap-2 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-3">
                        <Star className="mt-0.5 h-4 w-4 shrink-0 text-[#1e78ff]/70" />
                        <textarea value={item} onChange={(e) => setMemory((prev) => prev.map((r, i) => i === index ? e.target.value : r))}
                          rows={2} className="min-h-8 flex-1 resize-none bg-transparent text-sm text-white outline-none" />
                        <button onClick={() => setMemory((prev) => prev.filter((_, i) => i !== index))} className="text-blue-200/30 hover:text-red-300 transition shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <Panel title="Render Queue" icon={Clock}>
            <div className="space-y-2">
              {jobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#1a3a60]/50 p-5 text-center">
                  <p className="text-sm text-blue-200/35">No renders yet</p>
                </div>
              )}
              {jobs.slice(0, 8).map((job) => (
                <button key={job.id} onClick={() => job.result_url && setSelectedAsset({ url: job.result_url, type: job.mode, name: job.title })}
                  className={cls("w-full rounded-xl border p-3 text-left transition",
                    job.result_url ? "border-[#1a3a60]/50 hover:border-[#1e78ff]/50" : "border-[#1a3a60]/40 cursor-default")}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-xs font-black text-white">{job.title}</p>
                    <JobPill status={job.status} />
                  </div>
                  <div className="h-1 rounded-full bg-[#1a3a60]/50">
                    <div className={cls("h-full rounded-full transition-all", job.status === "failed" ? "bg-red-500" : "bg-gradient-to-r from-[#1e78ff] to-[#a855f7]")} style={{ width: `${job.progress || 0}%` }} />
                  </div>
                  {job.error && <p className="mt-1.5 text-[11px] text-red-300">{job.error}</p>}
                </button>
              ))}
              {jobs.length > 0 && (
                <button onClick={() => setJobs([])} className="w-full rounded-xl border border-[#1a3a60]/40 py-2 text-xs text-blue-200/35 hover:text-red-300 transition">Clear queue</button>
              )}
            </div>
          </Panel>

          <Panel title="Pipeline Prompt" icon={GitBranch}
            action={<button onClick={copyPrompt} className="rounded-lg p-1.5 text-blue-300/50 hover:text-white transition"><Copy className="h-3.5 w-3.5" /></button>}>
            <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-xl border border-[#1a3a60]/40 bg-[#030e1f]/80 p-3 text-[11px] leading-5 text-blue-100/50">{pipelinePrompt}</pre>
          </Panel>

          {selectedAsset?.url && (
            <Panel title="Selected Output" icon={Eye}>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-[#1a3a60]/50">
                  {selectedAsset.type === "video"
                    ? <video src={selectedAsset.url} controls className="w-full" />
                    : <img src={selectedAsset.url || selectedAsset.file_url} alt="selected" className="w-full" />}
                </div>
                <p className="text-xs font-black text-white">{selectedAsset.name}</p>
                <a href={selectedAsset.url || selectedAsset.file_url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1e78ff]/15 px-4 py-2.5 text-sm font-black text-blue-200 transition hover:bg-[#1e78ff]/25">
                  <Download className="h-4 w-4" /> Open / Download
                </a>
              </div>
            </Panel>
          )}

          <Panel title="Quick Links" icon={ChevronRight}>
            <div className="space-y-1.5">
              {[
                { label: "Creator Studio", href: "/CreatorOS" },
                { label: "Media Library", href: "/MediaLibrary" },
                { label: "Thumbnail Maker", href: "/ThumbnailMaker" },
                { label: "Video Editor", href: "/VideoEditor" },
              ].map(({ label, href }) => (
                <Link key={href} to={href} className="flex items-center justify-between rounded-lg border border-[#1a3a60]/40 bg-[#030e1f]/60 px-3 py-2 text-xs font-black text-blue-200/60 transition hover:border-[#1e78ff]/40 hover:text-white">
                  {label}<ChevronRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}