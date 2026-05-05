import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles, Layers, Box, Plus, X, Sparkles, Download,
  RefreshCw, Image, LayoutGrid, Clock, Trash2, FileText,
  Loader2, Copy, Check, Type, Tag, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Generation modes ────────────────────────────────────────────────────────
const MODES = [
  {
    id: "image",
    label: "Generate Image",
    desc: "Text prompt + optional reference photos",
    icon: WandSparkles,
    gradient: "from-[#1e78ff] to-[#a855f7]",
    placeholder: "A surreal landscape with floating crystals in a violet sky, hyper-detailed digital painting...",
  },
  {
    id: "2d_model",
    label: "Generate 2D Model",
    desc: "Sprite / flat artwork with export",
    icon: Layers,
    gradient: "from-[#a855f7] to-[#1e78ff]",
    placeholder: "A pixel art character sprite, 16-bit style, flat shading, transparent background...",
  },
  {
    id: "3d_model",
    label: "Generate 3D Model",
    desc: "Textured 3D with Blender & VRM export",
    icon: Box,
    gradient: "from-[#1e78ff] via-[#a855f7] to-[#1e78ff]",
    placeholder: "A low-poly 3D fox character, textured, suitable for a VRM avatar, anime style...",
  },
];

// ─── Content tools config ─────────────────────────────────────────────────────
const CONTENT_TOOLS = {
  titles: {
    label: "Title Generator",
    desc: "SEO-optimized video titles",
    icon: Type,
    prompt: (input) => `Generate 5 catchy, SEO-optimized YouTube video titles for: "${input}". Make them engaging and clickable.`,
  },
  descriptions: {
    label: "Description Writer",
    desc: "Engaging video descriptions",
    icon: FileText,
    prompt: (input) => `Write a professional, engaging YouTube video description for a video about: "${input}". Include hooks and CTAs.`,
  },
  tags: {
    label: "Tag Suggester",
    desc: "Relevant tags for discovery",
    icon: Tag,
    prompt: (input) => `Suggest 15 relevant YouTube tags for a video about "${input}". Return as comma-separated list.`,
  },
  thumbnails: {
    label: "Thumbnail Ideas",
    desc: "Design concepts & layouts",
    icon: Lightbulb,
    prompt: (input) => `Suggest 3 compelling YouTube thumbnail design ideas for: "${input}". Include color schemes and layout suggestions.`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArtForgeStudio() {
  // Visual generation state
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [refImages, setRefImages] = useState([]);
  const [result, setResult] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  // Gallery state
  const [galleryFilter, setGalleryFilter] = useState("all");

  // Content tools state
  const [selectedTool, setSelectedTool] = useState("titles");
  const [contentInput, setContentInput] = useState("");
  const [contentOutput, setContentOutput] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active top-level tab
  const [activeTab, setActiveTab] = useState("studio");

  const queryClient = useQueryClient();

  const { data: gallery = [] } = useQuery({
    queryKey: ["media-assets-gallery"],
    queryFn: () => base44.entities.MediaAsset.list("-created_date", 100),
    staleTime: 30000,
  });

  const filtered = galleryFilter === "all" ? gallery : gallery.filter(g => g.type === galleryFilter);
  const currentMode = MODES.find(m => m.id === mode);

  // ── Visual generation ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please describe your vision"); return; }
    setGenLoading(true);
    setResult(null);
    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `${prompt}${mode === "2d_model" ? ", sprite art, flat 2D design" : mode === "3d_model" ? ", 3D render, textured model, isometric view" : ""}`,
        existing_image_urls: refImages.length > 0 ? refImages : undefined,
      });
      setResult(url);
      await base44.entities.MediaAsset.create({
        name: prompt.slice(0, 60),
        url,
        type: mode === "image" ? "image" : mode,
        description: prompt,
      });
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success("Creation saved to gallery!");
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

  // ── Content tools ──────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      {/* Header */}
      <div className="border-b border-blue-900/40 bg-[#03080f]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center">
              <WandSparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">ArtForge</span>
          </div>
          <div className="flex gap-1">
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
                    : "text-blue-400/60 hover:text-blue-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── Studio Tab ─────────────────────────────────────────────────── */}
          {activeTab === "studio" && (
            <motion.div key="studio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">Creative Studio</h1>
                <p className="text-blue-400/50 text-sm mt-2">Transform your ideas into stunning visuals and 2D/3D models</p>
              </div>

              {/* Mode selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {MODES.map(m => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setResult(null); }}
                      className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${isActive ? "border-[#1e78ff]/50 bg-[#1e78ff]/10" : "border-blue-900/40 bg-[#060d18]/50 hover:border-blue-900/60"}`}
                    >
                      {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1e78ff]/5 to-[#a855f7]/5 pointer-events-none" />}
                      <div className="relative flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${m.gradient} ${isActive ? "opacity-100" : "opacity-40"} transition-opacity`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isActive ? "text-[#e8f4ff]" : "text-blue-400/60"}`}>{m.label}</p>
                          <p className="text-xs text-blue-400/40 mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Split panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Input */}
                <motion.div key={mode} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 bg-[#060d18]/50 border border-blue-900/40 rounded-2xl p-6 backdrop-blur-sm">
                  {/* Reference images */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-blue-400/60">
                      Reference Images <span className="font-normal text-blue-400/30">(optional)</span>
                    </label>
                    <label className="cursor-pointer rounded-xl border-2 border-dashed border-blue-900/40 p-5 text-center transition-all hover:border-[#1e78ff]/30 hover:bg-[#1e78ff]/5 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4 text-blue-400/40" />
                      <p className="text-sm text-blue-400/50">Add reference images <span className="text-[#1e78ff]">or drop here</span></p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setRefImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                        }}
                      />
                    </label>
                    {refImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {refImages.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-900/40 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-blue-400/60">Describe your vision</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={currentMode?.placeholder}
                      rows={5}
                      className="w-full min-h-[120px] bg-[#0a1525]/80 border border-blue-900/40 rounded-xl p-3 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={genLoading || !prompt.trim()}
                      className="w-full h-12 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2 text-white font-semibold rounded-xl disabled:opacity-30 transition-opacity"
                    >
                      {genLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                        : <><Sparkles className="w-4 h-4" /> Generate</>}
                    </Button>
                  </div>
                </motion.div>

                {/* Right: Result */}
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#060d18]/50 border border-blue-900/40 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 h-full">
                        <img src={result} alt="Generated" className="w-full rounded-xl object-contain border border-blue-900/30 max-h-[500px]" />
                        <div className="flex gap-2 mt-auto">
                          <Button variant="outline" onClick={() => { setResult(null); handleGenerate(); }} disabled={genLoading} className="flex-1 gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                          <a href={result} download="artforge-creation.png" target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full gap-1.5"><Download className="w-3.5 h-3.5" /> Download</Button>
                          </a>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 flex items-center justify-center mb-4">
                          <Sparkles className="w-10 h-10 text-[#1e78ff]/30" />
                        </div>
                        <p className="text-lg font-semibold text-blue-400/40">Your creation will appear here</p>
                        <p className="text-sm text-blue-400/25 mt-1">Enter a prompt and hit generate</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Content Tools Tab ──────────────────────────────────────────── */}
          {activeTab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">Content Tools</h1>
                <p className="text-blue-400/50 text-sm mt-2">AI-powered SEO and content writing for your videos</p>
              </div>

              {/* Tool selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(CONTENT_TOOLS).map(([key, tool]) => {
                  const Icon = tool.icon;
                  const isActive = selectedTool === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedTool(key); setContentOutput(""); setContentInput(""); }}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        isActive
                          ? "bg-[#1e78ff]/20 border-[#1e78ff]/50 text-[#1e78ff]"
                          : "bg-[#060d18]/50 border-blue-900/40 text-blue-400/60 hover:border-blue-900/60"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-2" />
                      <p className="text-xs font-bold">{tool.label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Input / Output */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400/60 uppercase">Input</label>
                  <textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder={`Describe your video topic for the ${CONTENT_TOOLS[selectedTool].label.toLowerCase()}...`}
                    className="w-full h-40 bg-[#0a1525] border border-blue-900/30 rounded-xl p-3 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none"
                  />
                  <Button
                    onClick={handleContentGenerate}
                    disabled={contentLoading || !contentInput.trim()}
                    className="w-full gap-2"
                  >
                    {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400/60 uppercase">Output</label>
                  <div className="w-full h-40 bg-[#0a1525] border border-blue-900/30 rounded-xl p-3 text-sm text-[#c8dff5] overflow-y-auto">
                    {contentOutput
                      ? <p className="whitespace-pre-wrap">{contentOutput}</p>
                      : <p className="text-blue-400/20">Results will appear here...</p>}
                  </div>
                  {contentOutput && (
                    <button
                      onClick={copyToClipboard}
                      className="w-full bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Output"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Gallery Tab ────────────────────────────────────────────────── */}
          {activeTab === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#e8f4ff]">Gallery</h1>
                  <p className="text-blue-400/50 text-sm mt-1">{gallery.length} creation{gallery.length !== 1 ? "s" : ""}</p>
                </div>
                <Tabs value={galleryFilter} onValueChange={setGalleryFilter}>
                  <TabsList className="bg-[#060d18]/80 border border-blue-900/40">
                    <TabsTrigger value="all" className="text-xs gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> All</TabsTrigger>
                    <TabsTrigger value="image" className="text-xs gap-1.5"><Image className="w-3.5 h-3.5" /> Images</TabsTrigger>
                    <TabsTrigger value="2d_model" className="text-xs gap-1.5"><Layers className="w-3.5 h-3.5" /> 2D Models</TabsTrigger>
                    <TabsTrigger value="3d_model" className="text-xs gap-1.5"><Box className="w-3.5 h-3.5" /> 3D Models</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-9 h-9 text-[#1e78ff]/30" />
                  </div>
                  <p className="text-blue-400/40 font-semibold">No creations yet</p>
                  <p className="text-blue-400/25 text-sm mt-1">Generate something in the Studio!</p>
                  <Button onClick={() => setActiveTab("studio")} className="mt-4 gap-2"><Sparkles className="w-4 h-4" /> Go to Studio</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative rounded-xl overflow-hidden border border-blue-900/40 bg-[#060d18]/50 hover:border-[#1e78ff]/30 transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {item.url ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#050a14]">
                            <Sparkles className="w-10 h-10 text-blue-400/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-xs text-white/70 line-clamp-2 mb-2">{item.description || item.name}</p>
                            <div className="flex gap-1.5">
                              {item.url && (
                                <a href={item.url} download target="_blank" rel="noopener noreferrer">
                                  <button className="h-7 w-7 flex items-center justify-center rounded-md text-white/80 hover:bg-white/20 transition-colors">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-md text-white/80 hover:bg-red-500/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.type === "image" ? "bg-[#1e78ff]/20 text-[#1e78ff]"
                            : item.type === "2d_model" ? "bg-[#a855f7]/20 text-[#a855f7]"
                            : "bg-orange-500/20 text-orange-400"
                          }`}>
                            {item.type === "image" ? <Image className="w-3 h-3" /> : item.type === "2d_model" ? <Layers className="w-3 h-3" /> : <Box className="w-3 h-3" />}
                            {item.type === "image" ? "Image" : item.type === "2d_model" ? "2D Model" : "3D Model"}
                          </span>
                          <span className="text-[10px] text-blue-400/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.created_date ? format(new Date(item.created_date), "MMM d") : ""}
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-2 line-clamp-1 text-blue-400/60">{item.name}</p>
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