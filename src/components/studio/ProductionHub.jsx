import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Pause, Download, Plus, Image, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProductionHub() {
  const [activeTab, setActiveTab] = useState("video");
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleMediaUpload = (e, mediaType) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaItems(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        type: mediaType,
        url,
      }]);
    });
    toast.success(`${files.length} file(s) imported`);
  };

  const EDITOR_TABS = [
    { id: "video", label: "Video", icon: Play, desc: "Edit & trim videos" },
    { id: "thumbnail", label: "Thumbnails", icon: Image, desc: "Create thumbnails" },
    { id: "intro", label: "Intros", icon: Sparkles, desc: "Make intros/outros" },
    { id: "music", label: "Music", icon: Music, desc: "Audio & music" },
  ];

  return (
    <div className="space-y-6">
      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {EDITOR_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Video Editor Tab */}
        <TabsContent value="video" className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Media Library */}
            <div className="col-span-1 bg-[#060d18] border border-blue-900/40 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-blue-300">Media Library</h3>
                <label className="cursor-pointer">
                  <Plus className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                  <input type="file" multiple accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} className="hidden" />
                </label>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mediaItems.filter(m => m.type === 'video').map(item => (
                  <motion.div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`p-2 rounded border-2 cursor-pointer transition-all ${
                      selectedMedia?.id === item.id ? "border-cyan-500 bg-cyan-500/10" : "border-blue-900/30"
                    }`}
                  >
                    <p className="text-xs font-medium text-blue-100 truncate">{item.name}</p>
                  </motion.div>
                ))}
                {mediaItems.filter(m => m.type === 'video').length === 0 && (
                  <p className="text-xs text-blue-400/40 text-center py-4">No videos uploaded</p>
                )}
              </div>
            </div>

            {/* Preview & Timeline */}
            <div className="col-span-2 space-y-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                {selectedMedia?.type === 'video' ? (
                  <video ref={videoRef} src={selectedMedia?.url} className="w-full h-full object-contain" />
                ) : (
                  <p className="text-blue-400/40 text-sm">Select a video to preview</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()} className="gap-2">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={() => toast.success("Exporting...")} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Thumbnail Editor Tab */}
        <TabsContent value="thumbnail" className="space-y-4">
          <div className="bg-[#060d18] border border-blue-900/40 rounded-2xl p-6 text-center">
            <Image className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
            <p className="font-bold text-[#c8dff5] mb-1">Thumbnail Creator</p>
            <p className="text-sm text-blue-400/40 mb-4">Design eye-catching thumbnails with templates and effects</p>
            <Button className="gap-2">Open Thumbnail Maker</Button>
          </div>
        </TabsContent>

        {/* Intro/Outro Tab */}
        <TabsContent value="intro" className="space-y-4">
          <div className="bg-[#060d18] border border-blue-900/40 rounded-2xl p-6 text-center">
            <Sparkles className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
            <p className="font-bold text-[#c8dff5] mb-1">Intro & Outro Creator</p>
            <p className="text-sm text-blue-400/40 mb-4">Create animated intros and outros with templates</p>
            <Button className="gap-2">Open Intro Maker</Button>
          </div>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Audio Library */}
            <div className="col-span-1 bg-[#060d18] border border-blue-900/40 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-blue-300">Audio Library</h3>
                <label className="cursor-pointer">
                  <Plus className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                  <input type="file" multiple accept="audio/*" onChange={(e) => handleMediaUpload(e, 'audio')} className="hidden" />
                </label>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mediaItems.filter(m => m.type === 'audio').map(item => (
                  <div key={item.id} className="p-2 rounded border border-blue-900/30 cursor-pointer hover:bg-blue-900/10">
                    <p className="text-xs font-medium text-blue-100 truncate">♪ {item.name}</p>
                  </div>
                ))}
                {mediaItems.filter(m => m.type === 'audio').length === 0 && (
                  <p className="text-xs text-blue-400/40 text-center py-4">No audio files uploaded</p>
                )}
              </div>
            </div>

            {/* Audio Mixer */}
            <div className="col-span-2 bg-[#060d18] border border-blue-900/40 rounded-2xl p-6">
              <p className="text-sm font-bold text-blue-300 mb-4">Audio Mixer</p>
              <div className="flex gap-6">
                {['Master', 'Track 1', 'Track 2'].map((track, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <p className="text-xs text-blue-400">{track}</p>
                    <div className="w-8 h-32 bg-[#0a0e27] rounded-lg border border-blue-900/30 flex items-end justify-center p-1">
                      <input type="range" min="0" max="100" defaultValue="75" className="w-full h-full accent-cyan-500" style={{ writingMode: 'bt-lr' }} orient="vertical" />
                    </div>
                    <span className="text-xs text-blue-400/60">-3dB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}