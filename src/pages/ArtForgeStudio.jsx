import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles, Layers, Box, Plus, X, Sparkles, Download,
  RefreshCw, Image, LayoutGrid, Clock, Trash2, FileText,
  Loader2, Copy, Check, Type, Tag, Lightbulb, Heart,
  Search, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Generation modes ──────────────────────────────────────────────────────────
const MODES = [
  {
    id: "image",
    label: "Image",
    desc: "AI artwork from text",
    icon: WandSparkles,
    gradient: "from-[#1e78ff] to-[#a855f7]",
    placeholder: "A surreal landscape with floating crystals in a violet sky, hyper-detailed digital painting...",
    suffix: "",
  },
  {
    id: "2d_model",
    label: "2D / Sprite",
    desc: "Flat art & sprite sheets",
    icon: Layers,
    gradient: "from-[#a855f7] to-[#1e78ff]",
    placeholder: "A pixel art character sprite, 16-bit style, flat shading, transparent background...",
    suffix: ", sprite art, flat 2D design, transparent background",
  },
  {
    id: "3d_model",
    label: "3D Render",
    desc: "Textured 3D model render",
    icon: Box,
    gradient: "from-[#f97316] to-[#a855f7]",
    placeholder: "A low-poly 3D fox character, textured, suitable for a VRM avatar, anime style...",
    suffix: ", 3D render, textured model, isometric view, studio lighting",
  },
];

// ─── Style tags ────────────────────────────────────────────────────────────────
const STYLE_TAGS = [
  "Cinematic", "Anime", "Pixel Art", "Oil Painting", "Watercolor",
  "Neon Noir", "Photorealistic", "Sketch", "Fantasy", "Sci-Fi",
  "Minimalist", "Dark & Moody", "Vibrant", "Retro", "Cyberpunk",
];

// ─── Content tools ────────────────────────────────────────────────────────────
const CONTENT_TOOLS = {
  titles: {
    label: "Title Generator",
    desc: "SEO-optimized video titles",
    icon: Type,
    color: "from-[#1e78ff] to-[#3b82f6]",
    prompt: (input) => `Generate 5 catchy, SEO-optimized YouTube video titles for: "${input}". Make them engaging and clickable. Format as a numbered list.`,
  },
  descriptions: {
    label: "Description Writer",
    desc: "Engaging video descriptions",
    icon: FileText,
    color: "from-[#a855f7] to-[#8b5cf6]",
    prompt: (input) => `Write a professional, engaging YouTube video description for a video about: "${input}". Include a hook, main content overview, and a CTA. Keep it under 300 words.`,
  },
  tags: {
    label: "Tag Suggester",
    desc: "Relevant tags for discovery",
    icon: Tag,
    color: "from-[#22c55e] to-[#16a34a]",
    prompt: (input) => `Suggest 20 highly relevant YouTube tags for a video about "${input}". Return them as a comma-separated list, ordered by relevance.`,
  },
  thumbnails: {
    label: "Thumbnail Ideas",
    desc: "Design concepts & layouts",
    icon: Lightbulb,
    color: "from-[#f97316] to-[#ea580c]",
    prompt: (input) => `Suggest 3 compelling YouTube thumbnail design concepts for: "${input}". For each, describe: the main visual element, color scheme, text overlay, and emotional impact.`,
  },
};

// ─── Gallery filter types ──────────────────────────────────────────────────────
const GALLERY_FILTERS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: Image },
  { id: "2d_model", label: "2D", icon: Layers },
  { id: "3d_model", label: "3D", icon: Box },
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function ArtForgeStudio() {
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [refImages, setRefImages] = useState([]);
  const [results, setResults] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [activeStyleTags, setActiveStyleTags] = useState([]);

  const [galleryFilter, setGalleryFilter] = useState("all");
  const [gallerySearch, setGallerySearch] = useState("");

  const [selectedTool, setSelectedTool] = useState("titles");
  const [contentInput, setContentInput] = useState("");
  const [contentOutput, setContentOutput] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState("studio");

  const queryClient = useQueryClient();

  const { data: gallery = [] } = useQuery({
    queryKey: ["media-assets-gallery"],
    queryFn: () => base44.entities.MediaAsset.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = gallery
    .filter(g => galleryFilter === "all" || g.type === galleryFilter)
    .filter(g => !gallerySearch || g.name?.toLowerCase().includes(gallerySearch.toLowerCase()) || g.description?.toLowerCase().includes(gallerySearch.toLowerCase()));

  const currentMode = MODES.find(m => m.id === mode);

  const toggleStyleTag = (tag) => {
    setActiveStyleTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const buildPrompt = () => {
    const styleStr = activeStyleTags.length > 0 ? `, ${activeStyleTags.join(", ")}` : "";
    return `${prompt}${styleStr}${currentMode?.suffix || ""}`;
  };

  // ── Visual generation ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please describe your vision"); return; }
    setGenLoading(true);
    setResults([]);
    try {
      const finalPrompt = buildPrompt();
      const generateOne = () => base44.integrations.Core.GenerateImage({
        prompt: finalPrompt,
        existing_image_urls: refImages.length > 0 ? refImages : undefined,
      });

      const responses = await Promise.all(Array.from({ length: batchCount }, generateOne));
      const urls = responses.map(r => r.url);
      setResults(urls);

      await Promise.all(urls.map(url =>
        base44.entities.MediaAsset.create({
          name: prompt.slice(0, 60),
          url,
          type: mode,
          description: finalPrompt,
        })
      ));
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success(`${urls.length} creation${urls.length > 1 ? "s" : ""} saved to gallery!`);
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.MediaAsset.delete(id);
    queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
    toast.success("Deleted");
  };

  const handleToggleFavorite = async (item) => {
    await base44.entities.MediaAsset.update(item.id, { is_favorite: !item.is_favorite });
    queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
  };

  // ── Content tools ────────────────────────────────────────────────────────────
  const handleContentGenerate = async () => {
    if (!contentInput.trim()) return;
    setContentLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: CONTENT_TOOLS[selectedTool].prompt(contentInput),
        add_context_from_internet: false,
      });
      setContentOutput(res);
    } catch {
      setContentOutput("Error generating content. Please try again.");
    }
    setContentLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contentOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* ── Header ── */}
      <div className="border-b border-[#1e78ff]/20 bg-[#030810]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center shadow-lg shadow-blue-900/40">
              <WandSparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">ArtForge</span>
              <span className="text-[10px] text-blue-400/40 ml-2 hidden sm:inline">AI Creative Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: "studio", label: "Studio", icon: Sparkles },
              { id: "content", label: "Content Tools", icon: FileText },
              { id: "gallery", label: "Gallery", icon: LayoutGrid },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-[#1e78ff]/20 text-[#1e78ff] border border-[#1e78ff]/40"
                    : "text-blue-400/50 hover:text-blue-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── Studio Tab ── */}
          {activeTab === "studio" && (
            <motion.div key="studio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
                  Creative Studio
                </h1>
                <p className="text-blue-400/50 text-sm mt-1.5">Transform your ideas into stunning visuals and models</p>
              </div>

              {/* Mode pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {MODES.map(m => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setResults([]); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r " + m.gradient + " text-white border-transparent shadow-lg"
                          : "border-blue-900/40 text-blue-400/60 hover:border-blue-700/60 hover:text-blue-300 bg-[#060d18]/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Main layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left panel: Input */}
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm"
                >
                  {/* Reference images */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">
                      Reference Images <span className="font-normal normal-case opacity-70">(optional)</span>
                    </p>
                    <label className="cursor-pointer rounded-xl border-2 border-dashed border-blue-900/40 px-4 py-3 text-center transition-all hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/5 flex items-center justify-center gap-2 group">
                      <Plus className="w-4 h-4 text-blue-400/40 group-hover:text-[#1e78ff] transition-colors" />
                      <p className="text-sm text-blue-400/50 group-hover:text-blue-300 transition-colors">
                        Add reference images <span className="text-[#1e78ff]">or drop here</span>
                      </p>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setRefImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                        }}
                      />
                    </label>
                    {refImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {refImages.map((url, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-blue-900/40 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Describe your vision</p>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={currentMode?.placeholder}
                      rows={4}
                      className="w-full bg-[#0a1525]/80 border border-blue-900/40 rounded-xl p-3 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                    />
                  </div>

                  {/* Style tags */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Style Modifiers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleStyleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                            activeStyleTags.includes(tag)
                              ? "bg-[#1e78ff]/20 border-[#1e78ff]/60 text-[#1e78ff]"
                              : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Batch count + Generate */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#0a1525] border border-blue-900/40 rounded-xl px-3 py-2">
                      <span className="text-xs text-blue-400/50 font-medium whitespace-nowrap">How many?</span>
                      <button
                        onClick={() => setBatchCount(c => Math.max(1, c - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-900/30 text-blue-400/60 hover:text-blue-300 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-[#c8dff5] w-4 text-center">{batchCount}</span>
                      <button
                        onClick={() => setBatchCount(c => Math.min(4, c + 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-900/30 text-blue-400/60 hover:text-blue-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={genLoading || !prompt.trim()}
                      className="flex-1 h-11 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2 text-white font-semibold rounded-xl disabled:opacity-30 transition-opacity border-0"
                    >
                      {genLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                        : <><Sparkles className="w-4 h-4" /> Generate {batchCount > 1 ? `${batchCount} Images` : ""}</>
                      }
                    </Button>
                  </div>
                </motion.div>

                {/* Right panel: Results */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col min-h-[400px]"
                >
                  <AnimatePresence mode="wait">
                    {genLoading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full border-4 border-[#1e78ff]/20 animate-ping" />
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/20 to-[#a855f7]/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-[#1e78ff]/60 animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-blue-400/50 font-medium">Crafting your vision...</p>
                        <p className="text-xs text-blue-400/30">{batchCount > 1 ? `Generating ${batchCount} images` : "This takes a few seconds"}</p>
                      </motion.div>
                    ) : results.length > 0 ? (
                      <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 h-full">
                        <div className={`grid gap-3 ${results.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {results.map((url, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden border border-blue-900/30">
                              <img src={url} alt={`Result ${i + 1}`} className="w-full object-contain rounded-xl" style={{ maxHeight: results.length === 1 ? "420px" : "240px" }} />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                                <a href={url} download={`artforge-${i + 1}.png`} target="_blank" rel="noopener noreferrer">
                                  <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-black/70 text-white/80 hover:bg-black/90 transition-colors">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <Button variant="outline" onClick={handleGenerate} disabled={genLoading} className="flex-1 gap-1.5 text-sm">
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                          <Button variant="ghost" onClick={() => setActiveTab("gallery")} className="gap-1.5 text-sm">
                            <LayoutGrid className="w-3.5 h-3.5" /> View Gallery
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center px-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 border border-blue-900/20 flex items-center justify-center mb-4">
                          <WandSparkles className="w-9 h-9 text-[#1e78ff]/30" />
                        </div>
                        <p className="text-base font-semibold text-blue-400/40">Your creation will appear here</p>
                        <p className="text-sm text-blue-400/25 mt-1">Enter a prompt and hit generate</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Content Tools Tab ── */}
          {activeTab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
                  Content Tools
                </h1>
                <p className="text-blue-400/50 text-sm mt-1.5">AI-powered writing and SEO tools for your videos</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(CONTENT_TOOLS).map(([key, tool]) => {
                  const Icon = tool.icon;
                  const isActive = selectedTool === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedTool(key); setContentOutput(""); setContentInput(""); }}
                      className={`p-4 rounded-2xl border transition-all text-left group ${
                        isActive
                          ? "bg-[#0a1525] border-[#1e78ff]/50"
                          : "bg-[#060d18]/50 border-blue-900/30 hover:border-blue-900/60"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-70"} transition-opacity`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-xs font-bold ${isActive ? "text-[#e8f4ff]" : "text-blue-400/60"}`}>{tool.label}</p>
                      <p className="text-[10px] text-blue-400/30 mt-0.5">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider">Your Topic / Input</p>
                  <textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder={`Describe your video for ${CONTENT_TOOLS[selectedTool].label.toLowerCase()}...`}
                    rows={6}
                    className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-xl p-4 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                  />
                  <Button
                    onClick={handleContentGenerate}
                    disabled={contentLoading || !contentInput.trim()}
                    className="w-full gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0 hover:opacity-90"
                  >
                    {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider">Output</p>
                  <div className="relative w-full h-[168px] bg-[#060d18]/60 border border-blue-900/30 rounded-xl p-4 text-sm text-[#c8dff5] overflow-y-auto">
                    {contentLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-[#1e78ff]/50 animate-spin" />
                          <p className="text-xs text-blue-400/30">Generating...</p>
                        </div>
                      </div>
                    ) : contentOutput ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{contentOutput}</p>
                    ) : (
                      <p className="text-blue-400/20 flex items-center justify-center h-full text-center">
                        Results will appear here...
                      </p>
                    )}
                  </div>
                  {contentOutput && (
                    <button
                      onClick={copyToClipboard}
                      className="w-full bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-blue-900/30"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Output"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Gallery Tab ── */}
          {activeTab === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#e8f4ff]">My Gallery</h1>
                  <p className="text-blue-400/50 text-sm mt-1">
                    {gallery.length} creation{gallery.length !== 1 ? "s" : ""} — private to you
                  </p>
                </div>
                <Button onClick={() => setActiveTab("studio")} className="gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0 self-start sm:self-auto">
                  <Sparkles className="w-4 h-4" /> Create New
                </Button>
              </div>

              {/* Filters + Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-1.5 flex-wrap">
                  {GALLERY_FILTERS.map(f => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setGalleryFilter(f.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          galleryFilter === f.id
                            ? "bg-[#1e78ff]/20 border-[#1e78ff]/50 text-[#1e78ff]"
                            : "border-blue-900/30 text-blue-400/50 hover:border-blue-700/50 hover:text-blue-300"
                        }`}
                      >
                        <Icon className="w-3 h-3" /> {f.label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/30" />
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-full pl-9 pr-4 py-1.5 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/40 transition-colors"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 border border-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-9 h-9 text-[#1e78ff]/30" />
                  </div>
                  <p className="text-blue-400/40 font-semibold">No creations yet</p>
                  <p className="text-blue-400/25 text-sm mt-1">Head to the studio to start creating</p>
                  <Button onClick={() => setActiveTab("studio")} className="mt-4 gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0">
                    <WandSparkles className="w-4 h-4" /> Open Studio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="group relative rounded-2xl overflow-hidden border border-blue-900/30 bg-[#060d18]/60 hover:border-[#1e78ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#050a14]">
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-blue-400/20" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              onClick={() => handleToggleFavorite(item)}
                              className={`h-7 w-7 flex items-center justify-center rounded-lg bg-black/70 transition-colors ${item.is_favorite ? "text-red-400" : "text-white/60 hover:text-red-400"}`}
                            >
                              <Heart className="w-3.5 h-3.5" fill={item.is_favorite ? "currentColor" : "none"} />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-xs text-white/70 line-clamp-2 mb-2">{item.description || item.name}</p>
                            <div className="flex gap-1.5">
                              {item.url && (
                                <a href={item.url} download target="_blank" rel="noopener noreferrer" className="flex-1">
                                  <button className="w-full h-7 flex items-center justify-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors">
                                    <Download className="w-3 h-3" /> Save
                                  </button>
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Favorite indicator */}
                        {item.is_favorite && (
                          <div className="absolute top-2 left-2">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/80">
                              <Heart className="w-3 h-3 text-white" fill="currentColor" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.type === "image" ? "bg-[#1e78ff]/20 text-[#1e78ff]"
                            : item.type === "2d_model" ? "bg-[#a855f7]/20 text-[#a855f7]"
                            : "bg-orange-500/20 text-orange-400"
                          }`}>
                            {item.type === "image" ? <Image className="w-2.5 h-2.5" /> : item.type === "2d_model" ? <Layers className="w-2.5 h-2.5" /> : <Box className="w-2.5 h-2.5" />}
                            {item.type === "image" ? "Image" : item.type === "2d_model" ? "2D" : "3D"}
                          </span>
                          <span className="text-[10px] text-blue-400/30 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.created_date ? format(new Date(item.created_date), "MMM d") : ""}
                          </span>
                        </div>
                        <p className="text-xs text-blue-400/50 mt-1.5 line-clamp-1">{item.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}