import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Upload, Play, Pause, Download, Trash2, Volume2, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const PRESETS = [
  { name: "Default", brightness: 100, contrast: 100, volume: 1 },
  { name: "Bright", brightness: 130, contrast: 110, volume: 1 },
  { name: "Cinematic", brightness: 90, contrast: 120, volume: 0.9 },
  { name: "Vivid", brightness: 110, contrast: 140, volume: 1 },
];

const FILTERS = [
  { name: "Normal", filter: "" },
  { name: "Grayscale", filter: "grayscale(100%)" },
  { name: "Sepia", filter: "sepia(100%)" },
  { name: "Saturate", filter: "saturate(200%)" },
  { name: "Blur", filter: "blur(5px)" },
  { name: "Invert", filter: "invert(100%)" },
  { name: "Hue-rotate", filter: "hue-rotate(180deg)" },
];

const ASPECT_RATIOS = [
  { name: "16:9", width: 16, height: 9 },
  { name: "4:3", width: 4, height: 3 },
  { name: "1:1", width: 1, height: 1 },
  { name: "9:16", width: 9, height: 16 },
];

export default function VideoEditor() {
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState("Normal");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textOpacity, setTextOpacity] = useState(1);
  const [history, setHistory] = useState([]);
  const videoRef = useRef(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideo({ name: file.name, url, file });
      setStartTime(0);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDownloadTrimmed = async () => {
    if (!video) return;
    toast.success(`Video trimmed: ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s ready for export`);
  };

  const applyPreset = (preset) => {
    const state = { brightness: preset.brightness, contrast: preset.contrast, volume: preset.volume };
    setHistory([...history, { brightness, contrast, volume }]);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setVolume(preset.volume);
    toast.success(`Applied ${preset.name} preset`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBrightness(prev.brightness);
    setContrast(prev.contrast);
    setVolume(prev.volume);
    setHistory(history.slice(0, -1));
    toast.success("Undo applied");
  };

  const clearVideo = () => {
    setVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHistory([]);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = (time % 60).toFixed(2);
    return `${mins}:${secs}`;
  };

  const applyedFilter = useMemo(() => {
    const f = FILTERS.find(x => x.name === filter);
    return f?.filter || "";
  }, [filter]);

  const combinedFilter = `${applyedFilter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;

  const extractFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `frame_${currentTime.toFixed(2)}.png`;
      link.click();
      toast.success("Frame extracted!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900">Video Editor</h1>
          <p className="text-slate-500 mt-1">Upload, trim, and enhance your videos</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {video ? (
                <div className="space-y-4">
                  <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center relative" style={{ filter: combinedFilter }}>
                    <video
                      ref={videoRef}
                      src={video.url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      className="w-full h-full object-contain"
                      style={{ volume: volume, playbackRate: speed }}
                    />
                    {showTextOverlay && textContent && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p style={{ opacity: textOpacity, fontSize: "32px", fontWeight: "bold", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>{textContent}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        if (videoRef.current) videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handlePlay} className="flex-1 gap-2">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button variant="outline" onClick={extractFrame} className="gap-2">
                      📸 Frame
                    </Button>
                    <Button variant="outline" onClick={clearVideo} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                    ) : (
                  <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                    <Upload className="w-12 h-12 text-slate-400 mb-2" />
                    <p className="font-medium text-slate-900">Upload Video</p>
                    <p className="text-sm text-slate-500">MP4, WebM, or OGG</p>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                )}
              </motion.div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-4">
            {video && (
              <>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-semibold text-slate-900 mb-4 text-sm">✂️ Trim</h3>
                  <div className="space-y-4">
                     <div>
                       <label className="text-xs font-medium text-slate-600 block mb-1">Start: <span className="text-cyan-600 font-mono">{formatTime(startTime)}</span></label>
                       <input
                         type="range"
                         min="0"
                         max={duration || 100}
                         value={startTime}
                         onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime))}
                         className="w-full accent-cyan-500"
                       />
                     </div>
                     <div>
                       <label className="text-xs font-medium text-slate-600 block mb-1">End: <span className="text-cyan-600 font-mono">{formatTime(endTime)}</span></label>
                       <input
                         type="range"
                         min="0"
                         max={duration || 100}
                         value={endTime}
                         onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime))}
                         className="w-full accent-cyan-500"
                       />
                     </div>
                   </div>
                 </motion.div>

                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                       <Zap className="w-4 h-4" /> Effects
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
                   <div className="space-y-3 mb-4">
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600">Brightness</label>
                         <span className="text-xs text-slate-500 font-mono">{brightness}%</span>
                       </div>
                       <input
                         type="range"
                         min="50"
                         max="150"
                         value={brightness}
                         onChange={(e) => setBrightness(parseFloat(e.target.value))}
                         className="w-full accent-cyan-500"
                       />
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600">Contrast</label>
                         <span className="text-xs text-slate-500 font-mono">{contrast}%</span>
                       </div>
                       <input
                         type="range"
                         min="50"
                         max="150"
                         value={contrast}
                         onChange={(e) => setContrast(parseFloat(e.target.value))}
                         className="w-full accent-cyan-500"
                       />
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                           <Volume2 className="w-3 h-3" /> Volume
                         </label>
                         <span className="text-xs text-slate-500 font-mono">{(volume * 100).toFixed(0)}%</span>
                       </div>
                       <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.1"
                         value={volume}
                         onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                         className="w-full accent-cyan-500"
                       />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 mb-4">
                     {PRESETS.map((p) => (
                       <button
                         key={p.name}
                         onClick={() => applyPreset(p)}
                         className="text-xs p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                       >
                         {p.name}
                       </button>
                     ))}
                   </div>
                   </motion.div>

                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                   <h3 className="font-semibold text-slate-900 mb-3 text-sm">✨ Advanced</h3>
                   <div className="space-y-3">
                     <div>
                       <label className="text-xs font-medium text-slate-600 block mb-1">Filter</label>
                       <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-xs">
                         {FILTERS.map(f => <option key={f.name}>{f.name}</option>)}
                       </select>
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600">Saturation</label>
                         <span className="text-xs text-slate-500">{saturation}%</span>
                       </div>
                       <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600">Hue Shift</label>
                         <span className="text-xs text-slate-500">{hue}°</span>
                       </div>
                       <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-medium text-slate-600">Speed</label>
                         <span className="text-xs text-slate-500">{speed}x</span>
                       </div>
                       <input type="range" min="0.25" max="2" step="0.25" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                     </div>
                     <div className="pt-2 border-t border-slate-200">
                       <button onClick={() => setShowTextOverlay(!showTextOverlay)} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                         {showTextOverlay ? "✓" : "+"} Text Overlay
                       </button>
                       {showTextOverlay && (
                         <div className="mt-2 space-y-2">
                           <input type="text" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Add text..." className="w-full border border-slate-300 rounded p-2 text-xs" />
                           <input type="range" min="0" max="1" step="0.1" value={textOpacity} onChange={(e) => setTextOpacity(parseFloat(e.target.value))} className="w-full" title="Text opacity" />
                         </div>
                       )}
                     </div>
                   </div>
                   </motion.div>

                   <Button onClick={handleDownloadTrimmed} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-2">
                   <Download className="w-4 h-4" /> Export Video
                   </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}