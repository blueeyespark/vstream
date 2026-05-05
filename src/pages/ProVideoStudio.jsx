import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload, Play, Pause, Download, Trash2, RotateCcw, Settings, Plus,
  Grid3x3, Music, Type, Image, Sparkles, Eye, Volume2, ZoomIn, ZoomOut,
  ChevronDown, Save, Share2, MoreVertical, Maximize2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProVideoTimeline from "@/components/studio/ProVideoTimeline";
import ProVideoEffects from "@/components/studio/ProVideoEffects";
import ProVideoProperties from "@/components/studio/ProVideoProperties";
import ProAudioMixer from "@/components/studio/ProAudioMixer";

const EDITOR_MODES = [
  { id: "video", label: "Video", icon: Play },
  { id: "thumbnail", label: "Thumbnail", icon: Image },
  { id: "intro", label: "Intro/Outro", icon: Sparkles },
];

const PANELS = {
  left: "Media Library & Assets",
  center: "Timeline",
  right: "Properties & Effects",
  bottom: "Audio Mixer"
};

export default function ProVideoStudio() {
  const [user, setUser] = useState(null);
  const [currentMode, setCurrentMode] = useState("video");
  const [project, setProject] = useState({
    name: "Untitled Project",
    duration: 0,
    fps: 30,
    resolution: "1920x1080"
  });

  // Media & Assets (shared with ArtForge gallery)
  const { data: mediaItems = [] } = useQuery({
    queryKey: ["media-assets-gallery"],
    queryFn: async () => {
      try {
        const result = await base44.entities.MediaAsset.list("-created_date", 200);
        return Array.isArray(result) ? result : [];
      } catch (e) {
        console.error("Failed to load media:", e);
        toast.error("Failed to load media library");
        return [];
      }
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Timeline State
  const [tracks, setTracks] = useState([
    { id: "v1", type: "video", name: "Video 1", clips: [] },
    { id: "a1", type: "audio", name: "Audio 1", clips: [] },
    { id: "a2", type: "audio", name: "Audio 2", clips: [] }
  ]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Media filter state
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");

  const filteredMediaItems = mediaItems.filter(item => {
    const matchesSearch = !mediaSearch || (item.name || "").toLowerCase().includes(mediaSearch.toLowerCase());
    const matchesFilter = mediaFilter === "all" || item.type === mediaFilter || item.asset_type === mediaFilter;
    return matchesSearch && matchesFilter;
  });

  // Edit State
  const [selectedClip, setSelectedClip] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showAudioMixer, setShowAudioMixer] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: "mp4",
    quality: "1080p",
    fps: 30,
    codec: "h264"
  });

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) setUser(await response.json());
      } catch (e) {
        console.log('Auth not available');
      }
    };
    initUser();
  }, []);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    try {
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        if (response?.file_url) {
          await base44.entities.MediaAsset.create({
            name: file.name,
            type: file.type.includes('audio') ? 'audio' : 'video',
            url: response.file_url,
            asset_type: file.type.includes('audio') ? 'audio' : 'raw_footage',
            file_size_mb: (file.size / 1024 / 1024).toFixed(2)
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success(`${files.length} file(s) imported to library`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
    }
  };

  const addClipToTrack = (trackId, clip) => {
    const trackType = trackId.startsWith('a') ? 'audio' : 'video';
    if (clip.type && clip.type !== trackType) {
      toast.error(`Can't add ${clip.type} to ${trackType} track`);
      return;
    }
    setTracks(prev => prev.map(t => 
      t.id === trackId 
        ? { ...t, clips: [...t.clips, { id: Date.now(), ...clip, startTime: currentTime, duration: clip.duration || 3 }] }
        : t
    ));
    toast.success('Clip added to timeline');
  };

  const handlePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const saveProject = () => {
    const projectData = JSON.stringify({ project, tracks, mediaItems });
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.vstudio`;
    a.click();
    toast.success('Project saved');
  };

  const exportProject = async () => {
    // Queue export job
    toast.success(`Exporting ${exportSettings.quality} ${exportSettings.format}...`);
    // In production: call processVideoEdit backend function
    setShowExport(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-[#0f1535] border-b border-blue-900/40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/ArtForge'}
            className="text-blue-400 hover:text-blue-200 text-sm font-semibold px-2 py-1 rounded hover:bg-blue-900/20 transition-colors"
            title="Back to ArtForge"
          >
            ← ArtForge
          </button>
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <Input
            value={project.name}
            onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
            className="bg-[#1a1f3a] border-blue-900/30 text-sm w-48"
            placeholder="Project name"
          />
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1 bg-[#1a1f3a] rounded-lg p-1">
          {EDITOR_MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setCurrentMode(mode.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  currentMode === mode.id
                    ? "bg-blue-600 text-white"
                    : "text-blue-400/60 hover:text-blue-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleUndo} className="text-blue-400 hover:bg-blue-900/20">
            ↶ Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} className="text-blue-400 hover:bg-blue-900/20">
            ↷ Redo
          </Button>
          <div className="w-px h-6 bg-blue-900/40" />
          <Button size="sm" onClick={saveProject} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" /> Save
          </Button>
          <Button size="sm" onClick={() => setShowExport(true)} className="gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Panel: Unified Media Library */}
        <div className="w-64 bg-[#0f1535] border-r border-blue-900/40 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-300">MEDIA LIBRARY</h3>
              <span className="text-[10px] text-blue-400/40">{mediaItems.length} assets</span>
            </div>
            <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" /> Import Files
              <input type="file" multiple accept="video/*,audio/*,image/*" onChange={handleMediaUpload} className="hidden" />
            </label>
            {/* Search */}
            <input
              type="text"
              placeholder="Search assets..."
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              className="w-full bg-[#0a0e27] border border-blue-900/30 rounded px-2 py-1 text-xs text-blue-200 placeholder-blue-400/30 outline-none focus:border-blue-600"
            />
            {/* Filter tabs */}
            <div className="flex gap-1">
              {["all","video","image","audio"].map(f => (
                <button
                  key={f}
                  onClick={() => setMediaFilter(f)}
                  className={`flex-1 text-[10px] py-0.5 rounded transition-colors ${mediaFilter === f ? "bg-blue-600 text-white" : "text-blue-400/50 hover:text-blue-300"}`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Media Items grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {filteredMediaItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedMedia(item)}
                  className={`rounded border-2 cursor-pointer transition-all overflow-hidden group ${
                    selectedMedia?.id === item.id
                      ? "border-cyan-500"
                      : "border-blue-900/30 hover:border-blue-600/60"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-[#0a0e27] relative">
                    {item.url && (item.type === "video" || item.asset_type === "raw_footage") ? (
                      <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                    ) : item.url && (item.type === "image" || item.type === "2d_model" || item.type === "3d_model" || item.type === "sticker" || item.type === "comic") ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-400/30 text-xs">
                        {item.type === "audio" ? "🎵" : "📁"}
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-0.5 left-0.5">
                      <span className={`text-[8px] px-1 rounded font-bold ${
                        item.type === "video" ? "bg-purple-600" :
                        item.type === "audio" ? "bg-green-600" :
                        item.type === "image" ? "bg-blue-600" : "bg-orange-600"
                      } text-white`}>{(item.type || "?").slice(0,3).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="p-1">
                    <p className="text-[9px] text-blue-300 truncate font-medium">{item.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredMediaItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-blue-400/30">No assets yet</p>
                <p className="text-[10px] text-blue-400/20 mt-1">Import files or create in ArtForge</p>
              </div>
            )}
          </div>

          {/* Selected Media Actions */}
          {selectedMedia && (
            <div className="p-2 border-t border-blue-900/40 space-y-1">
              <p className="text-[10px] text-blue-400/60 truncate">{selectedMedia.name}</p>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  size="sm"
                  onClick={() => addClipToTrack('v1', selectedMedia)}
                  className="text-[10px] h-6 bg-blue-600 hover:bg-blue-700 px-1"
                >
                  + Video Track
                </Button>
                <Button
                  size="sm"
                  onClick={() => addClipToTrack('a1', selectedMedia)}
                  className="text-[10px] h-6 bg-green-700 hover:bg-green-600 px-1"
                >
                  + Audio Track
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Timeline */}
        <div className="flex-1 bg-[#0a0e27] flex flex-col">
          <ProVideoTimeline
            tracks={tracks}
            currentTime={currentTime}
            duration={duration}
            zoom={zoom}
            isPlaying={isPlaying}
            selectedClip={selectedClip}
            onSelectClip={setSelectedClip}
            onTimeChange={setCurrentTime}
            onDurationChange={setDuration}
          />

          {/* Preview Area */}
          <div className="h-64 bg-black border-t border-blue-900/40 p-4 flex items-center justify-center relative">
            <div className="aspect-video bg-[#0f1535] rounded-lg overflow-hidden flex items-center justify-center relative" style={{ maxHeight: "100%" }}>
              {selectedMedia?.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={selectedMedia?.url}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />
              ) : (
                <p className="text-blue-400/40 text-sm">Preview Area</p>
              )}
            </div>

            {/* Playback Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Button size="sm" onClick={handlePlay} className="bg-blue-600 hover:bg-blue-700 w-10 h-10 p-0">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              <span className="text-xs text-blue-400 font-mono w-20">
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="border-blue-900/40 text-blue-400 w-8 h-8 p-0"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-blue-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className="border-blue-900/40 text-blue-400 w-8 h-8 p-0"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Properties & Effects */}
        <div className="w-80 bg-[#0f1535] border-l border-blue-900/40 flex flex-col overflow-hidden">
          {selectedClip ? (
            <ProVideoProperties clip={selectedClip} onUpdate={(updated) => setSelectedClip(updated)} />
          ) : (
            <ProVideoEffects />
          )}
        </div>
      </div>

      {/* Bottom: Audio Mixer */}
      {showAudioMixer && (
        <div className="h-40 bg-[#0f1535] border-t border-blue-900/40">
          <ProAudioMixer tracks={tracks} />
        </div>
      )}

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1535] border border-blue-900/40 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Export Project</h3>
                <button onClick={() => setShowExport(false)} className="text-blue-400 hover:text-blue-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-blue-300 block mb-2">Format</label>
                  <select
                    value={exportSettings.format}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full bg-[#1a1f3a] border border-blue-900/40 rounded p-2 text-sm text-white"
                  >
                    <option>mp4</option>
                    <option>mov</option>
                    <option>webm</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-blue-300 block mb-2">Quality</label>
                  <select
                    value={exportSettings.quality}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full bg-[#1a1f3a] border border-blue-900/40 rounded p-2 text-sm text-white"
                  >
                    <option>480p</option>
                    <option>720p</option>
                    <option>1080p</option>
                    <option>4K</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-blue-300 block mb-2">Frame Rate</label>
                  <select
                    value={exportSettings.fps}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                    className="w-full bg-[#1a1f3a] border border-blue-900/40 rounded p-2 text-sm text-white"
                  >
                    <option value="24">24 fps</option>
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExport(false)}
                  variant="outline"
                  className="flex-1 border-blue-900/40 text-blue-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={exportProject}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}