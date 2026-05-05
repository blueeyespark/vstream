import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TEMPLATES = [
  { id: 1, name: "Cinematic", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textColor: "#fff", animation: "slideIn", duration: 3 },
  { id: 2, name: "Neon", bg: "linear-gradient(135deg, #0f0f1e 0%, #1a0033 100%)", textColor: "#00ffff", animation: "fadeIn", duration: 2 },
  { id: 3, name: "Gaming", bg: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)", textColor: "#00ff00", animation: "zoomIn", duration: 3 },
  { id: 4, name: "Minimal", bg: "#ffffff", textColor: "#000", animation: "slideIn", duration: 2 },
  { id: 5, name: "Cyberpunk", bg: "linear-gradient(135deg, #0a1525 0%, #1a0f3a 100%)", textColor: "#1e78ff", animation: "fadeIn", duration: 3 },
  { id: 6, name: "Sunset", bg: "linear-gradient(135deg, #ff6b00 0%, #ff0066 100%)", textColor: "#fff", animation: "slideIn", duration: 3 },
];

const MUSIC_STYLES = [
  { name: "Dramatic", emoji: "🎭" },
  { name: "Upbeat", emoji: "🎵" },
  { name: "Chill", emoji: "😌" },
  { name: "Intense", emoji: "⚡" },
];

const TRANSITIONS = ["Fade", "Slide", "Zoom", "Flip", "Bounce"];

export default function IntroOutroMaker() {
  const [mode, setMode] = useState("intro");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [mainText, setMainText] = useState("Your Channel");
  const [subText, setSubText] = useState("Welcome!");
  const [fontSize, setFontSize] = useState(64);
  const [duration, setDuration] = useState(3);
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_STYLES[0]);
  const [transition, setTransition] = useState("Fade");
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [showCTA, setShowCTA] = useState(false);
  const [ctaText, setCtaText] = useState("Subscribe");
  const [history, setHistory] = useState([]);

  const applyTemplate = (template) => {
    setHistory([...history, { selectedTemplate }]);
    setSelectedTemplate(template);
    toast.success(`Applied ${template.name}`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setSelectedTemplate(prev.selectedTemplate);
    setHistory(history.slice(0, -1));
  };

  const animationClass = useMemo(() => {
    const animations = {
      slideIn: "animate-[slideIn_0.8s_ease-out_forwards]",
      fadeIn: "animate-[fadeIn_0.8s_ease-out_forwards]",
      zoomIn: "animate-[zoomIn_0.8s_ease-out_forwards]",
    };
    return animations[selectedTemplate.animation] || "";
  }, [selectedTemplate.animation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03080f] via-[#0a1525] to-[#050a14] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
            Intro/Outro Maker
          </h1>
          <p className="text-blue-400/50 mt-2">Create stunning video intros and outros</p>
        </motion.div>

        {/* Mode Selector */}
        <div className="flex gap-3 mb-8">
          {["intro", "outro"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-[#1e78ff] to-[#a855f7] text-white shadow-lg shadow-blue-900/50"
                  : "bg-[#060d18] border border-blue-900/40 text-blue-400/60 hover:border-blue-700/60"
              }`}
            >
              {m === "intro" ? "📹 Intro" : "👋 Outro"}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video rounded-2xl flex items-center justify-center overflow-hidden relative group" style={{ background: selectedTemplate.bg }}>
                {showLogo && logoUrl && (
                  <img src={logoUrl} alt="logo" className="absolute top-6 right-6 h-20 opacity-80" />
                )}
                <div className={`text-center ${animationClass}`}>
                  <p style={{ fontSize: `${fontSize}px`, color: selectedTemplate.textColor }} className="font-black leading-tight">
                    {mainText}
                  </p>
                  {subText && (
                    <p style={{ fontSize: `${fontSize * 0.4}px`, color: selectedTemplate.textColor }} className="font-medium mt-4 opacity-80">
                      {subText}
                    </p>
                  )}
                  {showCTA && (
                    <p style={{ fontSize: `${fontSize * 0.5}px`, color: selectedTemplate.textColor }} className="font-bold mt-6 border-2 border-current px-6 py-2 rounded-full inline-block">
                      {ctaText}
                    </p>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 text-xs text-white/50 font-mono">
                  {duration}s • {selectedMusic.name} • {transition}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Templates */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3">✨ Templates</h3>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`p-2 rounded-lg border-2 transition-all ${selectedTemplate.id === t.id ? "border-[#1e78ff] bg-[#1e78ff]/10" : "border-blue-900/30 hover:border-[#1e78ff]/50"}`}
                  >
                    <div className="w-full h-8 rounded mb-1" style={{ background: t.bg }} />
                    <p className="text-xs font-semibold text-blue-300 truncate">{t.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.05 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3">📝 Text</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Main Text</label>
                  <Input value={mainText} onChange={(e) => setMainText(e.target.value)} className="bg-[#0a1525] border-blue-900/40 text-[#e8f4ff] focus:border-[#1e78ff]/50" />
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Sub Text</label>
                  <Input value={subText} onChange={(e) => setSubText(e.target.value)} className="bg-[#0a1525] border-blue-900/40 text-[#e8f4ff] focus:border-[#1e78ff]/50" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-blue-400/60">Size</label>
                    <span className="text-xs text-blue-400/40">{fontSize}px</span>
                  </div>
                  <input type="range" min="32" max="100" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                </div>
              </div>
            </motion.div>

            {/* Settings */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3">⚙️ Settings</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-blue-400/60">Duration</label>
                    <span className="text-xs text-blue-400/40">{duration}s</span>
                  </div>
                  <input type="range" min="1" max="10" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Music</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_STYLES.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => setSelectedMusic(m)}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${selectedMusic.name === m.name ? "bg-[#a855f7]/20 border border-[#a855f7]/60 text-[#a855f7]" : "bg-[#1e78ff]/10 border border-blue-900/40 text-blue-400/60"}`}
                      >
                        {m.emoji} {m.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Transition</label>
                  <select value={transition} onChange={(e) => setTransition(e.target.value)} className="w-full bg-[#0a1525] border border-blue-900/40 rounded-lg px-3 py-2 text-xs text-[#e8f4ff] focus:border-[#1e78ff]/50 outline-none">
                    {TRANSITIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Extra */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.15 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3">✨ Extras</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1e78ff]/10 cursor-pointer transition-colors">
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="w-4 h-4 accent-[#1e78ff]" />
                  <span className="text-xs text-blue-300">Add Logo</span>
                </label>
                {showLogo && (
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL" className="bg-[#0a1525] border-blue-900/40 text-[#e8f4ff] focus:border-[#1e78ff]/50 text-xs" />
                )}
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1e78ff]/10 cursor-pointer transition-colors">
                  <input type="checkbox" checked={showCTA} onChange={(e) => setShowCTA(e.target.checked)} className="w-4 h-4 accent-[#1e78ff]" />
                  <span className="text-xs text-blue-300">Show CTA</span>
                </label>
                {showCTA && (
                  <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Button text" className="bg-[#0a1525] border-blue-900/40 text-[#e8f4ff] focus:border-[#1e78ff]/50 text-xs" />
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2">
                <Download className="w-4 h-4" /> Generate {mode === "intro" ? "Intro" : "Outro"}
              </Button>
              {history.length > 0 && (
                <Button onClick={handleUndo} variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" /> Undo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}