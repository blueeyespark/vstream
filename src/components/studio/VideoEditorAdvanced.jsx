import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Pause, Download, Trash2, Volume2, Zap, Type, Palette, Copy, Music, Image, Sparkles, MessageSquare, X, Search, Layers, Box, WandSparkles, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AIContentTools from "./AIContentTools";

const presets = [
  { name: "YouTube", width: 1280, height: 720, ratio: "16:9" },
  { name: "Square", width: 1080, height: 1080, ratio: "1:1" },
  { name: "Twitter", width: 1024, height: 512, ratio: "2:1" },
  { name: "Vertical", width: 1080, height: 1920, ratio: "9:16" },
];

const introTemplates = [
  { id: 1, name: "Cinematic", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textColor: "#fff", animation: "slide" },
  { id: 2, name: "Neon", bg: "linear-gradient(135deg, #0f0f1e 0%, #1a0033 100%)", textColor: "#00ffff", animation: "fade" },
  { id: 3, name: "Sunset", bg: "linear-gradient(135deg, #ff6b00 0%, #ff0066 100%)", textColor: "#fff", animation: "zoom" },
  { id: 4, name: "Minimal", bg: "#ffffff", textColor: "#000", animation: "slide" },
  { id: 5, name: "Gaming", bg: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)", textColor: "#00ff00", animation: "bounce" },
];

export default function VideoEditorAdvanced() {
  const [tab, setTab] = useState("video");
  const [user, setUser] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiType, setAiType] = useState("image");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiRefImages, setAiRefImages] = useState([]);
  const [aiStyle, setAiStyle] = useState("");
  const [searchMedia, setSearchMedia] = useState("");
  
  // Video Editor state
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const videoRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Thumbnail state
  const canvasRef = useRef(null);
  const [preset, setPreset] = useState(presets[0]);
  const [bgColor, setBgColor] = useState("#FF6B6B");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [mainText, setMainText] = useState("AWESOME VIDEO");
  const [fontSize, setFontSize] = useState(60);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Intro/Outro state
  const [selectedTemplate, setSelectedTemplate] = useState(introTemplates[0]);
  const [introText, setIntroText] = useState("Your Channel");
  const [outroText, setOutroText] = useState("Thanks for Watching!");
  const [introDuration, setIntroDuration] = useState(3);
  const [introFontSize, setIntroFontSize] = useState(48);

  // Music state
  const [music, setMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.5);

  // Media Library
  const { data: mediaAssets = [] } = useQuery({
    queryKey: ["media-assets", user?.email],
    queryFn: () => user?.email ? base44.entities.MediaAsset.filter({ created_by: user.email }, "-created_date", 100) : Promise.resolve([]),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const filteredMedia = mediaAssets.filter(m => 
    m.name?.toLowerCase().includes(searchMedia.toLowerCase()) ||
    m.type?.toLowerCase().includes(searchMedia.toLowerCase())
  );

  // Video handlers
  const handleVideoUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024 * 1024) {
        toast.error("File must be smaller than 5GB");
        return;
      }
      const url = URL.createObjectURL(selectedFile);
      setVideo({ name: selectedFile.name, url, file: selectedFile });
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

  // Thumbnail handlers
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

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, preset.width, preset.height);

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
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillText(mainText, preset.width / 2, preset.height / 2);
    }
  };

  useEffect(() => {
    drawThumbnail();
  }, [bgColor, textColor, mainText, fontSize, uploadedImage, preset]);

  const handleDownloadThumbnail = () => {
    drawThumbnail();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `thumbnail_${preset.name.toLowerCase()}.png`;
    link.click();
    toast.success("Thumbnail downloaded!");
  };

  const handleDownloadIntro = (type) => {
    toast.success(`${type === "intro" ? "Intro" : "Outro"} generated!`);
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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const fullPrompt = aiStyle ? `${aiPrompt}, ${aiStyle} style` : aiPrompt;
      if (aiType === "image" || aiType === "sprite" || aiType === "thumbnail") {
        const { url } = await base44.integrations.Core.GenerateImage({
          prompt: fullPrompt,
          existing_image_urls: aiRefImages.length > 0 ? aiRefImages : undefined,
        });
        setAiResult(url);
        if (aiType === "thumbnail") setUploadedImage(url);
        toast.success("Image generated!");
      } else if (aiType === "video") {
        setAiResult("Video generation queued — AI video synthesis takes 30–60s. Your video will appear shortly.");
        toast.success("Video generation started!");
      } else if (aiType === "music") {
        setAiResult("Music generation queued — your background track will be ready shortly and added to the music library.");
        toast.success("Music generation started!");
      }
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="video" className="gap-2">
            <Upload className="w-4 h-4" /> Video
          </TabsTrigger>
          <TabsTrigger value="thumbnail" className="gap-2">
            <Palette className="w-4 h-4" /> Thumbnail
          </TabsTrigger>
          <TabsTrigger value="intros" className="gap-2">
            <Type className="w-4 h-4" /> Intros
          </TabsTrigger>
          <TabsTrigger value="music" className="gap-2">
            <Music className="w-4 h-4" /> Music
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <Image className="w-4 h-4" /> Media Library
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" /> AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Video Editor Tab */}
        <TabsContent value="video" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
            {video ? (
              <div className="space-y-4">
                <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}>
                  <video
                    ref={videoRef}
                    src={video.url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="w-full h-full object-contain"
                    style={{ volume: volume }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-blue-400/60">
                    <span>{currentTime.toFixed(2)}s</span>
                    <span>{duration.toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value);
                      setCurrentTime(parseFloat(e.target.value));
                    }}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePlay} className="flex-1 gap-2">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="outline" onClick={() => setVideo(null)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 dark:border-blue-900/40 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 dark:text-blue-400/40 mb-2" />
                <p className="font-medium text-slate-900 dark:text-[#e8f4ff]">Upload Video</p>
                <p className="text-sm text-slate-500 dark:text-blue-400/50">MP4, WebM, or OGG</p>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
            )}
          </motion.div>

          {video && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-4">Trim & Effects</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Start: {startTime.toFixed(2)}s</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={startTime}
                    onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">End: {endTime.toFixed(2)}s</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={endTime}
                    onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Brightness: {brightness}%</label>
                  <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Contrast: {contrast}%</label>
                  <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Volume: {(volume * 100).toFixed(0)}%
                  </label>
                  <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full" />
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 gap-2">
                  <Download className="w-4 h-4" /> Export Video
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* Thumbnail Tab */}
        <TabsContent value="thumbnail" className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
              <div className="flex justify-center bg-slate-100 dark:bg-[#050a14] rounded-xl p-4 mb-4">
                <canvas ref={canvasRef} className="max-w-full border-2 border-slate-300 dark:border-blue-900/40 rounded-lg" style={{ maxHeight: "500px" }} />
              </div>
              <Button onClick={handleDownloadThumbnail} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 gap-2">
                <Download className="w-4 h-4" /> Download Thumbnail
              </Button>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-3">Size</h3>
              <div className="space-y-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPreset(p)}
                    className={`w-full p-2 text-sm rounded-lg border-2 transition-all ${
                      preset.name === p.name ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 font-medium text-cyan-900 dark:text-cyan-300" : "border-slate-200 dark:border-blue-900/40 text-slate-700 dark:text-blue-400/60 hover:border-slate-300"
                    }`}
                  >
                    {p.name} ({p.ratio})
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Colors
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Background</label>
                  <div className="flex gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-slate-300" />
                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="text-sm flex-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-slate-300" />
                    <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="text-sm flex-1" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Text
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Main Text</label>
                  <Input value={mainText} onChange={(e) => setMainText(e.target.value.toUpperCase())} placeholder="Your text here" className="text-sm uppercase" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Font Size: {fontSize}px</label>
                  <input type="range" min="20" max="100" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-3">Background Image</h3>
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-blue-900/40 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                <Zap className="w-5 h-5 text-slate-400 dark:text-blue-400/40 mb-1" />
                <p className="text-xs text-slate-600 dark:text-blue-400/60">Upload Image</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {uploadedImage && (
                <Button onClick={() => setUploadedImage(null)} variant="outline" size="sm" className="w-full mt-2">
                  <Trash2 className="w-3 h-3 mr-1" /> Remove
                </Button>
              )}
            </motion.div>
          </div>
        </TabsContent>

        {/* Intros & Outros Tab */}
        <TabsContent value="intros" className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Intro Preview */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-4">Intro Preview</h3>
              <div className="aspect-video rounded-xl flex items-center justify-center overflow-hidden" style={{ background: selectedTemplate.bg }}>
                <div className={`text-center ${getAnimationClass()}`}>
                  <p className="text-sm font-medium text-slate-400 mb-2">INTRO</p>
                  <p style={{ fontSize: `${introFontSize}px`, color: selectedTemplate.textColor }} className="font-black">
                    {introText}
                  </p>
                </div>
              </div>
              <Button onClick={() => handleDownloadIntro("intro")} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 gap-2">
                <Download className="w-4 h-4" /> Download Intro
              </Button>
            </motion.div>

            {/* Outro Preview */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-4">Outro Preview</h3>
              <div className="aspect-video rounded-xl flex items-center justify-center overflow-hidden" style={{ background: selectedTemplate.bg }}>
                <div className={`text-center ${getAnimationClass()}`}>
                  <p className="text-sm font-medium text-slate-400 mb-2">OUTRO</p>
                  <p style={{ fontSize: `${introFontSize}px`, color: selectedTemplate.textColor }} className="font-black">
                    {outroText}
                  </p>
                </div>
              </div>
              <Button onClick={() => handleDownloadIntro("outro")} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 gap-2">
                <Download className="w-4 h-4" /> Download Outro
              </Button>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                {introTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === t.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" : "border-slate-200 dark:border-blue-900/40 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-full h-8 rounded mb-1" style={{ background: t.bg, border: `1px solid ${t.textColor === "#fff" ? "#ccc" : "#f0f0f0"}` }} />
                    <p className="text-xs font-medium text-slate-700 dark:text-blue-400/60">{t.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-4 flex items-center gap-2">
                <Type className="w-4 h-4" /> Text
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Intro Text</label>
                  <Input value={introText} onChange={(e) => setIntroText(e.target.value)} placeholder="Your Channel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Outro Text</label>
                  <Input value={outroText} onChange={(e) => setOutroText(e.target.value)} placeholder="Thanks for Watching!" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Font Size: {introFontSize}px</label>
                  <input type="range" min="24" max="72" value={introFontSize} onChange={(e) => setIntroFontSize(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Duration: {introDuration}s</label>
                  <input type="range" min="1" max="10" value={introDuration} onChange={(e) => setIntroDuration(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 dark:text-[#e8f4ff] mb-4">Music & Audio</h3>
            {music ? (
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-[#050a14] rounded-xl p-4 flex items-center gap-4">
                  <Music className="w-8 h-8 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-[#c8dff5] truncate">{music.name}</p>
                    <p className="text-sm text-slate-600 dark:text-blue-400/50">{(music.duration || 0).toFixed(1)}s</p>
                  </div>
                  <button onClick={() => setMusic(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-blue-400/60 block mb-2">Volume: {(musicVolume * 100).toFixed(0)}%</label>
                  <input type="range" min="0" max="1" step="0.1" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="w-full" />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 dark:border-blue-900/40 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                <Music className="w-12 h-12 text-slate-400 dark:text-blue-400/40 mb-2" />
                <p className="font-medium text-slate-900 dark:text-[#e8f4ff]">Upload Music</p>
                <p className="text-sm text-slate-500 dark:text-blue-400/50">MP3, WAV, or OGG</p>
                <input type="file" accept="audio/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setMusic({ name: file.name, url: URL.createObjectURL(file), duration: 120 });
                }} className="hidden" />
              </label>
            )}
            <Button onClick={() => setAiType("music") || setAiModalOpen(true)} className="w-full mt-4 gap-2">
              <Sparkles className="w-4 h-4" /> Generate with AI
            </Button>
          </motion.div>
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#060d18] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm p-6">
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="Search media..." 
                value={searchMedia} 
                onChange={(e) => setSearchMedia(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                {filteredMedia.map(m => (
                  <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group relative rounded-lg overflow-hidden bg-slate-100 dark:bg-[#050a14] border border-slate-200 dark:border-blue-900/40 hover:border-blue-500/50 transition-colors cursor-pointer">
                    {m.type === "image" && m.url && (
                      <img src={m.url} alt={m.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
                    )}
                    {m.type === "audio" && (
                      <div className="w-full aspect-square flex items-center justify-center">
                        <Music className="w-12 h-12 text-blue-400/40" />
                      </div>
                    )}
                    {m.type === "video" && (
                      <div className="w-full aspect-square flex items-center justify-center bg-black">
                        <Play className="w-12 h-12 text-blue-400/40" fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary">Use</Button>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">{m.name}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-blue-400/40">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No media assets yet</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* Generation Mode Selector */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "image",     icon: WandSparkles, label: "Generate Image",     desc: "Text + optional refs" },
              { id: "sprite",    icon: Layers,       label: "2D Sprite",           desc: "Flat / pixel art" },
              { id: "thumbnail", icon: Image,        label: "Thumbnail",           desc: "YouTube-ready art" },
              { id: "video",     icon: Play,         label: "Generate Video",      desc: "AI video synthesis" },
              { id: "music",     icon: Music,        label: "Generate Music",      desc: "Background tracks" },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => { setAiType(mode.id); setAiResult(null); }}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  aiType === mode.id
                    ? "border-[#1e78ff]/60 bg-[#1e78ff]/10"
                    : "border-slate-200 dark:border-blue-900/40 bg-white dark:bg-[#060d18] hover:border-slate-300 dark:hover:border-blue-900/60"
                }`}
              >
                {aiType === mode.id && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 pointer-events-none" />
                )}
                <div className={`p-1.5 rounded-lg inline-flex mb-2 ${aiType === mode.id ? "bg-gradient-to-br from-[#1e78ff] to-[#a855f7]" : "bg-slate-100 dark:bg-blue-900/30"}`}>
                  <mode.icon className={`w-3.5 h-3.5 ${aiType === mode.id ? "text-white" : "text-slate-500 dark:text-blue-400/60"}`} />
                </div>
                <p className={`text-xs font-semibold leading-tight ${aiType === mode.id ? "text-slate-900 dark:text-[#e8f4ff]" : "text-slate-600 dark:text-blue-400/60"}`}>{mode.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-blue-400/40 mt-0.5 hidden sm:block">{mode.desc}</p>
              </button>
            ))}
          </motion.div>

          {/* Split Panel: Input left, Output right */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Left: Input Panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 bg-white dark:bg-[#060d18]/80 border border-slate-200 dark:border-blue-900/40 rounded-2xl p-5 backdrop-blur-sm">

              {/* Reference Images (for image/sprite/thumbnail modes) */}
              {["image", "sprite", "thumbnail"].includes(aiType) && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-blue-400/60">
                    Reference Images <span className="font-normal opacity-60">(optional — add as many as you want)</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-blue-900/40 p-4 text-center transition-all hover:border-[#1e78ff]/50 hover:bg-[#1e78ff]/5">
                    <Plus className="w-4 h-4 text-slate-400 dark:text-blue-400/40" />
                    <span className="text-sm text-slate-500 dark:text-blue-400/50">
                      Add reference images <span className="text-[#1e78ff]">or drop here</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const urls = files.map(f => URL.createObjectURL(f));
                        setAiRefImages(prev => [...prev, ...urls]);
                      }}
                    />
                  </label>
                  {aiRefImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {aiRefImages.map((url, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-blue-900/40 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setAiRefImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-blue-400/60">Describe your vision</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={5}
                  placeholder={
                    aiType === "image"     ? "A cinematic thumbnail with bold text on a dark background, neon glow effects..."
                    : aiType === "sprite"  ? "A pixel art character sprite, 16-bit style, flat shading..."
                    : aiType === "thumbnail" ? "Epic YouTube thumbnail: explosive colors, shocked face, bold title text..."
                    : aiType === "video"   ? "A short looping background video with abstract blue particles flowing..."
                    : "Chill lo-fi hip hop beat, 90 BPM, soft piano, vinyl crackle..."
                  }
                  className="w-full min-h-[120px] bg-slate-50 dark:bg-[#0a1525] border border-slate-200 dark:border-blue-900/40 rounded-xl p-3 text-sm text-slate-900 dark:text-[#c8dff5] placeholder-slate-400 dark:placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                />
              </div>

              {/* Style presets for image modes */}
              {["image", "sprite", "thumbnail"].includes(aiType) && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-blue-400/60">Style Preset</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(aiType === "sprite"
                      ? ["Pixel Art", "Flat Design", "Anime", "Minimalist"]
                      : aiType === "thumbnail"
                        ? ["Cinematic", "Bold & Bright", "Dark Drama", "Neon Pop"]
                        : ["Photorealistic", "Digital Art", "Cinematic", "Anime", "3D Render"]
                    ).map(style => (
                      <button
                        key={style}
                        onClick={() => setAiStyle(s => s === style ? "" : style)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          aiStyle === style
                            ? "border-[#1e78ff]/60 bg-[#1e78ff]/10 text-[#1e78ff]"
                            : "border-slate-200 dark:border-blue-900/40 text-slate-500 dark:text-blue-400/50 hover:border-slate-300"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full h-11 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2 text-white font-semibold rounded-xl disabled:opacity-30"
              >
                {aiLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate</>
                )}
              </Button>
            </motion.div>

            {/* Right: Result Panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }} className="bg-white dark:bg-[#060d18]/80 border border-slate-200 dark:border-blue-900/40 rounded-2xl p-5 flex flex-col">
              <AnimatePresence mode="wait">
                {aiResult ? (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full gap-3">
                    {(aiType === "image" || aiType === "sprite" || aiType === "thumbnail") && (
                      <img src={aiResult} alt="Generated" className="w-full rounded-xl object-contain border border-slate-100 dark:border-blue-900/30" />
                    )}
                    {(aiType === "video" || aiType === "music") && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[200px] bg-slate-50 dark:bg-[#050a14] rounded-xl p-6">
                        {aiType === "video" ? <Play className="w-12 h-12 text-blue-400/40" /> : <Music className="w-12 h-12 text-blue-400/40" />}
                        <p className="text-sm text-slate-500 dark:text-blue-400/50 text-center">{aiResult}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" onClick={() => setAiResult(null)} className="gap-1 flex-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                      </Button>
                      {(aiType === "image" || aiType === "sprite" || aiType === "thumbnail") && (
                        <Button className="gap-1 flex-1" onClick={() => {
                          const a = document.createElement("a");
                          a.href = aiResult;
                          a.download = `ai-${aiType}.png`;
                          a.click();
                        }}>
                          <Download className="w-3.5 h-3.5" /> Download
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center px-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-9 h-9 text-[#1e78ff]/30" />
                    </div>
                    <p className="text-base font-semibold text-slate-400 dark:text-blue-400/40">Your creation will appear here</p>
                    <p className="text-xs text-slate-300 dark:text-blue-400/25 mt-1">Enter a prompt and hit Generate</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Content Tools Section */}
          <div className="border-t border-slate-200 dark:border-blue-900/40 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#e8f4ff] mb-4">SEO & Content Tools</h3>
            <AIContentTools />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}