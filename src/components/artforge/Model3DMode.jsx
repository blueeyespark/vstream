import { useState } from "react";
import { Box, Loader2, Download, Zap, ImagePlus, X, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const MODEL_CATEGORIES = [
  { id: "character", label: "Character", emoji: "🧑‍🎨", examples: ["anime girl", "fantasy warrior", "sci-fi robot"] },
  { id: "creature", label: "Creature", emoji: "🐉", examples: ["dragon", "wolf companion", "alien beast"] },
  { id: "prop", label: "Prop / Item", emoji: "⚔️", examples: ["magic sword", "treasure chest", "gaming controller"] },
  { id: "vehicle", label: "Vehicle", emoji: "🚀", examples: ["spaceship", "cyberpunk bike", "fantasy airship"] },
  { id: "environment", label: "Environment", emoji: "🏔️", examples: ["island", "dungeon room", "forest clearing"] },
  { id: "building", label: "Building", emoji: "🏯", examples: ["castle tower", "futuristic base", "cozy shop"] },
];

const POLY_STYLES = [
  { id: "game_ready", label: "Game Ready", desc: "Optimized, low-poly, UV-mapped" },
  { id: "high_poly", label: "High Detail", desc: "Subdivision-ready, ultra-detailed" },
  { id: "low_poly", label: "Low Poly", desc: "Stylized geometric aesthetic" },
  { id: "vtuber", label: "VTuber", desc: "Riggable character model" },
  { id: "3d_print", label: "3D Print", desc: "Watertight for printing" },
];

const TEXTURE_STYLES = [
  { id: "pbr", label: "PBR Textures", emoji: "✨" },
  { id: "toon", label: "Cel / Toon", emoji: "🎨" },
  { id: "untextured", label: "White Clay", emoji: "⬜" },
  { id: "anime", label: "Anime Style", emoji: "⛩️" },
];

const EXPORT_FORMATS = ["GLB", "OBJ", "FBX", "STL", "USDZ"];

export default function Model3DMode({ onGenerate, isGenerating, selectedAsset }) {
  const [inputType, setInputType] = useState("text"); // "text" | "image"
  const [textPrompt, setTextPrompt] = useState("");
  const [category, setCategory] = useState("character");
  const [polyStyle, setPolyStyle] = useState("game_ready");
  const [textureStyle, setTextureStyle] = useState("pbr");
  const [selectedFormats, setSelectedFormats] = useState(["GLB"]);
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleFormat = (fmt) => setSelectedFormats((prev) =>
    prev.includes(fmt) ? (prev.length > 1 ? prev.filter((f) => f !== fmt) : prev) : [...prev, fmt]
  );

  const handleImageUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target.result);
    reader.readAsDataURL(file);
    setIsUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      if (res?.file_url) setSourceImage(res.file_url);
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  const buildPrompt = () => {
    const cat = MODEL_CATEGORIES.find((c) => c.id === category);
    const poly = POLY_STYLES.find((p) => p.id === polyStyle);
    const tex = TEXTURE_STYLES.find((t) => t.id === textureStyle);

    if (inputType === "image" && sourcePreview) {
      return `Convert this reference image into a high-quality 3D model. Category: ${cat?.label}. Style: ${poly?.label} — ${poly?.desc}. Textures: ${tex?.label}. Export-ready for ${selectedFormats.join("/")}. Game engine compatible, clean topology, proper UV mapping.`;
    }

    return [
      `Create a stunning 3D model of: ${textPrompt || "a detailed 3D object"}.`,
      `Category: ${cat?.label}.`,
      `Polygon style: ${poly?.label} — ${poly?.desc}.`,
      `Texture: ${tex?.label}.`,
      `Format: ${selectedFormats.join(", ")}.`,
      `Requirements: clean topology, proper edge loops, UV unwrapped, game-engine-ready, centered at origin.`,
      polyStyle === "vtuber" ? "Include rigging-ready joint locations, blend shape targets." : "",
      polyStyle === "3d_print" ? "Watertight mesh, no non-manifold geometry, supports-optional orientation." : "",
    ].filter(Boolean).join(" ");
  };

  const handleGenerate = () => {
    if (inputType === "text" && !textPrompt.trim()) {
      toast.error("Describe what 3D model you want");
      return;
    }
    if (inputType === "image" && !sourceImage) {
      toast.error("Upload a reference image first");
      return;
    }
    onGenerate({
      prompt: buildPrompt(),
      mode: "3d_model",
      provider: "tripo3d",
      referenceImages: sourceImage ? [sourceImage] : [],
      quality: "ultra",
      aspect: "1:1",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-violet-500">
            <Box className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">Tripo3D Generator</h3>
            <p className="text-xs text-blue-200/45">Text → 3D or Image → 3D · Game-ready · Exportable</p>
          </div>
        </div>

        {/* Input type toggle */}
        <div className="flex rounded-xl border border-[#1a3a60]/60 overflow-hidden">
          <button onClick={() => setInputType("text")}
            className={`flex-1 py-2.5 text-xs font-black transition ${inputType === "text" ? "bg-orange-500/20 text-white border-r border-[#1a3a60]/60" : "text-blue-200/40 hover:text-white"}`}>
            📝 Text to 3D
          </button>
          <button onClick={() => setInputType("image")}
            className={`flex-1 py-2.5 text-xs font-black transition ${inputType === "image" ? "bg-orange-500/20 text-white" : "text-blue-200/40 hover:text-white"}`}>
            🖼️ Image to 3D
          </button>
        </div>
      </div>

      {/* Text input */}
      {inputType === "text" && (
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-200/50">Describe Your Model</p>
          <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} rows={4}
            placeholder="e.g. Stylized anime warrior girl with glowing sword, fantasy armor, game-ready character…"
            className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm text-white outline-none focus:border-orange-500/60 placeholder:text-blue-200/20" />
          {/* Example prompts */}
          <div className="mt-3">
            <p className="mb-2 text-[10px] text-blue-200/35">Quick examples:</p>
            <div className="flex flex-wrap gap-1.5">
              {MODEL_CATEGORIES.find(c => c.id === category)?.examples.map((ex) => (
                <button key={ex} onClick={() => setTextPrompt(ex)}
                  className="rounded-full border border-[#1a3a60]/50 px-2.5 py-1 text-[11px] text-blue-200/40 hover:text-white hover:border-orange-500/40 transition">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image input */}
      {inputType === "image" && (
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Reference Image</p>
          <div
            onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-xl border-2 border-dashed border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 transition"
          >
            {sourcePreview ? (
              <div className="relative">
                <img src={sourcePreview} alt="source" className="w-full max-h-56 object-contain rounded-xl" />
                <button onClick={() => { setSourceImage(null); setSourcePreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition">
                  <X className="h-4 w-4" />
                </button>
                {isUploading && (
                  <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                  </div>
                )}
                {sourceImage && !isUploading && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-1 text-[10px] font-black text-white">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                )}
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-3 p-8">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/15 text-orange-400">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-black text-white">Drop image or click to upload</p>
                  <p className="mt-0.5 text-xs text-blue-200/35">Front-facing reference works best · JPG, PNG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Category</p>
        <div className="grid grid-cols-3 gap-2">
          {MODEL_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`rounded-xl border p-2.5 text-center transition ${category === c.id ? "border-orange-500/60 bg-orange-500/15" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-orange-500/30"}`}>
              <span className="text-lg">{c.emoji}</span>
              <p className="mt-1 text-[10px] font-black text-white">{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Polygon & Texture */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Model Style</p>
          <div className="space-y-2">
            {POLY_STYLES.map((p) => (
              <button key={p.id} onClick={() => setPolyStyle(p.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${polyStyle === p.id ? "border-orange-500/60 bg-orange-500/10" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-orange-500/30"}`}>
                <div className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${polyStyle === p.id ? "border-orange-500 bg-orange-500" : "border-blue-200/30"}`} />
                <div>
                  <p className="text-xs font-black text-white">{p.label}</p>
                  <p className="text-[10px] text-blue-200/35">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Texture Style</p>
            <div className="grid grid-cols-2 gap-2">
              {TEXTURE_STYLES.map((t) => (
                <button key={t.id} onClick={() => setTextureStyle(t.id)}
                  className={`rounded-xl border p-2.5 text-center transition ${textureStyle === t.id ? "border-orange-500/60 bg-orange-500/15" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-orange-500/30"}`}>
                  <span className="text-base">{t.emoji}</span>
                  <p className="mt-1 text-[10px] font-black text-white">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Export Formats</p>
            <div className="flex flex-wrap gap-2">
              {EXPORT_FORMATS.map((fmt) => (
                <button key={fmt} onClick={() => toggleFormat(fmt)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-black transition ${selectedFormats.includes(fmt) ? "border-orange-500/60 bg-orange-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {isGenerating ? "Generating 3D Model…" : inputType === "image" ? "Image → 3D Model" : "Text → 3D Model"}
      </button>
      <p className="text-center text-[10px] text-blue-200/30">Powered by Tripo3D AI · Ultra quality · 30–60 second generation</p>

      {/* Output */}
      {selectedAsset?.url && (
        <div className="rounded-2xl border border-orange-500/20 bg-[#06101f]/90 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">3D Model Output</p>
            <div className="flex gap-2">
              {selectedFormats.map((fmt) => (
                <a key={fmt} href={selectedAsset.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-orange-500/15 px-2.5 py-1.5 text-xs font-black text-orange-300 hover:bg-orange-500/25 transition">
                  <Download className="h-3 w-3" /> .{fmt}
                </a>
              ))}
            </div>
          </div>
          <img src={selectedAsset.url} alt="3D model" className="w-full rounded-xl shadow-xl" />
          <p className="mt-2 text-center text-xs text-blue-200/35">Preview render · Download to use in Blender, Unity, Unreal, etc.</p>
        </div>
      )}
    </div>
  );
}