import { useState } from "react";
import { Hand, Loader2, Download, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CharacterInputPanel from "@/components/artforge/CharacterInputPanel";

const HAND_POSES = [
  { id: "open_palm", label: "Open Palm", emoji: "🖐️", desc: "Flat open hand facing forward" },
  { id: "fist", label: "Fist", emoji: "✊", desc: "Clenched fist" },
  { id: "pointing", label: "Pointing", emoji: "☝️", desc: "Index finger extended" },
  { id: "peace", label: "Peace / V", emoji: "✌️", desc: "Two fingers up" },
  { id: "thumbs_up", label: "Thumbs Up", emoji: "👍", desc: "Approval gesture" },
  { id: "ok_sign", label: "OK Sign", emoji: "👌", desc: "Circle with thumb and index" },
  { id: "holding_pen", label: "Holding Pen", emoji: "✏️", desc: "Gripping a drawing tool" },
  { id: "relaxed", label: "Relaxed", emoji: "🤙", desc: "Natural resting position" },
  { id: "claw", label: "Claw / Grab", emoji: "🫳", desc: "Fingers curled reaching" },
  { id: "pinch", label: "Pinch", emoji: "🤌", desc: "Italian chef's kiss" },
  { id: "spread", label: "Spread Wide", emoji: "🖖", desc: "All fingers spread apart" },
  { id: "custom", label: "Describe Custom", emoji: "🎨", desc: "Type your own pose" },
];

const HAND_VIEWS = [
  { id: "palm_front", label: "Palm Forward" },
  { id: "back_front", label: "Back Forward" },
  { id: "side_left", label: "Side Left" },
  { id: "side_right", label: "Side Right" },
  { id: "three_quarter", label: "3/4 View" },
  { id: "top_down", label: "Top Down" },
];

const HAND_STYLES = [
  { id: "anime", label: "Anime / Manga", emoji: "⛩️" },
  { id: "realistic", label: "Realistic", emoji: "📷" },
  { id: "3d_model", label: "3D Reference", emoji: "📦" },
  { id: "anatomy", label: "Anatomy Guide", emoji: "🦴" },
  { id: "sketch", label: "Sketch", emoji: "✏️" },
];

function SliderControl({ label, value, min, max, onChange, unit = "" }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <label className="text-xs font-black text-blue-200/60">{label}</label>
        <span className="text-xs font-black text-rose-400">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-rose-500" />
    </div>
  );
}

export default function HandHelperMode({ onGenerate, isGenerating, selectedAsset }) {
  const [pose, setPose] = useState("open_palm");
  const [view, setView] = useState("palm_front");
  const [style, setStyle] = useState("anime");
  const [customPose, setCustomPose] = useState("");
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [showBothHands, setShowBothHands] = useState(false);
  const [mirrored, setMirrored] = useState(false);

  // "3D slider" controls (Clip Studio Paint style)
  const [fingerLength, setFingerLength] = useState(0);
  const [fingerThickness, setFingerThickness] = useState(0);
  const [fingertipTaper, setFingertipTaper] = useState(0);
  const [nailLength, setNailLength] = useState(0);
  const [nailWidth, setNailWidth] = useState(0);
  const [wristThickness, setWristThickness] = useState(0);
  const [palmWidth, setPalmWidth] = useState(0);

  const buildPrompt = () => {
    const poseMap = {
      open_palm: "open palm facing forward, all fingers extended and spread naturally",
      fist: "tightly clenched fist, thumb over fingers",
      pointing: "index finger pointing up, other fingers curled",
      peace: "peace sign with index and middle finger extended upward",
      thumbs_up: "thumbs up gesture, fist with thumb extended upward",
      ok_sign: "OK sign with thumb and index forming a circle, other fingers extended",
      holding_pen: "hand gripping a drawing pen or pencil naturally",
      relaxed: "relaxed natural hand position, slightly curled fingers",
      claw: "hand reaching with fingers curled like a claw",
      pinch: "fingers pinched together at tips",
      spread: "all five fingers spread as wide as possible",
      custom: customPose || "natural hand position",
    };

    const styleMap = {
      anime: "anime/manga art style with clean ink lines, slightly stylized proportions",
      realistic: "photorealistic hand with accurate skin texture and anatomy",
      "3d_model": "3D rendered hand model reference, gray/neutral color, studio lighting, all angles visible",
      anatomy: "anatomical hand diagram with visible muscle and bone structure labels, educational reference",
      sketch: "loose pencil sketch hand study with construction guidelines",
    };

    const fingerMods = [];
    if (fingerLength !== 0) fingerMods.push(`${fingerLength > 0 ? "longer" : "shorter"} fingers (${Math.abs(fingerLength)}%)`);
    if (fingerThickness !== 0) fingerMods.push(`${fingerThickness > 0 ? "thicker" : "thinner"} finger girth`);
    if (fingertipTaper !== 0) fingerMods.push(`${fingertipTaper > 0 ? "tapered" : "blunter"} fingertips`);
    if (nailLength !== 0) fingerMods.push(`${nailLength > 0 ? "longer" : "shorter"} nails`);
    if (palmWidth !== 0) fingerMods.push(`${palmWidth > 0 ? "wider" : "narrower"} palm`);

    const viewMap = {
      palm_front: "front view showing palm side",
      back_front: "front view showing back of hand (knuckles visible)",
      side_left: "left side profile view",
      side_right: "right side profile view",
      three_quarter: "3/4 perspective view from slightly above",
      top_down: "top-down aerial view",
    };

    const parts = [
      `Highly accurate hand drawing reference:`,
      `Pose: ${poseMap[pose]}.`,
      `View: ${viewMap[view]}.`,
      `Style: ${styleMap[style]}.`,
      showBothHands ? "Show both left and right hands mirrored side by side." : (mirrored ? "Left hand (mirrored)." : "Right hand."),
      fingerMods.length > 0 ? `Hand proportions: ${fingerMods.join(", ")}.` : "",
      sourceImage ? "Match the pose from the reference image." : "",
      `White background. Clean artist reference. Anatomically correct with 5 fingers.`,
      `Negative: extra fingers, fused fingers, broken anatomy, floating fingers.`,
    ];

    return parts.filter(Boolean).join(" ");
  };

  const handleGenerate = () => {
    onGenerate({
      prompt: buildPrompt(),
      mode: "hand_helper",
      referenceImages: sourceImage ? [sourceImage] : [],
      quality: "high",
      aspect: "1:1",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600">
            <Hand className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">Hand Helper</h3>
            <p className="text-xs text-blue-200/45">Poseable 3D-style hand reference — like Clip Studio Paint's 3D hand model</p>
          </div>
        </div>
      </div>

      {/* Pose grid */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Hand Pose</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {HAND_POSES.map((p) => (
            <button key={p.id} onClick={() => setPose(p.id)}
              className={`rounded-xl border p-2.5 text-center transition ${pose === p.id ? "border-rose-500/60 bg-rose-500/15" : "border-[#1a3a60]/60 bg-[#030e1f]/60 hover:border-rose-500/30"}`}>
              <span className="text-xl">{p.emoji}</span>
              <p className="mt-1 text-[10px] font-black text-white leading-tight">{p.label}</p>
            </button>
          ))}
        </div>
        {pose === "custom" && (
          <div className="mt-3">
            <CharacterInputPanel
              textPrompt={customPose}
              setTextPrompt={setCustomPose}
              sourceImage={sourceImage}
              setSourceImage={setSourceImage}
              sourcePreview={sourcePreview}
              setSourcePreview={setSourcePreview}
              accentColor="violet"
              placeholder="Describe the hand pose in detail… e.g. hand gripping a sword hilt"
              quickExamples={["gripping sword", "casting spell", "playing piano", "holding brush"]}
            />
          </div>
        )}
      </div>

      {/* View angle */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Camera View</p>
        <div className="grid grid-cols-3 gap-2">
          {HAND_VIEWS.map((v) => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`rounded-xl border py-2.5 text-xs font-black transition ${view === v.id ? "border-rose-500/60 bg-rose-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/45 hover:text-white hover:border-rose-500/30"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-200/50">Art Style</p>
        <div className="flex flex-wrap gap-2">
          {HAND_STYLES.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${style === s.id ? "border-rose-500/60 bg-rose-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clip Studio-style sliders */}
      <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200/50">Adjust Parts</p>
          <button onClick={() => { setFingerLength(0); setFingerThickness(0); setFingertipTaper(0); setNailLength(0); setNailWidth(0); setWristThickness(0); setPalmWidth(0); }}
            className="flex items-center gap-1 text-[10px] text-blue-200/35 hover:text-white transition">
            <RefreshCw className="h-3 w-3" /> Reset
          </button>
        </div>
        <SliderControl label="Finger Length" value={fingerLength} min={-50} max={50} onChange={setFingerLength} />
        <SliderControl label="Finger Thickness" value={fingerThickness} min={-50} max={50} onChange={setFingerThickness} />
        <SliderControl label="Fingertip Taper" value={fingertipTaper} min={-50} max={50} onChange={setFingertipTaper} />
        <SliderControl label="Nail Length" value={nailLength} min={-50} max={50} onChange={setNailLength} />
        <SliderControl label="Nail Width" value={nailWidth} min={-50} max={50} onChange={setNailWidth} />
        <SliderControl label="Palm Width" value={palmWidth} min={-50} max={50} onChange={setPalmWidth} />
        <SliderControl label="Wrist Thickness" value={wristThickness} min={-50} max={50} onChange={setWristThickness} />

        {/* Both hands / Mirror */}
        <div className="flex gap-3">
          <button onClick={() => setShowBothHands(!showBothHands)}
            className={`flex-1 rounded-xl border py-2 text-xs font-black transition ${showBothHands ? "border-rose-500/60 bg-rose-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
            🤲 Both Hands
          </button>
          <button onClick={() => setMirrored(!mirrored)}
            className={`flex-1 rounded-xl border py-2 text-xs font-black transition ${mirrored ? "border-rose-500/60 bg-rose-500/15 text-white" : "border-[#1a3a60]/60 text-blue-200/40 hover:text-white"}`}>
            🪞 Mirror (Left)
          </button>
        </div>
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50">
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {isGenerating ? "Generating Hand Reference…" : "Generate Hand Reference"}
      </button>

      {/* Output */}
      {selectedAsset?.url && (
        <div className="rounded-2xl border border-rose-500/20 bg-[#06101f]/90 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">Hand Reference</p>
            <a href={selectedAsset.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-black text-rose-300 hover:bg-rose-500/25 transition">
              <Download className="h-3 w-3" /> Download
            </a>
          </div>
          <img src={selectedAsset.url} alt="hand reference" className="w-full rounded-xl shadow-xl" />
          <p className="mt-2 text-center text-xs text-blue-200/35">Right-click → Save for use as drawing reference</p>
        </div>
      )}
    </div>
  );
}