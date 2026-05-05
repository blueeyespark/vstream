import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Type, Palette, Plus, Trash2, RotateCcw, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TEMPLATES = [
  { id: 1, name: "Bold Title", bg: "linear-gradient(135deg, #1e78ff 0%, #a855f7 100%)", textColor: "#fff", layout: "center" },
  { id: 2, name: "Dark Minimal", bg: "#0a0f1f", textColor: "#1e78ff", layout: "bottom" },
  { id: 3, name: "Neon Pop", bg: "#000", textColor: "#00ffff", layout: "center", shadow: "0 0 30px #00ffff" },
  { id: 4, name: "Gradient Sunrise", bg: "linear-gradient(135deg, #ff6b00 0%, #ff0066 100%)", textColor: "#fff", layout: "center" },
  { id: 5, name: "Clean White", bg: "#fff", textColor: "#000", layout: "center" },
  { id: 6, name: "Gaming Dark", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textColor: "#00ff00", layout: "bottom" },
];

const FONTS = ["Arial", "Georgia", "Courier", "Verdana", "Impact"];
const EFFECTS = ["None", "Shadow", "Outline", "Glow", "Blur"];

export default function ThumbnailMaker() {
  const canvasRef = useRef(null);
  const [preset, setPreset] = useState(TEMPLATES[0]);
  const [mainText, setMainText] = useState("AWESOME VIDEO");
  const [subText, setSubText] = useState("Click to edit");
  const [fontSize, setFontSize] = useState(72);
  const [font, setFont] = useState("Impact");
  const [effect, setEffect] = useState("Shadow");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [bgColor, setBgColor] = useState(TEMPLATES[0].bg);
  const [textColor, setTextColor] = useState(TEMPLATES[0].textColor);

  const drawThumbnail = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    // Background
    if (bgColor.includes("gradient")) {
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      gradient.addColorStop(0, "#1e78ff");
      gradient.addColorStop(1, "#a855f7");
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, 1280, 720);

    // Background image
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, 0, 0, 1280, 720);
        ctx.globalAlpha = 1;
        drawText();
      };
      img.src = uploadedImage;
    } else {
      drawText();
    }

    function drawText() {
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Effects
      if (effect === "Shadow") {
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      } else if (effect === "Glow") {
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 30;
      } else if (effect === "Outline") {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
      }

      const yPos = preset.layout === "bottom" ? 600 : 360;
      ctx.fillText(mainText, 640, yPos);

      if (effect === "Outline") {
        ctx.fillText(mainText, 640, yPos);
      }

      // Sub text
      if (subText) {
        ctx.font = `${fontSize * 0.4}px ${font}`;
        ctx.fillText(subText, 640, yPos + fontSize * 0.6);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(drawThumbnail, 0);
    return () => clearTimeout(timer);
  }, [preset, mainText, subText, fontSize, font, effect, uploadedImage, bgColor, textColor]);

  const applyTemplate = (template) => {
    setHistory([...history, { bgColor, textColor }]);
    setPreset(template);
    setBgColor(template.bg);
    setTextColor(template.textColor);
    toast.success(`Applied ${template.name}`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBgColor(prev.bgColor);
    setTextColor(prev.textColor);
    setHistory(history.slice(0, -1));
  };

  const handleDownload = () => {
    drawThumbnail();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "thumbnail.png";
    link.click();
    toast.success("Thumbnail downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03080f] via-[#0a1525] to-[#050a14] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
            Thumbnail Creator
          </h1>
          <p className="text-blue-400/50 mt-2">Design eye-catching thumbnails in seconds</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-6">
              <div className="flex justify-center bg-black rounded-xl p-4 mb-4">
                <canvas ref={canvasRef} className="max-w-full border-2 border-[#1e78ff]/30 rounded-lg shadow-2xl shadow-blue-900/50" style={{ maxHeight: "500px" }} />
              </div>
              <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2">
                <Download className="w-4 h-4" /> Download Thumbnail
              </Button>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Templates */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Templates
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => applyTemplate(t)} className={`p-2 rounded-lg border-2 text-xs font-semibold transition-all ${preset.id === t.id ? "border-[#1e78ff] bg-[#1e78ff]/10" : "border-blue-900/30 hover:border-[#1e78ff]/50"}`}>
                    <div className="w-full h-8 rounded mb-1" style={{ background: t.bg }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Text Controls */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.05 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Text
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Main Text</label>
                  <input value={mainText} onChange={(e) => setMainText(e.target.value)} className="w-full bg-[#0a1525] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-[#e8f4ff] focus:border-[#1e78ff]/50 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Sub Text</label>
                  <input value={subText} onChange={(e) => setSubText(e.target.value)} className="w-full bg-[#0a1525] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-[#e8f4ff] focus:border-[#1e78ff]/50 outline-none transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-blue-400/60">Size</label>
                    <span className="text-xs text-blue-400/40">{fontSize}px</span>
                  </div>
                  <input type="range" min="24" max="120" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Font</label>
                  <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full bg-[#0a1525] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-[#e8f4ff] focus:border-[#1e78ff]/50 outline-none transition-colors">
                    {FONTS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Effect</label>
                  <select value={effect} onChange={(e) => setEffect(e.target.value)} className="w-full bg-[#0a1525] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-[#e8f4ff] focus:border-[#1e78ff]/50 outline-none transition-colors">
                    {EFFECTS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Colors */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3">🎨 Colors</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-blue-400/60 block mb-1">Text Color</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border border-blue-900/40" />
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.15 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e8f4ff] mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Background
              </h3>
              <label className="block border-2 border-dashed border-blue-900/40 rounded-lg p-3 text-center cursor-pointer hover:border-[#1e78ff]/50 transition-colors">
                <Plus className="w-5 h-5 text-blue-400/40 mx-auto mb-1" />
                <p className="text-xs text-blue-400/60">Upload Image</p>
                <input type="file" accept="image/*" onChange={(e) => setUploadedImage(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} className="hidden" />
              </label>
            </motion.div>

            {/* Actions */}
            {history.length > 0 && (
              <Button onClick={handleUndo} variant="outline" className="w-full gap-2">
                <RotateCcw className="w-4 h-4" /> Undo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}