import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Type, Palette, Copy, Trash2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PRESETS = [
  { name: "YouTube", width: 1280, height: 720, ratio: "16:9" },
  { name: "Square", width: 1080, height: 1080, ratio: "1:1" },
  { name: "Twitter", width: 1024, height: 512, ratio: "2:1" },
  { name: "Vertical", width: 1080, height: 1920, ratio: "9:16" },
];

const COLOR_PRESETS = [
  { name: "Red", bg: "#FF6B6B", text: "#FFFFFF" },
  { name: "Blue", bg: "#4ECDC4", text: "#FFFFFF" },
  { name: "Purple", bg: "#9B59B6", text: "#FFFFFF" },
  { name: "Orange", bg: "#FF9F43", text: "#1a1a1a" },
  { name: "Dark", bg: "#2C3E50", text: "#FFFFFF" },
];

const TEXT_EFFECTS = [
  { name: "Shadow", apply: (ctx) => { ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 10; } },
  { name: "Glow", apply: (ctx) => { ctx.shadowColor = "rgba(255,255,255,0.5)"; ctx.shadowBlur = 20; } },
  { name: "Outline", apply: (ctx) => { ctx.strokeStyle = "#000"; ctx.lineWidth = 3; } },
];

const LAYOUTS = [
  { name: "Center", x: 0.5, y: 0.5 },
  { name: "Top", x: 0.5, y: 0.2 },
  { name: "Bottom", x: 0.5, y: 0.8 },
  { name: "Left", x: 0.2, y: 0.5 },
  { name: "Right", x: 0.8, y: 0.5 },
];

export default function ThumbnailMaker() {
  const canvasRef = useRef(null);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [bgColor, setBgColor] = useState("#FF6B6B");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [mainText, setMainText] = useState("AWESOME VIDEO");
  const [fontSize, setFontSize] = useState(60);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [textEffect, setTextEffect] = useState("Shadow");
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [subText, setSubText] = useState("");
  const [enableBorder, setEnableBorder] = useState(false);
  const [borderColor, setBorderColor] = useState("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState(10);
  const [gradient, setGradient] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawThumbnail = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = preset.width;
    canvas.height = preset.height;

    const ctx = canvas.getContext("2d");

    // Background with gradient
    if (gradient) {
      const grd = ctx.createLinearGradient(0, 0, preset.width, preset.height);
      grd.addColorStop(0, bgColor);
      grd.addColorStop(1, textColor);
      ctx.fillStyle = grd;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, preset.width, preset.height);

    // Border
    if (enableBorder) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(0, 0, preset.width, preset.height);
    }

    // Draw uploaded image if exists
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, preset.width, preset.height);
        drawText();
      };
      img.src = uploadedImage;
    } else {
      drawText();
    }

    function drawText() {
      const textX = preset.width * layout.x;
      const textY = preset.height * layout.y;

      // Apply text effect
      const effect = TEXT_EFFECTS.find(e => e.name === textEffect);
      if (effect) effect.apply(ctx);

      // Main text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.fillText(mainText, textX, textY);

      // Sub text if exists
      if (subText) {
        ctx.font = `${fontSize * 0.5}px Arial`;
        ctx.fillText(subText, textX, textY + fontSize * 0.6);
      }
    }
  };

  const handleDownload = () => {
    drawThumbnail();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `thumbnail_${preset.name.toLowerCase()}.png`;
    link.click();
    toast.success("Thumbnail downloaded!");
  };

  const applyColorPreset = (cp) => {
    setHistory([...history, { bgColor, textColor }]);
    setBgColor(cp.bg);
    setTextColor(cp.text);
    toast.success(`Applied ${cp.name} colors`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBgColor(prev.bgColor);
    setTextColor(prev.textColor);
    setHistory(history.slice(0, -1));
    toast.success("Undo applied");
  };

  // Draw on mount and when settings change
  useEffect(() => {
    drawThumbnail();
  }, [bgColor, textColor, mainText, fontSize, uploadedImage, preset, textEffect, layout, subText, enableBorder, borderColor, borderWidth, gradient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900">Thumbnail Maker</h1>
          <p className="text-slate-500 mt-1">Create eye-catching thumbnails for your videos</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas Preview */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-center bg-slate-100 rounded-xl p-4 mb-4">
                <canvas
                  ref={canvasRef}
                  className="max-w-full border-2 border-slate-300 rounded-lg"
                  style={{ maxHeight: "500px" }}
                />
              </div>

              <Button onClick={handleDownload} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-2">
                <Download className="w-4 h-4" /> Download Thumbnail
              </Button>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Size Presets */}
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
               <h3 className="font-semibold text-slate-900 mb-3 text-sm">📐 Size</h3>
               <div className="space-y-2">
                 {PRESETS.map((p) => (
                   <button
                     key={p.name}
                     onClick={() => setPreset(p)}
                     className={`w-full p-2 text-sm rounded-lg border-2 transition-all ${
                       preset.name === p.name ? "border-cyan-500 bg-cyan-50 font-medium text-cyan-900" : "border-slate-200 text-slate-700 hover:border-slate-300"
                     }`}
                   >
                     {p.name} ({p.ratio})
                   </button>
                 ))}
               </div>
             </motion.div>

             {/* Colors */}
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                   <Palette className="w-4 h-4" /> Colors
                 </h3>
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
               <div className="space-y-3 mb-3">
                 <div>
                   <label className="text-xs font-medium text-slate-600 block mb-2">Background</label>
                   <div className="flex gap-2">
                     <input
                       type="color"
                       value={bgColor}
                       onChange={(e) => setBgColor(e.target.value)}
                       className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                     />
                     <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="text-sm flex-1 font-mono" />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-medium text-slate-600 block mb-2">Text Color</label>
                   <div className="flex gap-2">
                     <input
                       type="color"
                       value={textColor}
                       onChange={(e) => setTextColor(e.target.value)}
                       className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                     />
                     <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="text-sm flex-1 font-mono" />
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-1.5">
                 {COLOR_PRESETS.map((cp) => (
                   <button
                     key={cp.name}
                     onClick={() => applyColorPreset(cp)}
                     className="text-xs p-1.5 rounded border border-slate-200 hover:border-slate-300 text-slate-700 font-medium transition-colors flex items-center gap-1"
                   >
                     <div className="w-3 h-3 rounded" style={{ backgroundColor: cp.bg }} />
                     {cp.name}
                   </button>
                 ))}
               </div>
             </motion.div>

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Text & Layout
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Main Text</label>
                  <Input
                    value={mainText}
                    onChange={(e) => setMainText(e.target.value.toUpperCase())}
                    placeholder="Your text here"
                    className="text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Sub Text</label>
                  <Input
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Optional subtitle"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Font Size: {fontSize}px</label>
                  <input type="range" min="20" max="100" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Text Effect</label>
                  <select value={textEffect} onChange={(e) => setTextEffect(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-xs">
                    {TEXT_EFFECTS.map(t => <option key={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-2">Position</label>
                  <div className="grid grid-cols-3 gap-1">
                    {LAYOUTS.map(l => (
                      <button key={l.name} onClick={() => setLayout(l)} className={`p-2 text-xs rounded border-2 transition-all ${layout.name === l.name ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}>
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Border & Effects */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">🎨 Effects</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={gradient} onChange={(e) => setGradient(e.target.checked)} className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-600">Gradient BG</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={enableBorder} onChange={(e) => setEnableBorder(e.target.checked)} className="w-4 h-4" />
                  <span className="text-xs font-medium text-slate-600">Border</span>
                </label>
                {enableBorder && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer" />
                      <Input value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="text-xs flex-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Width: {borderWidth}px</label>
                      <input type="range" min="1" max="30" value={borderWidth} onChange={(e) => setBorderWidth(parseInt(e.target.value))} className="w-full" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Image Upload */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Background Image</h3>
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                <p className="text-xs text-slate-600">Upload Image</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {uploadedImage && (
                <Button
                  onClick={() => setUploadedImage(null)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Remove
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}