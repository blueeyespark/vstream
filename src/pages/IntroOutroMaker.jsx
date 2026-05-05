import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Type, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TEMPLATES = [
  { id: 1, name: "Cinematic", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textColor: "#fff", animation: "slide" },
  { id: 2, name: "Neon", bg: "linear-gradient(135deg, #0f0f1e 0%, #1a0033 100%)", textColor: "#00ffff", animation: "fade" },
  { id: 3, name: "Sunset", bg: "linear-gradient(135deg, #ff6b00 0%, #ff0066 100%)", textColor: "#fff", animation: "zoom" },
  { id: 4, name: "Minimal", bg: "#ffffff", textColor: "#000", animation: "slide" },
  { id: 5, name: "Gaming", bg: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)", textColor: "#00ff00", animation: "bounce" },
  { id: 6, name: "Pastel", bg: "linear-gradient(135deg, #ffeef8 0%, #e0f4ff 100%)", textColor: "#5a4a7a", animation: "fade" },
  { id: 7, name: "Dark Wood", bg: "linear-gradient(135deg, #3e2723 0%, #1b0000 100%)", textColor: "#ffd700", animation: "slide" },
];

const MUSIC_STYLES = [
  { name: "Dramatic", color: "#FF6B6B", emoji: "🎭" },
  { name: "Upbeat", color: "#FFD93D", emoji: "🎵" },
  { name: "Chill", color: "#6BCB77", emoji: "😌" },
  { name: "Intense", color: "#FF6348", emoji: "⚡" },
];

export default function IntroOutroMaker() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [introText, setIntroText] = useState("Your Channel");
  const [outroText, setOutroText] = useState("Thanks for Watching!");
  const [duration, setDuration] = useState(3);
  const [fontSize, setFontSize] = useState(48);
  const [history, setHistory] = useState([]);
  const [subText, setSubText] = useState("");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_STYLES[0]);
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [transitionType, setTransitionType] = useState("fade");
  const [showCTA, setShowCTA] = useState(false);
  const [ctaText, setCtaText] = useState("Subscribe");

  const handleDownload = (type) => {
    toast.success(`${type === "intro" ? "Intro" : "Outro"} generated! Ready for download.`);
  };

  const getAnimationClass = () => {
    const animations = {
      slide: "translate-x-[-100%] animate-[slideIn_0.8s_ease-out_forwards]",
      fade: "opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]",
      zoom: "scale-0 animate-[zoomIn_0.8s_ease-out_forwards]",
      bounce: "translate-y-[50px] animate-[bounceIn_0.8s_ease-out_forwards]",
    };
    return animations[selectedTemplate.animation] || "";
  };

  const applyTemplate = (template) => {
    setHistory([...history, { selectedTemplate }]);
    setSelectedTemplate(template);
    toast.success(`Applied ${template.name} template`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setSelectedTemplate(prev.selectedTemplate);
    setHistory(history.slice(0, -1));
    toast.success("Undo applied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900">Intro/Outro Maker</h1>
          <p className="text-slate-500 mt-1">Create stunning intros and outros for your videos</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="space-y-4 p-6">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </h3>

                {/* Intro Preview */}
                <div
                  className="aspect-video rounded-xl flex items-center justify-center overflow-hidden relative"
                  style={{ background: selectedTemplate.bg }}
                >
                  {showLogo && logoUrl && (
                    <img src={logoUrl} alt="logo" className="absolute top-4 right-4 h-16 opacity-80" />
                  )}
                  <div className={`text-center ${getAnimationClass()}`}>
                    <p className="text-sm font-medium text-slate-400 mb-2">INTRO</p>
                    <p style={{ fontSize: `${fontSize}px`, color: selectedTemplate.textColor }} className="font-black">
                      {introText}
                    </p>
                    {subText && (
                      <p style={{ fontSize: `${fontSize * 0.5}px`, color: selectedTemplate.textColor }} className="font-medium mt-2 opacity-80">
                        {subText}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload("intro")}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Intro
                  </Button>
                </div>

                {/* Outro Preview */}
                <div
                  className="aspect-video rounded-xl flex items-center justify-center overflow-hidden relative"
                  style={{ background: selectedTemplate.bg }}
                >
                  {showLogo && logoUrl && (
                    <img src={logoUrl} alt="logo" className="absolute top-4 right-4 h-16 opacity-80" />
                  )}
                  <div className={`text-center ${getAnimationClass()}`}>
                    <p className="text-sm font-medium text-slate-400 mb-2">OUTRO</p>
                    <p style={{ fontSize: `${fontSize}px`, color: selectedTemplate.textColor }} className="font-black">
                      {outroText}
                    </p>
                    {showCTA && (
                      <p style={{ fontSize: `${fontSize * 0.6}px`, color: selectedTemplate.textColor }} className="font-bold mt-4 border-2 border-white px-6 py-2 rounded-full inline-block">
                        {ctaText}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload("outro")}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Outro
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 text-sm">✨ Templates</h3>
                {history.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    title="Undo last change"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === t.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded mb-1"
                      style={{
                        background: t.bg,
                        border: `1px solid ${t.textColor === "#fff" ? "#ccc" : "#f0f0f0"}`,
                      }}
                    />
                    <p className="text-xs font-medium text-slate-700 truncate">{t.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <Type className="w-4 h-4" /> Text & Timing
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Intro Text</label>
                  <Input
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="Your Channel"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Sub Text</label>
                  <Input
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Optional subtitle"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Outro Text</label>
                  <Input
                    value={outroText}
                    onChange={(e) => setOutroText(e.target.value)}
                    placeholder="Thanks for Watching!"
                    className="text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-600">Font Size</label>
                    <span className="text-xs text-slate-500 font-mono">{fontSize}px</span>
                  </div>
                  <input type="range" min="24" max="72" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-600">Duration</label>
                    <span className="text-xs text-slate-500 font-mono">{duration}s</span>
                  </div>
                  <input type="range" min="1" max="10" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                </div>
              </div>
            </motion.div>

            {/* Advanced Options */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">✨ Advanced</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Music Style</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MUSIC_STYLES.map(m => (
                      <button key={m.name} onClick={() => setSelectedMusic(m)} className={`p-2 text-xs rounded border-2 transition-all ${selectedMusic.name === m.name ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}>
                        {m.emoji} {m.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Transition</label>
                  <select value={transitionType} onChange={(e) => setTransitionType(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-xs">
                    <option>Fade</option>
                    <option>Slide</option>
                    <option>Zoom</option>
                    <option>Bounce</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-600">Add Logo</span>
                </label>
                {showLogo && (
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL" className="text-xs" />
                )}
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showCTA} onChange={(e) => setShowCTA(e.target.checked)} className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-600">Show CTA Button</span>
                </label>
                {showCTA && (
                  <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="CTA Text" className="text-xs" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}