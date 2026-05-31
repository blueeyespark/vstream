import { useState } from "react";
import { Layers, Loader2, Download, Sparkles, CheckCircle2, Wand2, Zap } from "lucide-react";
import { toast } from "sonner";
import Live2DRigPreview from "@/components/artforge/Live2DRigPreview";
import CharacterInputPanel from "@/components/artforge/CharacterInputPanel";

// ── Config ───────────────────────────────────────────────────────────────────

const OUTPUT_TYPES = [
  {
    id: "live2d",
    label: "Live2D Model",
    emoji: "🎭",
    accent: "#a855f7",
    desc: "Riggable 2D layers for Live2D Cubism",
    hint: "Outputs layered PSD/PNG — ready to rig in Live2D Cubism",
    promptSuffix: "flat layered illustration, separated body parts on white background, front-facing, no shadows between layers, clean anime lineart, game-asset-ready, PSD-compatible layered character design",
    exportFormats: ["PNG (Layered)", "PSD", "SVG"],
  },
  {
    id: "pngtuber",
    label: "PNGTuber",
    emoji: "😊",
    accent: "#ff6eb4",
    desc: "Talking/idle states for VTubing apps",
    hint: "Idle + talking + happy + surprised states on transparent BG",
    promptSuffix: "character sheet, 4 expression states: idle neutral, talking open mouth, happy smile, surprised, clean white cutout transparent background, thick bold outline, streamer avatar style",
    exportFormats: ["PNG", "WebP"],
  },
  {
    id: "sprite_sheet",
    label: "Sprite Sheet",
    emoji: "🕹️",
    accent: "#00c8ff",
    desc: "Game sprites — walk, run, attack cycles",
    hint: "Animated sprite frames on grid layout",
    promptSuffix: "sprite sheet, multiple animation frames in a grid, walk cycle, run cycle, idle, attack, transparent background, pixel-accurate registration, game-ready",
    exportFormats: ["PNG", "WebP", "JSON Atlas"],
  },
  {
    id: "character_sheet",
    label: "Character Sheet",
    emoji: "📋",
    accent: "#10b981",
    desc: "Front, side, back views + expressions",
    hint: "Turnaround sheet with expression chart",
    promptSuffix: "character design sheet, front view, 3/4 view, side view, back view, expression chart with 6 emotions, color palette swatches, clean white background, professional anime character design",
    exportFormats: ["PNG", "PDF"],
  },
  {
    id: "chibi",
    label: "Chibi / SD",
    emoji: "🌸",
    accent: "#f59e0b",
    desc: "Super-deformed cute style",
    hint: "1:2 head ratio, big eyes, simplified body",
    promptSuffix: "chibi super-deformed style, 1:2 head to body ratio, huge sparkly eyes, simplified rounded limbs, pastel color palette, transparent background, kawaii aesthetic",
    exportFormats: ["PNG", "WebP"],
  },
  {
    id: "vroid",
    label: "VRoid / Avatar",
    emoji: "🎮",
    accent: "#f97316",
    desc: "Texture sheets for VRoid Studio",
    hint: "UV texture maps for VRoid Studio import",
    promptSuffix: "flat UV texture sheet, anime face front view with all features, hair texture tile, clothing front/back flat lay, transparent background, VRoid Studio compatible proportions",
    exportFormats: ["PNG", "BMP"],
  },
];

const CHARACTER_STYLES = [
  { id: "anime", label: "Anime", emoji: "⛩️" },
  { id: "western", label: "Western / Cartoon", emoji: "🎨" },
  { id: "pixel", label: "Pixel Art", emoji: "🕹️" },
  { id: "flat", label: "Flat / Minimal", emoji: "⬜" },
  { id: "painted", label: "Painted / Detailed", emoji: "🖼️" },
  { id: "chibi_style", label: "Chibi", emoji: "🌸" },
];

const BODY_TYPES = [
  { id: "human_f", label: "Female", emoji: "👧" },
  { id: "human_m", label: "Male", emoji: "👦" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { id: "creature", label: "Creature", emoji: "🐉" },
  { id: "robot", label: "Robot / Mech", emoji: "🤖" },
  { id: "animal", label: "Animal / Kemono", emoji: "🐾" },
];

const EXPRESSION_PACKS = [
  { id: "basic", label: "Basic (4)", states: ["Idle", "Talking", "Happy", "Sad"] },
  { id: "extended", label: "Extended (8)", states: ["Idle", "Talking", "Happy", "Sad", "Angry", "Surprised", "Nervous", "Blush"] },
  { id: "streamer", label: "Streamer (6)", states: ["Idle", "Hype", "GG", "PogChamp", "Cope", "Sleep"] },
  { id: "custom", label: "Custom", states: [] },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Model2DMode({ onGenerate, isGenerating, selectedAsset }) {
  const [outputType, setOutputType] = useState("live2d");
  const [charStyle, setCharStyle] = useState("anime");
  const [bodyType, setBodyType] = useState("human_f");
  const [expressionPack, setExpressionPack] = useState("basic");
  const [textPrompt, setTextPrompt] = useState("");
  const [hairColor, setHairColor] = useState("purple");
  const [eyeColor, setEyeColor] = useState("blue");
  const [outfit, setOutfit] = useState("idol costume");
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);

  const selected = OUTPUT_TYPES.find((t) => t.id === outputType) || OUTPUT_TYPES[0];
  const styleObj = CHARACTER_STYLES.find((s) => s.id === charStyle);
  const bodyObj = BODY_TYPES.find((b) => b.id === bodyType);
  const exprObj = EXPRESSION_PACKS.find((e) => e.id === expressionPack);

  const buildPrompt = () => {
    const base = textPrompt.trim() || `${styleObj?.label} ${bodyObj?.label} character`;
    const exprLine = exprObj && exprObj.states.length
      ? `Expression states: ${exprObj.states.join(", ")}.`
      : "";
    const refLine = sourceImage ? "Match the reference image's character design as closely as possible." : "";

    return [
      base,
      `Hair: ${hairColor}.`,
      `Eyes: ${eyeColor}.`,
      `Outfit: ${outfit}.`,
      `Art style: ${styleObj?.label}.`,
      `Body type: ${bodyObj?.label}.`,
      exprLine,
      selected.promptSuffix,
      refLine,
    ].filter(Boolean).join(" ");
  };

  const handleGenerate = () => {
    if (!textPrompt.trim() && !sourceImage) {
      toast.error("Describe your character or upload a reference");
      return;
    }
    onGenerate({
      prompt: buildPrompt(),
      mode: "2d_model",
      referenceImages: sourceImage ? [sourceImage] : [],
      quality: "ultra",
      aspect: outputType === "sprite_sheet" || outputType === "character_sheet" ? "16:9" : "1:1",
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Left — controls */}
      <div className="space-y-3">
        {/* Header */}
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white">2D Character Studio</h3>
              <p className="text-xs text-blue-200/45">Live2D · PNGTuber · Sprites · VRoid textures · Character sheets</p>
            </div>
          </div>
        </div>

        {/* Output type */}
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Output Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OUTPUT_TYPES.map((t) => (
              <button key={t.id} onClick={() => setOutputType(t.id)}
                className={`rounded-xl border p-3 text-left transition ${outputType === t.id ? "border-violet-500/60 bg-violet-500/12" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-violet-500/30"}`}>
                <span className="text-xl block mb-1">{t.emoji}</span>
                <p className="text-xs font-black text-white leading-tight">{t.label}</p>
                <p className="mt-1 text-[10px] text-blue-200/35 leading-tight">{t.desc}</p>
              </button>
            ))}
          </div>
          {/* Hint bar */}
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2">
            <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5 text-violet-400" />
            <p className="text-xs text-blue-200/60">{selected.hint}</p>
          </div>
        </div>

        {/* Character description — text, photo, or speech */}
        <CharacterInputPanel
          textPrompt={textPrompt}
          setTextPrompt={setTextPrompt}
          sourceImage={sourceImage}
          setSourceImage={setSourceImage}
          sourcePreview={sourcePreview}
          setSourcePreview={setSourcePreview}
          accentColor="violet"
          placeholder="e.g. cute anime idol singer, long twintails, pastel pink dress, big expressive eyes…"
          quickExamples={["anime idol", "fantasy mage", "cyberpunk hacker", "forest spirit", "vtuber cat girl"]}
        />

        {/* Character customization */}
        <div className="grid gap-3 md:grid-cols-2">
          {/* Art style */}
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Art Style</p>
            <div className="grid grid-cols-2 gap-2">
              {CHARACTER_STYLES.map((s) => (
                <button key={s.id} onClick={() => setCharStyle(s.id)}
                  className={`rounded-xl border p-2 text-center transition ${charStyle === s.id ? "border-violet-500/60 bg-violet-500/15" : "border-[#1a3a60]/60 hover:border-violet-500/30"}`}>
                  <span className="text-lg">{s.emoji}</span>
                  <p className="mt-1 text-[10px] font-black text-white leading-tight">{s.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Body type */}
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Character Type</p>
            <div className="grid grid-cols-2 gap-2">
              {BODY_TYPES.map((b) => (
                <button key={b.id} onClick={() => setBodyType(b.id)}
                  className={`rounded-xl border p-2 text-center transition ${bodyType === b.id ? "border-violet-500/60 bg-violet-500/15" : "border-[#1a3a60]/60 hover:border-violet-500/30"}`}>
                  <span className="text-lg">{b.emoji}</span>
                  <p className="mt-1 text-[10px] font-black text-white leading-tight">{b.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance details */}
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Appearance Details</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200/35">Hair Color</p>
              <input value={hairColor} onChange={(e) => setHairColor(e.target.value)}
                placeholder="purple, silver, twin-color..."
                className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60 placeholder:text-blue-200/20" />
            </label>
            <label>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200/35">Eye Color</p>
              <input value={eyeColor} onChange={(e) => setEyeColor(e.target.value)}
                placeholder="blue, heterochromia..."
                className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60 placeholder:text-blue-200/20" />
            </label>
            <label>
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-blue-200/35">Outfit</p>
              <input value={outfit} onChange={(e) => setOutfit(e.target.value)}
                placeholder="idol costume, armor..."
                className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2 text-sm text-white outline-none focus:border-violet-500/60 placeholder:text-blue-200/20" />
            </label>
          </div>
        </div>

        {/* Expressions — shown for live2d and pngtuber */}
        {(outputType === "live2d" || outputType === "pngtuber" || outputType === "sprite_sheet") && (
          <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Expression Pack</p>
            <div className="grid grid-cols-2 gap-2">
              {EXPRESSION_PACKS.map((e) => (
                <button key={e.id} onClick={() => setExpressionPack(e.id)}
                  className={`rounded-xl border p-3 text-left transition ${expressionPack === e.id ? "border-violet-500/60 bg-violet-500/12" : "border-[#1a3a60]/60 hover:border-violet-500/30"}`}>
                  <p className="text-xs font-black text-white">{e.label}</p>
                  {e.states.length > 0 && (
                    <p className="mt-1 text-[10px] text-blue-200/35 leading-tight">{e.states.join(", ")}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}



        {/* Generate */}
        <button onClick={handleGenerate} disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Generating 2D Model…" : `Generate ${selected.label}`}
        </button>
        <p className="text-center text-[10px] text-blue-200/30">AI-generated · Ultra quality · Export-ready layers</p>
      </div>

      {/* Right — preview + info */}
      <div className="space-y-3">
        {/* Live2D interactive rig preview */}
        {outputType === "live2d" && (
          <Live2DRigPreview
            hairColorPreset={
              hairColor.toLowerCase().includes("pink") || hairColor.toLowerCase().includes("red") ? "pink"
              : hairColor.toLowerCase().includes("blue") ? "blue"
              : hairColor.toLowerCase().includes("teal") || hairColor.toLowerCase().includes("green") ? "teal"
              : hairColor.toLowerCase().includes("silver") || hairColor.toLowerCase().includes("grey") || hairColor.toLowerCase().includes("gray") ? "silver"
              : "purple"
            }
            skinTone={
              eyeColor.toLowerCase().includes("tan") ? "tan"
              : eyeColor.toLowerCase().includes("medium") ? "medium"
              : "fair"
            }
          />
        )}

        {/* Generic output preview for non-Live2D types */}
        {outputType !== "live2d" && (
        <div className="rounded-2xl border border-violet-500/20 bg-[#030e1f] overflow-hidden">
          <div className="border-b border-[#1a3a60]/50 px-4 py-2.5 flex items-center gap-2">
            <Wand2 className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-black text-white">Output Preview</span>
            <span className="ml-auto text-[10px] text-blue-200/35">{selected.label}</span>
          </div>
          <div className="min-h-[280px] grid place-items-center p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-[#1a3a60] border-t-violet-500 animate-spin" />
                  <Layers className="absolute inset-0 m-auto h-6 w-6 text-violet-400" />
                </div>
                <p className="font-black text-white text-sm">Generating {selected.label}…</p>
                <p className="text-xs text-blue-200/40">AI is painting your character ✨</p>
              </div>
            ) : selectedAsset?.url ? (
              <div className="w-full text-center">
                <img src={selectedAsset.url} alt="output" className="max-h-64 max-w-full mx-auto rounded-xl shadow-xl object-contain" />
                <p className="mt-2 text-xs text-blue-200/40">{selectedAsset.name}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-3 text-5xl">{selected.emoji}</div>
                <p className="font-black text-white">{selected.label}</p>
                <p className="mt-1 text-xs text-blue-200/35 max-w-[200px] mx-auto leading-relaxed">{selected.hint}</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Download section */}
        {selectedAsset?.url && (
          <div className="rounded-2xl border border-emerald-500/20 bg-[#06101f]/90 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-black text-white">Ready to Export!</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selected.exportFormats.map((fmt) => (
                <a key={fmt} href={selectedAsset.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 py-2 text-xs font-black text-violet-300 hover:bg-violet-500/25 transition">
                  <Download className="h-3 w-3" /> {fmt}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Live2D-specific info */}
        {outputType === "live2d" && (
          <div className="rounded-2xl border border-violet-500/20 bg-[#06101f]/90 p-4">
            <p className="mb-2 text-xs font-black text-violet-300 flex items-center gap-1.5">
              <span className="text-base">🎭</span> Live2D Workflow
            </p>
            <ol className="space-y-1.5">
              {[
                "Generate your layered character art",
                "Open in Photoshop / Clip Studio — arrange layers by body part",
                "Import PSD into Live2D Cubism",
                "Rig deformers for head, eyes, mouth, hair physics",
                "Export .moc3 + .model3.json for VTube Studio",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-black text-violet-300 mt-0.5">{i + 1}</span>
                  <span className="text-[11px] text-blue-200/50 leading-tight">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* PNGTuber info */}
        {outputType === "pngtuber" && (
          <div className="rounded-2xl border border-pink-500/20 bg-[#06101f]/90 p-4">
            <p className="mb-2 text-xs font-black text-pink-300 flex items-center gap-1.5">
              <span className="text-base">😊</span> PNGTuber Setup
            </p>
            <div className="space-y-1.5">
              {["veadotube mini — free, drag & drop PNG", "VTube Studio — supports PNG layers", "Discord & OBS — works as overlay"].map((app) => (
                <div key={app} className="flex items-center gap-2 text-[11px] text-blue-200/45">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400/60 shrink-0" />
                  {app}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generic tips for other types */}
        {!["live2d", "pngtuber"].includes(outputType) && (
          <div className="rounded-2xl border border-[#1a3a60]/50 bg-[#06101f]/60 p-4">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-blue-200/30">Export Info</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.exportFormats.map((fmt) => (
                <span key={fmt} className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-black text-violet-300">
                  .{fmt.split(" ")[0]}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-blue-200/35 leading-relaxed">{selected.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}