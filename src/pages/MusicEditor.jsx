import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Download, Trash2, Volume2, Music, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AUDIO_PRESETS = [
  { name: "Balanced", eq: { bass: 0, mid: 0, treble: 0 }, compression: 1, reverb: 0.2 },
  { name: "Bass Boost", eq: { bass: 12, mid: 0, treble: 0 }, compression: 1.1, reverb: 0.3 },
  { name: "Voice Clear", eq: { bass: -5, mid: 8, treble: 5 }, compression: 1.3, reverb: 0.1 },
  { name: "Podcast Pro", eq: { bass: -8, mid: 6, treble: 4 }, compression: 1.5, reverb: 0.05 },
  { name: "Radio Ready", eq: { bass: 5, mid: 3, treble: 8 }, compression: 1.8, reverb: 0.15 },
  { name: "Cinematic", eq: { bass: 8, mid: -2, treble: 10 }, compression: 1.2, reverb: 0.4 },
];

const EFFECTS = [
  { name: "Fade In", duration: 2 },
  { name: "Fade Out", duration: 3 },
  { name: "Normalize", peak: 0.95 },
];

export default function MusicEditor() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // EQ Controls
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);
  const [volume, setVolume] = useState(1);
  const [compression, setCompression] = useState(1);
  const [reverb, setReverb] = useState(0.2);
  const [delay, setDelay] = useState(0);

  // UI State
  const [activeTab, setActiveTab] = useState("eq");
  const [history, setHistory] = useState([]);

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudio({ name: file.name, url, file });
      setStartTime(0);
      setEndTime(0);
    }
  };

  const handlePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setEndTime(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const applyPreset = (preset) => {
    setHistory([...history, { bass, mid, treble, compression, reverb }]);
    setBass(preset.eq.bass);
    setMid(preset.eq.mid);
    setTreble(preset.eq.treble);
    setCompression(preset.compression);
    setReverb(preset.reverb);
    toast.success(`Applied ${preset.name}`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBass(prev.bass);
    setMid(prev.mid);
    setTreble(prev.treble);
    setCompression(prev.compression);
    setReverb(prev.reverb);
    setHistory(history.slice(0, -1));
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}:${String(parseInt(s)).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03080f] via-[#0a1525] to-[#050a14] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
            Music Editor Pro
          </h1>
          <p className="text-blue-400/50 mt-2">Professional audio mixing and mastering</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Waveform Display */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-6 shadow-2xl">
              <div className="bg-black rounded-xl p-4 mb-4 min-h-32 flex items-center justify-center relative">
                {audio ? (
                  <div className="w-full h-32 flex items-center justify-center">
                    <div className="flex items-end justify-center gap-0.5 w-full h-full">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-[#1e78ff] to-[#a855f7] opacity-70 rounded-sm" style={{ height: `${30 + Math.random() * 70}%` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e78ff]/5 transition-colors rounded-lg">
                    <Music className="w-12 h-12 text-[#1e78ff]/40 mb-2" />
                    <p className="text-white font-semibold">Drop audio or click to upload</p>
                    <p className="text-blue-400/50 text-sm mt-1">MP3, WAV, OGG, or M4A</p>
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  </label>
                )}
              </div>

              {audio && (
                <div className="space-y-4">
                  <audio ref={audioRef} src={audio.url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadMetadata} />

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
                      if (audioRef.current) audioRef.current.currentTime = t;
                      setCurrentTime(t);
                    }}
                    className="w-full accent-[#1e78ff]"
                  />

                  <div className="flex gap-2">
                    <Button onClick={handlePlay} className="flex-1 bg-[#1e78ff] hover:bg-[#3d8fff] gap-2">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" fill="white" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setAudio(null); setHistory([]); }}>
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Control Tabs */}
            {audio && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 10 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
                <div className="flex gap-2 mb-4 border-b border-[#1e78ff]/10 pb-4">
                  {["eq", "effects"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-[#1e78ff]/20 text-[#1e78ff] border border-[#1e78ff]/40"
                          : "text-blue-400/50 hover:text-blue-300"
                      }`}
                    >
                      {tab === "eq" ? "🎚️ EQ" : "✨ Effects"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "eq" && (
                    <motion.div key="eq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
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
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Compression</label>
                          <span className="text-xs text-blue-400/60">{compression.toFixed(1)}x</span>
                        </div>
                        <input type="range" min="1" max="3" step="0.1" value={compression} onChange={(e) => setCompression(parseFloat(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Reverb</label>
                          <span className="text-xs text-blue-400/60">{(reverb * 100).toFixed(0)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" value={reverb} onChange={(e) => setReverb(parseFloat(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {AUDIO_PRESETS.map((p) => (
                          <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-2 rounded-lg bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-purple-300 text-xs font-semibold transition-colors">
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "effects" && (
                    <motion.div key="effects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-semibold text-blue-300">Delay</label>
                          <span className="text-xs text-blue-400/60">{(delay * 1000).toFixed(0)}ms</span>
                        </div>
                        <input type="range" min="0" max="0.5" step="0.05" value={delay} onChange={(e) => setDelay(parseFloat(e.target.value))} className="w-full accent-[#a855f7]" />
                      </div>
                      <div className="space-y-2">
                        {EFFECTS.map((effect) => (
                          <button key={effect.name} className="w-full p-3 rounded-lg bg-[#1e78ff]/10 hover:bg-[#1e78ff]/20 text-left text-xs font-semibold text-blue-300 transition-colors">
                            {effect.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {audio && (
              <>
                {/* Trim */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 20 }} className="bg-[#060d18] border border-[#1e78ff]/20 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-[#e8f4ff] mb-4 flex items-center gap-2">
                    <Music className="w-4 h-4" /> Trim
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
                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  {history.length > 0 && (
                    <Button onClick={handleUndo} variant="outline" className="w-full gap-2">
                      <RotateCcw className="w-4 h-4" /> Undo
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}