import { useState } from "react";
import { Loader2, Download, Zap, PenTool } from "lucide-react";
import { toast } from "sonner";
import CharacterInputPanel from "@/components/artforge/CharacterInputPanel";

const TRACE_STYLES = [
  { id: "anime_lineart", label: "Anime Line Art", desc: "Clean manga-style lines", emoji: "⛩️" },
  { id: "sketch_pencil", label: "Pencil Sketch", desc: "Realistic pencil tracing", emoji: "✏️" },
  { id: "construction", label: "Construction Lines", desc: "Anatomy/pose guides with red/blue lines", emoji: "📐" },
  { id: "contour", label: "Contour Only", desc: "Pure outer edge tracing", emoji: "〇" },
  { id: "gesture", label: "Gesture Lines", desc: "Flowing rhythm lines for gesture drawing", emoji: "🎯" },
  { id: "crosshatch", label: "Cross-Hatch", desc: "Artist shading reference", emoji: "🖊️" },
];

const LINE_WEIGHTS = ["Thin", "Medium", "Bold", "Variable"];

export default function TracerMode({ onGenerate, isGenerating, selectedAsset }) {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [traceStyle, setTraceStyle] = useState("anime_lineart");
  const [lineWeight, setLineWeight] = useState("Medium");
  const [opacity, setOpacity] = useState(80);
  const [simplify, setSimplify] = useState(50);

  const buildPrompt = () => {
    const styleMap = {
      anime_lineart: "Convert to clean anime/manga line art with crisp black ink lines, white background, no shading, flat comic style",
      sketch_pencil: "Convert to realistic pencil sketch with natural pencil strokes, graphite texture, white paper background",
      construction: "Generate pose construction lines drawing with red and blue guide lines, simplified geometric shapes showing body structure, anatomy helper overlay",
      contour: "Extract outer contour lines only, single clean black outline on white background, minimal detail",
      gesture: "Convert to flowing gesture drawing lines, energetic rhythmic strokes, loose artist sketch style",
      crosshatch: "Convert to cross-hatching line art reference with parallel and crossing strokes indicating shadow and form",
    };
    const subject = textPrompt.trim() ? `Subject: ${textPrompt.trim()}.` : "";
    return `${styleMap[traceStyle] || styleMap.anime_lineart}. ${subject} Line weight: ${lineWeight}. Simplification level ${simplify}%. Traceable reference for artists. Clean white background. ${simplify > 70 ? "Highly simplified for easy tracing." : "Detailed line work."}`;
  };

  const handleTrace = () => {
    if (!sourceImage && !textPrompt.trim()) {
      toast.error("Upload an image or describe what to trace");
      return;
    }
    onGenerate({
      prompt: buildPrompt(),
      mode: "tracer",
      referenceImages: sourceImage ? [sourceImage] : [],
      quality: "high",
      aspect: "1:1",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
            <PenTool className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">AR Tracer</h3>
            <p className="text-xs text-blue-200/45">Upload any image → AI generates a clean traceable line-art version</p>
          </div>
        </div>

        <CharacterInputPanel
          textPrompt={textPrompt}
          setTextPrompt={setTextPrompt}
          sourceImage={sourceImage}
          setSourceImage={setSourceImage}
          sourcePreview={sourcePreview}
          setSourcePreview={setSourcePreview}
          accentColor="violet"
          placeholder="e.g. anime girl portrait, fantasy landscape, hand pose sketch…"
          quickExamples={["anime portrait", "fantasy scene", "character sketch", "hand pose"]}
        />
      </div>

      {/* Trace style */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Trace Style</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TRACE_STYLES.map((s) => (
            <button key={s.id} onClick={() => setTraceStyle(s.id)}
              className={`rounded-xl border p-3 text-left transition ${traceStyle === s.id ? "border-cyan-500/60 bg-cyan-500/15" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-cyan-500/30"}`}>
              <span className="text-lg">{s.emoji}</span>
              <p className="mt-1 text-xs font-black text-white">{s.label}</p>
              <p className="mt-0.5 text-[10px] text-blue-200/35 leading-4">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4 space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-blue-200/50">Line Controls</p>
        <div>
          <label className="mb-2 block text-xs font-black text-blue-200/60">Line Weight</label>
          <div className="flex gap-2">
            {LINE_WEIGHTS.map((w) => (
              <button key={w} onClick={() => setLineWeight(w)}
                className={`flex-1 rounded-lg border py-2 text-xs font-black transition ${lineWeight === w ? "border-cyan-500/60 bg-cyan-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
                {w}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between">
            <label className="text-xs font-black text-blue-200/60">Simplification</label>
            <span className="text-xs text-cyan-400 font-black">{simplify}%</span>
          </div>
          <input type="range" min="0" max="100" value={simplify} onChange={(e) => setSimplify(Number(e.target.value))} className="w-full accent-cyan-400" />
          <div className="flex justify-between text-[10px] text-blue-200/30 mt-1">
            <span>Detailed</span><span>Simplified</span>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between">
            <label className="text-xs font-black text-blue-200/60">Line Opacity</label>
            <span className="text-xs text-cyan-400 font-black">{opacity}%</span>
          </div>
          <input type="range" min="20" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-cyan-400" />
        </div>
      </div>

      {/* Generate */}
      <button onClick={handleTrace} disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {isGenerating ? "Converting to Line Art…" : "Generate Trace"}
      </button>

      {/* Output */}
      {selectedAsset?.url && (
        <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">Trace Output</p>
            <a href={selectedAsset.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-black text-cyan-300 hover:bg-cyan-500/25 transition">
              <Download className="h-3 w-3" /> Download
            </a>
          </div>
          {sourcePreview && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="overflow-hidden rounded-xl border border-[#1a3a60]/50">
                <p className="border-b border-[#1a3a60]/50 px-2 py-1 text-[10px] font-black text-blue-200/40">Original</p>
                <img src={sourcePreview} alt="original" className="w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-xl border border-cyan-500/30">
                <p className="border-b border-cyan-500/20 px-2 py-1 text-[10px] font-black text-cyan-400">Trace ✨</p>
                <img src={selectedAsset.url} alt="trace" className="w-full object-cover" />
              </div>
            </div>
          )}
          {!sourcePreview && <img src={selectedAsset.url} alt="trace" className="w-full rounded-xl" />}
        </div>
      )}
    </div>
  );
}