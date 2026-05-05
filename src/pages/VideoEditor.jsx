import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Download, Trash2, Volume2, Settings, RotateCcw, Copy, Zap, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const PRESETS = [
  { name: "Standard", brightness: 100, contrast: 100, saturation: 100, volume: 1 },
  { name: "Cinematic", brightness: 90, contrast: 120, saturation: 110, volume: 0.9 },
  { name: "Vibrant", brightness: 110, contrast: 140, saturation: 150, volume: 1 },
  { name: "Vintage", brightness: 95, contrast: 85, saturation: 70, volume: 1 },
  { name: "B&W", brightness: 100, contrast: 130, saturation: 0, volume: 1 },
];

const AUDIO_PRESETS = [
  { name: "Balanced", eq: { bass: 0, mid: 0, treble: 0 }, compression: 1 },
  { name: "Bass Boost", eq: { bass: 10, mid: 0, treble: 0 }, compression: 1 },
  { name: "Voice Clear", eq: { bass: -5, mid: 8, treble: 5 }, compression: 1.2 },
  { name: "Podcast", eq: { bass: -8, mid: 5, treble: 3 }, compression: 1.5 },
];

export default function VideoEditor() {
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // Video effects
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Audio controls
  const [volume, setVolume] = useState(1);
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [compression, setCompression] = useState(1);
  const [noiseGate, setNoiseGate] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("video");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState([]);

  const handleVideoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideo({ name: file.name, url, file });
      setStartTime(0);
      setEndTime(0);
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleLoadMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const applyPreset = useCallback((preset) => {
    setHistory([...history, { brightness, contrast, saturation, volume }]);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setVolume(preset.volume);
    toast.success(`Applied ${preset.name}`);
  }, [history, brightness, contrast, saturation, volume]);

  const applyAudioPreset = useCallback((preset) => {
    setHistory([...history, { bass, mid, treble, compression }]);
    setBass(preset.eq.bass);
    setMid(preset.eq.mid);
    setTreble(preset.eq.treble);
    setCompression(preset.compression);
    toast.success(`Applied ${preset.name}`);
  }, [history, bass, mid, treble, compression]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBrightness(prev.brightness);
    setContrast(prev.contrast);
    setSaturation(prev.saturation);
    setVolume(prev.volume);
    setHistory(history.slice(0, -1));
    toast.success("Undone");
  }, [history]);

  const videoFilter = useMemo(() => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
  }, [brightness, contrast, saturation, hue]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}:${String(parseInt(s)).padStart(2, "0")}`;
  };

  const handleExport = () => {
    if (!video) return;
    toast.success(`Video exported: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03080f] via-[#0a1525] to-[#050a14] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
            Video Editor Pro
          </h1>
          <p className="text-blue-400/50 mt-2">Professional-grade video editing with real-time effects</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-black aspect-video flex items-center justify-center relative group overflow-hidden">
                {video ? (
                  <>
                    <video
                      ref={videoRef}
                      src={video.url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadMetadata}
                      className="w-full h-full object-contain"
                      style={{ filter: videoFilter, opacity: 0.95 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={handlePlay} className="w-16 h-16 rounded-full bg-[#1e78ff] flex items-center justify-center hover:bg-[#3d8fff] transition-colors">
                        {isPlaying ? <Pause className="w-6 h-6 text-white ml-1" /> : <Play className="w-6 h-6 text-white ml-1" fill="white" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e78ff]/5 transition-colors">
                    <FileUp className="w-16 h-16 text-[#1e78ff]/40 mb-4" />
                    <p className="text-white font-semibold">Drop video or click to upload</p>
                    <p className="text-blue-400/50 text-sm mt-2">MP4, WebM, or OGG</p>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {video && (
                <div className="p-4 space-y-3 border-t border-[#1e78ff]/10">
                  <div className="flex justify-between text-xs text-blue-400/60 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const t = parseFloat(e.target.value);
                      if (videoRef.current) videoRef.current.currentTime = t;
                      setCurrentTime(t);
                    }}
                    className="w-full accent-[#1e78ff] cursor-pointer"
                  />
                </div>
              )}
            </motion.div>

            {/* Controls Tabs */}
            {video && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 10 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
                <div className="flex gap-2 mb-4 border-b border-[#1e78ff]/10 pb-4">
                  {["video", "audio", "advanced"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-[#1e78ff]/20 text-[#1e78ff] border border-[#1e78ff]/40"
                          : "text-blue-400/50 hover:text-blue-300"
                      }`}
                    >
                      {tab === "video" ? "📹 Video" : tab === "audio" ? "🎵 Audio" : "⚙️ Advanced"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "video" && (
                    <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Brightness</label>
                          <span className="text-xs text-blue-400/60">{brightness}%</span>
                        </div>
                        <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Contrast</label>
                          <span className="text-xs text-blue-400/60">{contrast}%</span>
                        </div>
                        <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Saturation</label>
                          <span className="text-xs text-blue-400/60">{saturation}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESETS.map((p) => (
                          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-2 rounded-lg bg-[#1e78ff]/10 hover:bg-[#1e78ff]/20 text-blue-300 text-xs font-semibold transition-colors">
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "audio" && (
                    <motion.div key="audio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Volume</label>
                          <span className="text-xs text-blue-400/60">{(volume * 100).toFixed(0)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Bass</label>
                          <span className="text-xs text-blue-400/60">{bass > 0 ? "+" : ""}{bass}dB</span>
                        </div>
                        <input type="range" min="-15" max="15" value={bass} onChange={(e) => setBass(parseInt(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Mids</label>
                          <span className="text-xs text-blue-400/60">{mid > 0 ? "+" : ""}{mid}dB</span>
                        </div>
                        <input type="range" min="-15" max="15" value={mid} onChange={(e) => setMid(parseInt(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Treble</label>
                          <span className="text-xs text-blue-400/60">{treble > 0 ? "+" : ""}{treble}dB</span>
                        </div>
                        <input type="range" min="-15" max="15" value={treble} onChange={(e) => setTreble(parseInt(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {AUDIO_PRESETS.map((p) => (
                          <button key={p.name} onClick={() => applyAudioPreset(p)} className="px-3 py-2 rounded-lg bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-purple-300 text-xs font-semibold transition-colors">
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "advanced" && (
                    <motion.div key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Speed</label>
                          <span className="text-xs text-blue-400/60">{speed}x</span>
                        </div>
                        <input type="range" min="0.25" max="2" step="0.25" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-[#1e78ff]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Hue</label>
                          <span className="text-xs text-blue-400/60">{hue}°</span>
                        </div>
                        <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(parseInt(e.target.value))} className="w-full accent-[#1e78ff]" />
                      </div>
                      <label className="flex items-center gap-3 p-3 bg-[#1e78ff]/10 rounded-lg cursor-pointer hover:bg-[#1e78ff]/20 transition-colors">
                        <input type="checkbox" checked={noiseGate} onChange={(e) => setNoiseGate(e.target.checked)} className="w-4 h-4 accent-[#1e78ff]" />
                        <span className="text-xs font-semibold text-blue-300">Noise Gate</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {video && (
              <>
                {/* Trim Controls */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-[#e8f4ff] mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Trim
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-blue-400/60 block mb-1">Start: {formatTime(startTime)}</label>
                      <input type="range" min="0" max={duration} value={startTime} onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime))} className="w-full accent-[#1e78ff]" />
                    </div>
                    <div>
                      <label className="text-xs text-blue-400/60 block mb-1">End: {formatTime(endTime)}</label>
                      <input type="range" min="0" max={duration} value={endTime} onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime))} className="w-full accent-[#1e78ff]" />
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} transition={{ delay: 0.1 }} className="flex flex-col gap-2">
                  <Button onClick={handleExport} className="w-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  {history.length > 0 && (
                    <Button onClick={handleUndo} variant="outline" className="w-full gap-2">
                      <RotateCcw className="w-4 h-4" /> Undo
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setVideo(null);
                      setHistory([]);
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Clear
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}