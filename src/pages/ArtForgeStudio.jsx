import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WandSparkles, Layers, Box, Plus, X, Sparkles, Download,
  RefreshCw, Image, LayoutGrid, Clock, Trash2, FileText,
  Loader2, Copy, Check, Type, Tag, Lightbulb, Heart,
  Search, Minus, Film, Smile, Package, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Generation modes ──────────────────────────────────────────────────────────
const MODES = [
  {
    id: "image",
    label: "Image",
    desc: "AI artwork from text",
    icon: WandSparkles,
    gradient: "from-[#1e78ff] to-[#a855f7]",
    placeholder: "A fierce dragon soaring over a neon-lit cyberpunk city at midnight, lightning reflected in its scales...",
    suffix: ", masterpiece, highly detailed, sharp focus, professional lighting, 8k resolution, award-winning digital art",
    supportsVideo: false,
  },
  {
    id: "2d_model",
    label: "2D / Sprite",
    desc: "Game sprites, VTuber sheets & art",
    icon: Layers,
    gradient: "from-[#a855f7] to-[#1e78ff]",
    placeholder: "A warrior mage character, front-facing idle pose, clean linework, transparent background...",
    suffix: "", // handled by 2D sub-mode
    supportsVideo: false,
    hasSubModes: true,
  },
  {
    id: "3d_model",
    label: "3D Render",
    desc: "VRChat, VRM & 3D model renders",
    icon: Box,
    gradient: "from-[#f97316] to-[#a855f7]",
    placeholder: "A fox girl character, pastel outfit, suitable for VRChat, anime toon shader style...",
    suffix: "", // handled by 3D sub-mode
    supportsVideo: false,
    hasSubModes: true,
  },
  {
    id: "sticker",
    label: "Sticker",
    desc: "Die-cut sticker style art",
    icon: Sparkles,
    gradient: "from-[#f97316] to-[#facc15]",
    placeholder: "A cute kawaii cat giving a thumbs up, big expressive eyes, bold black outline...",
    suffix: ", die-cut sticker, thick bold black outline, pure white background, clean vector art, flat fill colors, no gradients, no background elements, sticker sheet ready",
    supportsVideo: false,
  },
  {
    id: "comic",
    label: "Comic",
    desc: "Comic panel / strip art",
    icon: LayoutGrid,
    gradient: "from-[#22c55e] to-[#1e78ff]",
    placeholder: "A superhero landing dramatically on a city rooftop at night, comic book style with bold ink lines...",
    suffix: ", professional comic book illustration, bold ink outlines, cel shading, halftone dot shadows, CMYK vibrant colors, dynamic perspective, action composition, Marvel/DC quality",
    supportsVideo: false,
  },
  {
    id: "video",
    label: "Video",
    desc: "AI generated short video",
    icon: Film,
    gradient: "from-[#ec4899] to-[#a855f7]",
    placeholder: "A majestic eagle soaring above snow-capped mountains, golden hour light, cinematic wide shot...",
    suffix: ", cinematic quality, smooth camera motion, professional color grading, 4K resolution, high frame rate, dramatic lighting",
    supportsVideo: true,
  },
];

// ─── 2D Sub-modes ─────────────────────────────────────────────────────────────
const SUBMODES_2D = [
  {
    id: "sprite",
    label: "Game Sprite",
    desc: "Pixel & vector game characters",
    placeholder: "A knight character, sword raised, idle pose, pixel art style...",
    suffix: ", game sprite asset, crisp pixel art, flat vector illustration, clean hard edges, transparent background, no shadows, no background, isolated character on alpha, ready for Unity/Godot",
  },
  {
    id: "spritesheet",
    label: "Sprite Sheet",
    desc: "Animation frame layout",
    placeholder: "A slime creature with walk, idle, and attack animation frames, 8 frames each...",
    suffix: ", sprite sheet layout, multiple animation frames in a grid, 8x8 grid format, pixel art, consistent character across all frames, transparent background, game ready",
  },
  {
    id: "vtuber_live2d",
    label: "VTuber / Live2D",
    desc: "VTuber model reference sheet",
    placeholder: "A fox girl VTuber with silver hair, golden eyes, hoodie with ears, cheerful expression...",
    suffix: ", VTuber character design, Live2D rigging reference sheet, front-facing neutral pose, clean anime linework, separate body parts visible (hair, face, body, hands), flat cel shading, white background, professional VTuber model quality, suitable for Live2D rigging, inspired by Hololive and Nijisanji model quality",
  },
  {
    id: "pngtuber",
    label: "PNGTuber",
    desc: "Talking PNG avatar for streaming",
    placeholder: "A cute chibi cat VTuber avatar, open mouth and closed mouth versions, soft pastel colors...",
    suffix: ", PNGTuber streaming avatar, chibi proportions, 2 states: mouth open and mouth closed side by side, expressive large eyes, pure white or transparent background, clean vector cartoon style, suitable for VTube Studio / veadotube mini, streamer avatar quality",
  },
  {
    id: "reference_sheet",
    label: "Character Sheet",
    desc: "Full character reference design",
    placeholder: "A dark elf ranger with a longbow, leather armor, turquoise eyes, showing front/side/back views...",
    suffix: ", full character reference sheet, front view center + side view right + back view left, clean anime/illustration style, labeled color swatches, white background, professional concept art quality, used by game studios and anime studios",
  },
  {
    id: "ui_asset",
    label: "UI Asset",
    desc: "Game UI icons and elements",
    placeholder: "A set of RPG inventory icons: sword, shield, potion, key, map, all in fantasy style...",
    suffix: ", game UI asset, icon set, consistent art style across all items, flat or slightly skeuomorphic, 512x512 each, transparent background, clean linework, suitable for Unity/Unreal Engine HUD",
  },
];

// ─── 3D Sub-modes ─────────────────────────────────────────────────────────────
const SUBMODES_3D = [
  {
    id: "vrchat_anime",
    label: "VRChat Anime",
    desc: "Anime avatar for VRChat/VRM",
    placeholder: "A magical girl with long pink twin tails, white dress, star wand, anime style...",
    suffix: ", VRChat-ready anime avatar render, VRM avatar format reference, toon shader cel shading, Unity HDRP compatible, clean topology humanoid rig, expressive face bones, anime proportions, inspired by popular VRChat anime avatars, studio lighting on white background, T-pose or A-pose, Blender Eevee quality render",
  },
  {
    id: "vrchat_furry",
    label: "VRChat Furry",
    desc: "Furry / anthro avatar for VRChat",
    placeholder: "A wolf anthro character with blue fur, leather jacket, glowing cyan eyes, VRChat avatar...",
    suffix: ", VRChat furry anthro avatar concept, VRCArena quality, digitigrade or plantigrade legs, fur texture detail, fully rigged humanoid skeleton compatible, expressive face for blendshapes, clean white studio background, front-facing A-pose, Blender Cycles render, high polygon fur card detail",
  },
  {
    id: "vrchat_scifi",
    label: "VRChat Sci-Fi",
    desc: "Futuristic / mech avatar",
    placeholder: "A cybernetic android with glowing blue circuits, chrome armor, holographic visor...",
    suffix: ", VRChat sci-fi avatar concept art, hard surface armor modeling reference, PBR metallic/roughness textures, emissive glowing elements, humanoid bone structure, Unity compatible, octane render quality, clean studio HDRI lighting, front A-pose turntable view",
  },
  {
    id: "vrchat_fantasy",
    label: "VRChat Fantasy",
    desc: "Fantasy creature or knight",
    placeholder: "A dark elf warlock with horns, tattered robe, glowing purple runes on skin...",
    suffix: ", VRChat fantasy avatar design, detailed fantasy character concept, rigging-ready humanoid proportions, high quality PBR textures reference, dynamic cloth and hair simulation capable, expressive blendshape face reference, Sketchfab/Gumroad quality avatar, clean white background render",
  },
  {
    id: "vrm_model",
    label: "VRM / VSeeFace",
    desc: "VRM model for VTubing in 3D",
    placeholder: "A 3D VTuber character, boy with spiky blue hair, streamer hoodie, holding a mic...",
    suffix: ", VRM 3D avatar for VTubing, VSeeFace/ThreeDPoseTracker compatible, clean anime toon shader, expressive blendshapes reference (happy, sad, surprised, angry), A-pose front view with side view, humanoid rig visible, suitable for export from VRoid Studio, Hololive 3D model quality standard",
  },
  {
    id: "lowpoly",
    label: "Low Poly",
    desc: "Stylized low-poly game model",
    placeholder: "A low-poly fox character, geometric faceted style, autumn colors, game ready...",
    suffix: ", stylized low-poly 3D model, faceted geometric design, visible polygon faces, flat shading no normal maps, Unity/Unreal Engine game asset, less than 5000 polygons, clean topology reference, white background studio render, Blender low-poly aesthetic, suitable for mobile games",
  },
  {
    id: "3d_render",
    label: "3D Render",
    desc: "Photorealistic 3D render",
    placeholder: "A detailed 3D robot character, mechanical joints, battle-worn paint, dramatic lighting...",
    suffix: ", professional 3D render, Blender Cycles or Octane render, PBR textures with metallic/roughness/AO maps, HDRI studio lighting, depth of field bokeh, subsurface scattering on skin, ray-traced reflections, 8K render quality, clean white or gradient background, product visualization quality",
  },
];

// ─── Sticker style presets ────────────────────────────────────────────────────
const STICKER_STYLES = [
  { id: "kawaii", label: "Kawaii", suffix: ", super cute kawaii chibi style, pastel pink and blue palette, oversized sparkly eyes, rosy cheeks, adorable expression, clean vector lines" },
  { id: "bold", label: "Bold", suffix: ", bold street-art sticker style, very thick black outlines, high saturation flat colors, strong contrast, graphic design quality" },
  { id: "emoji", label: "Emoji", suffix: ", emoji-style illustration, simple expressive face, perfectly round shape, flat design, yellow skin tone, Google Noto emoji quality" },
  { id: "retro", label: "Retro", suffix: ", retro 80s vintage sticker, neon pink and cyan palette, halftone dot shading, worn edges, old-school cartoon style" },
  { id: "minimal", label: "Minimal", suffix: ", ultra-minimal single-line art sticker, one continuous thin black line, pure white fill, no color, elegant simplicity" },
  { id: "3d", label: "3D Pop", suffix: ", inflatable 3D puffy sticker, glossy plastic sheen, smooth rounded edges, soft drop shadow, bubbly toy-like appearance, Bearbrick style" },
];

const STICKER_PACK_SIZES = [1, 4, 8, 12];

// ─── Style tags (each maps to a rich prompt modifier) ─────────────────────────
const STYLE_TAGS = [
  "Cinematic", "Anime", "Pixel Art", "Oil Painting", "Watercolor",
  "Neon Noir", "Photorealistic", "Sketch", "Fantasy", "Sci-Fi",
  "Minimalist", "Dark & Moody", "Vibrant", "Retro", "Cyberpunk",
];

const STYLE_TAG_MODIFIERS = {
  "Cinematic": "cinematic color grading, anamorphic lens, dramatic lighting, film grain, golden ratio composition",
  "Anime": "anime illustration style, cel shading, clean linework, expressive eyes, Japanese animation quality",
  "Pixel Art": "pixel art, 32x32 grid, limited color palette, retro game aesthetic, dithering",
  "Oil Painting": "oil painting, thick impasto brushstrokes, rich texture, classical composition, old masters technique",
  "Watercolor": "loose watercolor painting, soft wet-on-wet edges, translucent washes, paper texture showing through",
  "Neon Noir": "neon noir, rain-slicked streets, glowing neon signs, deep shadows, high contrast, cyberpunk atmosphere",
  "Photorealistic": "photorealistic, hyperdetailed, 8K DSLR photograph, natural lighting, sharp focus",
  "Sketch": "pencil sketch, cross-hatching, graphite on paper, rough gestural lines, artist study",
  "Fantasy": "epic fantasy illustration, magical atmosphere, mystical lighting, intricate detail, concept art quality",
  "Sci-Fi": "science fiction concept art, futuristic technology, hard surface design, metallic textures, bioluminescent elements",
  "Minimalist": "minimalist design, flat colors, negative space, geometric simplicity, clean composition",
  "Dark & Moody": "dark moody atmosphere, low key lighting, dramatic shadows, desaturated palette, emotional depth",
  "Vibrant": "ultra vibrant colors, high saturation, pop art energy, bold complementary colors, visually striking",
  "Retro": "retro vintage aesthetic, muted earthy tones, grain texture, nostalgic 1970s feel, aged look",
  "Cyberpunk": "cyberpunk aesthetic, neon lights, holographic interfaces, rain and fog, dystopian megacity",
};

// ─── Content tools ────────────────────────────────────────────────────────────
const CONTENT_TOOLS = {
  titles: {
    label: "Title Generator",
    desc: "SEO-optimized video titles",
    icon: Type,
    color: "from-[#1e78ff] to-[#3b82f6]",
    prompt: (input) => `You are an expert YouTube growth strategist. Generate 7 irresistible, SEO-optimized YouTube video titles for: "${input}".

Rules:
- Mix curiosity gaps, numbers, and power words
- Use proven formats: How-to, Listicles, Secrets, Mistakes, Ultimate guides
- Keep under 60 characters when possible
- Include emotional triggers (shock, FOMO, inspiration)
- Front-load the main keyword

Format as a numbered list with a brief note on why each title works.`,
  },
  descriptions: {
    label: "Description Writer",
    desc: "Engaging video descriptions",
    icon: FileText,
    color: "from-[#a855f7] to-[#8b5cf6]",
    prompt: (input) => `You are an expert YouTube SEO copywriter. Write a high-converting YouTube video description for: "${input}".

Structure:
1. Hook (first 2 lines visible before "Show more" - make them irresistible)
2. What viewers will learn / why they should watch
3. Timestamps placeholder section (add [00:00], [01:30] etc.)
4. About the creator (brief, 2 sentences)
5. Call to action (subscribe, like, comment prompt)
6. 10–15 relevant hashtags at the bottom

Keep it between 250-350 words. Write naturally, not spammy.`,
  },
  tags: {
    label: "Tag Suggester",
    desc: "Relevant tags for discovery",
    icon: Tag,
    color: "from-[#22c55e] to-[#16a34a]",
    prompt: (input) => `You are a YouTube SEO expert. Generate 25 high-impact tags for a video about "${input}".

Include:
- 3 broad/generic tags (high search volume)
- 10 medium-specificity tags (your main topic variations)
- 7 long-tail tags (very specific, less competition)
- 5 trending/related topic tags

Return ONLY the tags as a clean comma-separated list, no numbering or explanation. Order from broadest to most specific.`,
  },
  thumbnails: {
    label: "Thumbnail Ideas",
    desc: "Design concepts & layouts",
    icon: Lightbulb,
    color: "from-[#f97316] to-[#ea580c]",
    prompt: (input) => `You are a top YouTube thumbnail designer. Create 3 distinct, click-worthy thumbnail concepts for: "${input}".

For each concept provide:
🎨 LAYOUT: Describe the composition and element placement
🖼️ MAIN VISUAL: The hero image/subject (face expression, object, scene)
🎨 COLOR SCHEME: Specific dominant colors and why they work
✍️ TEXT OVERLAY: Exact text, font style suggestion (bold? outline?), and placement
⚡ EMOTIONAL HOOK: What emotion/curiosity this triggers in the viewer
📊 WHY IT WORKS: 1-line explanation of the psychological trigger

Make each concept radically different in approach.`,
  },
};

// ─── Gallery filter types ──────────────────────────────────────────────────────
const GALLERY_FILTERS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: Image },
  { id: "sticker", label: "Stickers", icon: Smile },
  { id: "comic", label: "Comics", icon: LayoutGrid },
  { id: "2d_model", label: "2D", icon: Layers },
  { id: "3d_model", label: "3D", icon: Box },
  { id: "video", label: "Video", icon: Film },
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function ArtForgeStudio() {
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [refImages, setRefImages] = useState([]);
  const [results, setResults] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [activeStyleTags, setActiveStyleTags] = useState([]);
  const [videoDuration, setVideoDuration] = useState(6);
  const [gifLoading, setGifLoading] = useState(false);

  // Sticker-specific state
  const [stickerStyle, setStickerStyle] = useState("kawaii");
  const [stickerPackSize, setStickerPackSize] = useState(1);

  // Sub-mode state for 2D and 3D
  const [subMode2D, setSubMode2D] = useState("sprite");
  const [subMode3D, setSubMode3D] = useState("vrchat_anime");

  const [galleryFilter, setGalleryFilter] = useState("all");
  const [gallerySearch, setGallerySearch] = useState("");

  const [selectedTool, setSelectedTool] = useState("titles");
  const [contentInput, setContentInput] = useState("");
  const [contentOutput, setContentOutput] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState("studio");

  const queryClient = useQueryClient();

  const { data: gallery = [] } = useQuery({
    queryKey: ["media-assets-gallery"],
    queryFn: () => base44.entities.MediaAsset.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = gallery
    .filter(g => galleryFilter === "all" || g.type === galleryFilter)
    .filter(g => !gallerySearch || g.name?.toLowerCase().includes(gallerySearch.toLowerCase()) || g.description?.toLowerCase().includes(gallerySearch.toLowerCase()));

  const currentMode = MODES.find(m => m.id === mode);

  const toggleStyleTag = (tag) => {
    setActiveStyleTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getModeSuffix = () => {
    if (mode === "2d_model") {
      return SUBMODES_2D.find(s => s.id === subMode2D)?.suffix || "";
    }
    if (mode === "3d_model") {
      return SUBMODES_3D.find(s => s.id === subMode3D)?.suffix || "";
    }
    if (mode === "sticker") {
      return (currentMode?.suffix || "") + (STICKER_STYLES.find(s => s.id === stickerStyle)?.suffix || "");
    }
    return currentMode?.suffix || "";
  };

  const buildPrompt = () => {
    const styleStr = activeStyleTags.length > 0
      ? `, ${activeStyleTags.map(t => STYLE_TAG_MODIFIERS[t] || t).join(", ")}`
      : "";
    return `${prompt}${styleStr}${getModeSuffix()}`;
  };

  const buildVideoPrompt = () => {
    const styleStr = activeStyleTags.length > 0
      ? `, ${activeStyleTags.map(t => STYLE_TAG_MODIFIERS[t] || t).join(", ")}`
      : "";
    return `${prompt}${styleStr}${currentMode?.suffix || ""}`;
  };

  const getCurrentSubMode = () => {
    if (mode === "2d_model") return SUBMODES_2D.find(s => s.id === subMode2D);
    if (mode === "3d_model") return SUBMODES_3D.find(s => s.id === subMode3D);
    return null;
  };

  // ── Visual generation ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please describe your vision"); return; }
    setGenLoading(true);
    setResults([]);
    try {
      const finalPrompt = buildPrompt();
      const isVideo = currentMode?.supportsVideo;

      if (isVideo) {
        const videoPrompt = buildVideoPrompt();
        const { url } = await base44.integrations.Core.GenerateVideo({
          prompt: videoPrompt,
          duration: videoDuration,
          aspect_ratio: "16:9",
        });
        setResults([{ url, type: "video" }]);
        await base44.entities.MediaAsset.create({
          name: prompt.slice(0, 60),
          url,
          type: "video",
          description: videoPrompt,
        });
        toast.success("Video saved to gallery!");
      } else {
        const count = mode === "sticker" ? stickerPackSize : Math.min(batchCount, 4);

        // For sticker packs, vary each sticker slightly for diversity
        const stickerVariations = ["", ", different pose", ", different expression", ", different angle",
          ", waving", ", laughing", ", surprised", ", sleeping", ", angry", ", heart eyes", ", cool sunglasses", ", dancing"];

        const buildStickerVariantPrompt = (i) => {
          const variation = stickerPackSize > 1 ? (stickerVariations[i % stickerVariations.length] || "") : "";
          const stickerSuffix = STICKER_STYLES.find(s => s.id === stickerStyle)?.suffix || "";
          return `${prompt}${variation}${currentMode?.suffix || ""}${stickerSuffix}`;
        };

        const generateOne = (i) => base44.integrations.Core.GenerateImage({
          prompt: mode === "sticker" ? buildStickerVariantPrompt(i) : finalPrompt,
          existing_image_urls: refImages.length > 0 ? refImages : undefined,
        });

        const responses = await Promise.all(Array.from({ length: count }, (_, i) => generateOne(i)));
        const urls = responses.map(r => r.url);
        setResults(urls.map(url => ({ url, type: mode === "sticker" ? "sticker" : mode })));
        await Promise.all(urls.map(url =>
          base44.entities.MediaAsset.create({
            name: prompt.slice(0, 60),
            url,
            type: mode,
            description: finalPrompt,
          })
        ));
        toast.success(`${urls.length} ${mode === "sticker" ? "sticker" : "creation"}${urls.length > 1 ? "s" : ""} saved to gallery!`);
      }
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.MediaAsset.delete(id);
    queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
    toast.success("Deleted");
  };

  const handleToggleFavorite = async (item) => {
    await base44.entities.MediaAsset.update(item.id, { is_favorite: !item.is_favorite });
    queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
  };

  // ── GIF from video ───────────────────────────────────────────────────────────
  const handleMakeGif = async (videoUrl) => {
    setGifLoading(true);
    toast.loading("Generating GIF version...", { id: "gif" });
    try {
      const gifPrompt = `${prompt}, animated loop frame, motion blur, looping animation still, vibrant dynamic colors, GIF-style illustration, freeze frame from smooth animation, energetic movement`;
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: gifPrompt,
        existing_image_urls: [videoUrl],
      });
      await base44.entities.MediaAsset.create({
        name: `GIF: ${prompt.slice(0, 50)}`,
        url,
        type: "image",
        description: gifPrompt,
        tags: ["gif", "animated"],
      });
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success("GIF saved to gallery!", { id: "gif" });
    } catch (e) {
      toast.error("GIF failed: " + e.message, { id: "gif" });
    } finally {
      setGifLoading(false);
    }
  };

  // ── Content tools ────────────────────────────────────────────────────────────
  const handleContentGenerate = async () => {
    if (!contentInput.trim()) return;
    setContentLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: CONTENT_TOOLS[selectedTool].prompt(contentInput),
        add_context_from_internet: false,
        model: "claude_sonnet_4_6",
      });
      setContentOutput(res);
    } catch {
      setContentOutput("Error generating content. Please try again.");
    }
    setContentLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contentOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* ── Header ── */}
      <div className="border-b border-[#1e78ff]/20 bg-[#030810]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center shadow-lg shadow-blue-900/40">
              <WandSparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">ArtForge</span>
              <span className="text-[10px] text-blue-400/40 ml-2 hidden sm:inline">AI Creative Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: "studio", label: "Studio", icon: Sparkles },
              { id: "content", label: "Content Tools", icon: FileText },
              { id: "gallery", label: "Gallery", icon: LayoutGrid },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-[#1e78ff]/20 text-[#1e78ff] border border-[#1e78ff]/40"
                    : "text-blue-400/50 hover:text-blue-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── Studio Tab ── */}
          {activeTab === "studio" && (
            <motion.div key="studio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
                  Creative Studio
                </h1>
                <p className="text-blue-400/50 text-sm mt-1.5">Transform your ideas into stunning visuals and models</p>
              </div>

              {/* Mode pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {MODES.map(m => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setResults([]); setActiveStyleTags([]); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r " + m.gradient + " text-white border-transparent shadow-lg"
                          : "border-blue-900/40 text-blue-400/60 hover:border-blue-700/60 hover:text-blue-300 bg-[#060d18]/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Main layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left panel: Input */}
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm"
                >
                  {/* Reference images */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">
                      Reference Images <span className="font-normal normal-case opacity-70">(optional)</span>
                    </p>
                    <label className="cursor-pointer rounded-xl border-2 border-dashed border-blue-900/40 px-4 py-3 text-center transition-all hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/5 flex items-center justify-center gap-2 group">
                      <Plus className="w-4 h-4 text-blue-400/40 group-hover:text-[#1e78ff] transition-colors" />
                      <p className="text-sm text-blue-400/50 group-hover:text-blue-300 transition-colors">
                        Add reference images <span className="text-[#1e78ff]">or drop here</span>
                      </p>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setRefImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                        }}
                      />
                    </label>
                    {refImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {refImages.map((url, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-blue-900/40 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prompt */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Describe your vision</p>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={getCurrentSubMode()?.placeholder || currentMode?.placeholder}
                      rows={4}
                      className="w-full bg-[#0a1525]/80 border border-blue-900/40 rounded-xl p-3 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                    />
                  </div>

                  {/* Style tags */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Style Modifiers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleStyleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                            activeStyleTags.includes(tag)
                              ? "bg-[#1e78ff]/20 border-[#1e78ff]/60 text-[#1e78ff]"
                              : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2D Sub-mode selector */}
                  {mode === "2d_model" && (
                    <div>
                      <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">2D Type</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SUBMODES_2D.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSubMode2D(s.id)}
                            className={`px-2.5 py-2 rounded-lg text-left border transition-all ${
                              subMode2D === s.id
                                ? "bg-[#a855f7]/20 border-[#a855f7]/60 text-[#a855f7]"
                                : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                            }`}
                          >
                            <p className="text-[11px] font-bold leading-tight">{s.label}</p>
                            <p className="text-[9px] opacity-60 leading-tight mt-0.5">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3D Sub-mode selector */}
                  {mode === "3d_model" && (
                    <div>
                      <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">3D Type</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SUBMODES_3D.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSubMode3D(s.id)}
                            className={`px-2.5 py-2 rounded-lg text-left border transition-all ${
                              subMode3D === s.id
                                ? "bg-[#f97316]/20 border-[#f97316]/60 text-[#f97316]"
                                : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                            }`}
                          >
                            <p className="text-[11px] font-bold leading-tight">{s.label}</p>
                            <p className="text-[9px] opacity-60 leading-tight mt-0.5">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sticker-specific controls */}
                  {mode === "sticker" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Sticker Style</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {STICKER_STYLES.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setStickerStyle(s.id)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                stickerStyle === s.id
                                  ? "bg-[#f97316]/20 border-[#f97316]/60 text-[#f97316]"
                                  : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">Pack Size</p>
                        <div className="flex gap-1.5">
                          {STICKER_PACK_SIZES.map(n => (
                            <button
                              key={n}
                              onClick={() => setStickerPackSize(n)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                stickerPackSize === n
                                  ? "bg-[#facc15]/20 border-[#facc15]/60 text-[#facc15]"
                                  : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                              }`}
                            >
                              {n === 1 ? "Single" : `${n}-Pack`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Batch / Duration + Generate */}
                  <div className="pt-1 border-t border-blue-900/20">
                    {currentMode?.supportsVideo ? (
                       <div className="space-y-2 mb-3">
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-blue-400/50 font-medium">Duration</span>
                           <span className="text-xs text-blue-400/30">~{videoDuration === 4 ? "30" : videoDuration === 6 ? "45" : videoDuration === 8 ? "60" : "90"}s to generate</span>
                         </div>
                         <div className="flex gap-1">
                           {[4, 6, 8].map(d => (
                             <button
                               key={d}
                               onClick={() => setVideoDuration(d)}
                               className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                 videoDuration === d
                                   ? "bg-[#ec4899]/20 text-[#ec4899] border border-[#ec4899]/40"
                                   : "bg-[#0a1525] border border-blue-900/30 text-blue-400/50 hover:text-blue-300"
                               }`}
                             >
                               {d}s
                             </button>
                           ))}
                         </div>
                       </div>
                     ) : mode !== "sticker" && mode !== "2d_model" && mode !== "3d_model" ? (
                       <div className="space-y-2 mb-3">
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-blue-400/50 font-medium">Batch Size</span>
                           <span className="text-xs text-blue-400/30">~{batchCount * 20}s to generate all</span>
                         </div>
                         <div className="flex items-center gap-2 bg-[#0a1525] border border-blue-900/30 rounded-lg p-1.5">
                           <button onClick={() => setBatchCount(c => Math.max(1, c - 1))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-900/30 text-blue-400/60 hover:text-blue-300 transition-colors">
                             <Minus className="w-3.5 h-3.5" />
                           </button>
                           <div className="flex-1 text-center">
                             <span className="text-sm font-bold text-[#c8dff5]">{batchCount}</span>
                             <span className="text-xs text-blue-400/40 ml-1">{batchCount === 1 ? "image" : "images"}</span>
                           </div>
                           <button onClick={() => setBatchCount(c => Math.min(8, c + 1))} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-900/30 text-blue-400/60 hover:text-blue-300 transition-colors">
                             <Plus className="w-3.5 h-3.5" />
                           </button>
                         </div>
                         <p className="text-xs text-blue-400/25">Up to 8 images at once</p>
                       </div>
                     ) : null}
                    <Button
                      onClick={handleGenerate}
                      disabled={genLoading || !prompt.trim()}
                      className="w-full h-11 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 gap-2 text-white font-semibold rounded-xl disabled:opacity-30 transition-opacity border-0"
                    >
                      {genLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                        : currentMode?.supportsVideo
                          ? <><Film className="w-4 h-4" /> Generate Video ({videoDuration}s)</>
                          : mode === "sticker"
                          ? <><Smile className="w-4 h-4" /> Generate {stickerPackSize > 1 ? `${stickerPackSize}-Sticker Pack` : "Sticker"}</>
                          : mode === "2d_model"
                          ? <><Layers className="w-4 h-4" /> Generate {getCurrentSubMode()?.label || "2D Art"}</>
                          : mode === "3d_model"
                          ? <><Box className="w-4 h-4" /> Generate {getCurrentSubMode()?.label || "3D Render"}</>
                          : <><Sparkles className="w-4 h-4" /> Generate {batchCount > 1 ? `${batchCount} Images` : ""}</>
                      }
                    </Button>
                  </div>
                </motion.div>

                {/* Right panel: Results */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col min-h-[400px]"
                >
                  <AnimatePresence mode="wait">
                    {genLoading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full border-4 border-[#1e78ff]/20 animate-ping" />
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/20 to-[#a855f7]/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-[#1e78ff]/60 animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-blue-400/50 font-medium">Crafting your vision...</p>
                        <p className="text-xs text-blue-400/30">{batchCount > 1 ? `Generating ${batchCount} images` : "This takes a few seconds"}</p>
                      </motion.div>
                    ) : results.length > 0 ? (
                      <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 h-full">
                        {results[0]?.type === "sticker" && results.length > 1 && (
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-xs font-bold text-[#facc15]">{results.length}-Sticker Pack</span>
                            <Star className="w-3 h-3 text-[#facc15]/50" />
                          </div>
                        )}
                        <div className={`grid gap-3 ${results.length === 1 ? "grid-cols-1" : results.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {results.map((item, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden border border-blue-900/30">
                              {item.type === "video" ? (
                                <video src={item.url} controls className="w-full rounded-xl" style={{ maxHeight: "420px" }} />
                              ) : (
                                <img src={item.url} alt={`Result ${i + 1}`} className="w-full object-contain rounded-xl" style={{ maxHeight: results.length === 1 ? "420px" : results.length > 4 ? "160px" : "240px" }} />
                              )}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                                <a href={item.url} download={`artforge-${i + 1}.${item.type === "video" ? "mp4" : "png"}`} target="_blank" rel="noopener noreferrer">
                                  <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-black/70 text-white/80 hover:bg-black/90 transition-colors">
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-auto flex-wrap">
                          <Button variant="outline" onClick={handleGenerate} disabled={genLoading} className="flex-1 gap-1.5 text-sm">
                            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                          {/* GIF button for video results */}
                          {results[0]?.type === "video" && (
                            <Button
                              variant="outline"
                              onClick={() => handleMakeGif(results[0].url)}
                              disabled={gifLoading}
                              className="gap-1.5 text-sm border-[#facc15]/40 text-[#facc15] hover:bg-[#facc15]/10"
                            >
                              {gifLoading
                                ? <><div className="w-3.5 h-3.5 border-2 border-[#facc15]/30 border-t-[#facc15] rounded-full animate-spin" /> Making GIF...</>
                                : <><Zap className="w-3.5 h-3.5" /> Make GIF</>
                              }
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => setActiveTab("gallery")} className="gap-1.5 text-sm">
                            <LayoutGrid className="w-3.5 h-3.5" /> View Gallery
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center px-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 border border-blue-900/20 flex items-center justify-center mb-4">
                          <WandSparkles className="w-9 h-9 text-[#1e78ff]/30" />
                        </div>
                        <p className="text-base font-semibold text-blue-400/40">Your creation will appear here</p>
                        <p className="text-sm text-blue-400/25 mt-1">Enter a prompt and hit generate</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Content Tools Tab ── */}
          {activeTab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
                  Content Tools
                </h1>
                <p className="text-blue-400/50 text-sm mt-1.5">AI-powered writing and SEO tools for your videos</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(CONTENT_TOOLS).map(([key, tool]) => {
                  const Icon = tool.icon;
                  const isActive = selectedTool === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedTool(key); setContentOutput(""); setContentInput(""); }}
                      className={`p-4 rounded-2xl border transition-all text-left group ${
                        isActive
                          ? "bg-[#0a1525] border-[#1e78ff]/50"
                          : "bg-[#060d18]/50 border-blue-900/30 hover:border-blue-900/60"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-70"} transition-opacity`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-xs font-bold ${isActive ? "text-[#e8f4ff]" : "text-blue-400/60"}`}>{tool.label}</p>
                      <p className="text-[10px] text-blue-400/30 mt-0.5">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider">Your Topic / Input</p>
                  <textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder={`Describe your video for ${CONTENT_TOOLS[selectedTool].label.toLowerCase()}...`}
                    rows={6}
                    className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-xl p-4 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 resize-none transition-colors"
                  />
                  <Button
                    onClick={handleContentGenerate}
                    disabled={contentLoading || !contentInput.trim()}
                    className="w-full gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0 hover:opacity-90"
                  >
                    {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider">Output</p>
                  <div className="relative w-full h-[168px] bg-[#060d18]/60 border border-blue-900/30 rounded-xl p-4 text-sm text-[#c8dff5] overflow-y-auto">
                    {contentLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-[#1e78ff]/50 animate-spin" />
                          <p className="text-xs text-blue-400/30">Generating...</p>
                        </div>
                      </div>
                    ) : contentOutput ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{contentOutput}</p>
                    ) : (
                      <p className="text-blue-400/20 flex items-center justify-center h-full text-center">
                        Results will appear here...
                      </p>
                    )}
                  </div>
                  {contentOutput && (
                    <button
                      onClick={copyToClipboard}
                      className="w-full bg-blue-900/20 hover:bg-blue-900/40 text-blue-300 text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-blue-900/30"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Output"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Gallery Tab ── */}
          {activeTab === "gallery" && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[#e8f4ff]">My Gallery</h1>
                  <p className="text-blue-400/50 text-sm mt-1">
                    {gallery.length} creation{gallery.length !== 1 ? "s" : ""} — private to you
                  </p>
                </div>
                <Button onClick={() => setActiveTab("studio")} className="gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0 self-start sm:self-auto">
                  <Sparkles className="w-4 h-4" /> Create New
                </Button>
              </div>

              {/* Filters + Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-1.5 flex-wrap">
                  {GALLERY_FILTERS.map(f => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setGalleryFilter(f.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          galleryFilter === f.id
                            ? "bg-[#1e78ff]/20 border-[#1e78ff]/50 text-[#1e78ff]"
                            : "border-blue-900/30 text-blue-400/50 hover:border-blue-700/50 hover:text-blue-300"
                        }`}
                      >
                        <Icon className="w-3 h-3" /> {f.label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400/30" />
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full bg-[#060d18]/60 border border-blue-900/30 rounded-full pl-9 pr-4 py-1.5 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/40 transition-colors"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e78ff]/10 to-[#a855f7]/10 border border-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-9 h-9 text-[#1e78ff]/30" />
                  </div>
                  <p className="text-blue-400/40 font-semibold">No creations yet</p>
                  <p className="text-blue-400/25 text-sm mt-1">Head to the studio to start creating</p>
                  <Button onClick={() => setActiveTab("studio")} className="mt-4 gap-2 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] border-0">
                    <WandSparkles className="w-4 h-4" /> Open Studio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="group relative rounded-2xl overflow-hidden border border-blue-900/30 bg-[#060d18]/60 hover:border-[#1e78ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#050a14]">
                        {item.type === "video" && item.url ? (
                          <video src={item.url} className="w-full h-full object-cover" muted loop preload="metadata" />
                        ) : item.url ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-blue-400/20" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              onClick={() => handleToggleFavorite(item)}
                              className={`h-7 w-7 flex items-center justify-center rounded-lg bg-black/70 transition-colors ${item.is_favorite ? "text-red-400" : "text-white/60 hover:text-red-400"}`}
                            >
                              <Heart className="w-3.5 h-3.5" fill={item.is_favorite ? "currentColor" : "none"} />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-xs text-white/70 line-clamp-2 mb-2">{item.description || item.name}</p>
                            <div className="flex gap-1.5">
                              {item.url && (
                                <a href={item.url} download target="_blank" rel="noopener noreferrer" className="flex-1">
                                  <button className="w-full h-7 flex items-center justify-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors">
                                    <Download className="w-3 h-3" /> Save
                                  </button>
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Favorite indicator */}
                        {item.is_favorite && (
                          <div className="absolute top-2 left-2">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/80">
                              <Heart className="w-3 h-3 text-white" fill="currentColor" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.type === "image" ? "bg-[#1e78ff]/20 text-[#1e78ff]"
                            : item.type === "2d_model" ? "bg-[#a855f7]/20 text-[#a855f7]"
                            : item.type === "3d_model" ? "bg-orange-500/20 text-orange-400"
                            : item.type === "video" ? "bg-[#ec4899]/20 text-[#ec4899]"
                            : item.type === "sticker" ? "bg-yellow-500/20 text-yellow-400"
                            : item.type === "comic" ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : "bg-blue-900/30 text-blue-400"
                          }`}>
                            {item.type === "image" ? <Image className="w-2.5 h-2.5" />
                            : item.type === "2d_model" ? <Layers className="w-2.5 h-2.5" />
                            : item.type === "3d_model" ? <Box className="w-2.5 h-2.5" />
                            : item.type === "video" ? <Film className="w-2.5 h-2.5" />
                            : item.type === "sticker" ? <Sparkles className="w-2.5 h-2.5" />
                            : <LayoutGrid className="w-2.5 h-2.5" />}
                            {item.type === "image" ? "Image"
                            : item.type === "2d_model" ? "2D"
                            : item.type === "3d_model" ? "3D"
                            : item.type === "video" ? "Video"
                            : item.type === "sticker" ? "Sticker"
                            : "Comic"}
                          </span>
                          <span className="text-[10px] text-blue-400/30 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.created_date ? format(new Date(item.created_date), "MMM d") : ""}
                          </span>
                        </div>
                        <p className="text-xs text-blue-400/50 mt-1.5 line-clamp-1">{item.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}