import { useState, useEffect, useRef } from "react";
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
    label: "2D Model",
    desc: "Sprite sheets & character assets",
    icon: Layers,
    gradient: "from-[#a855f7] to-[#1e78ff]",
    placeholder: "A warrior mage character with multiple poses: idle, walking, attacking, dead...",
    suffix: "", // handled by 2D sub-mode
    supportsVideo: false,
    hasSubModes: true,
  },
  {
    id: "3d_model",
    label: "3D Model",
    desc: "Generates real 3D GLB models",
    icon: Box,
    gradient: "from-[#f97316] to-[#a855f7]",
    placeholder: "A magical girl with long pink twin tails, white dress, star wand, graceful pose...",
    suffix: "", // 3D models don't need extra suffix
    supportsVideo: false,
    supportsTripo: true, // Real 3D generation via Tripo3D
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

// ─── 2D Sub-modes (Sprite Sheet Types) ─────────────────────────────────────
const SUBMODES_2D = [
  {
    id: "character_sheet",
    label: "Character Sheet",
    desc: "Multiple poses & expressions",
    placeholder: "A knight character showing: idle, walking, attacking, jumping, hurt, and dead poses...",
    suffix: ", character sprite sheet, 6-8 different poses on a single transparent PNG, arranged in a clean grid, consistent character model across all poses, clean outline, ready for game engines, white background, high-quality pixel art or vector illustration",
  },
  {
    id: "animation_sheet",
    label: "Animation Loop",
    desc: "Frame-by-frame animation",
    placeholder: "A slime creature bouncing animation, showing 8 frames of the bounce cycle from bottom to top...",
    suffix: ", animation sprite sheet, 8-12 sequential animation frames arranged horizontally in a single PNG, consistent character scale and position, transparent background, smooth motion between frames, ready for game engine animation systems",
  },
  {
    id: "expression_sheet",
    label: "Expression Pack",
    desc: "Face variants & emotions",
    placeholder: "A character head with different expressions: happy, sad, angry, surprised, neutral, crying, winking...",
    suffix: ", expression sprite sheet, 8-12 different facial expressions in a grid layout on a single PNG, consistent head position and size, transparent background, clean linework, perfect for character dialogue systems and emotes",
  },
  {
    id: "vtuber_sheet",
    label: "VTuber Asset",
    desc: "Rigging reference sheet",
    placeholder: "A VTuber girl character with body parts separated: head, torso, left arm, right arm, legs, showing neutral and alternate expressions...",
    suffix: ", VTuber character asset sheet, separated body parts clearly labeled and arranged in grid format on single PNG, multiple expression variants, anime style, transparent background, optimized for VTube Studio and Live2D rigging, professional streaming quality",
  },
  {
    id: "pngtuber",
    label: "PNGTuber States",
    desc: "Multiple talking states",
    placeholder: "A chibi avatar with 4 states: neutral, talking (mouth open), happy (smile), surprised (open mouth)...",
    suffix: ", PNGTuber avatar state sheet, 4-6 different mouth/expression states in a grid on single PNG, consistent character pose, chibi proportions, transparent or white background, perfect for veadotube mini and VTube Studio streaming",
  },
  {
    id: "ui_icons",
    label: "UI Icon Set",
    desc: "Game interface icons",
    placeholder: "Fantasy RPG icons: sword, shield, potion, helmet, key, door, treasure chest, health item...",
    suffix: ", game UI icon set, 12-20 different game icons in a neat grid layout on single PNG, 64x64 or 128x128 pixels each, transparent background, consistent art style and stroke weight, suitable for inventory systems and game menus",
  },
];

// ─── 3D Provider options ──────────────────────────────────────────────────────
const SUBMODES_3D = [
  {
    id: "tripo3d",
    label: "Tripo3D",
    desc: "Free 3D generation",
    provider: "tripo3d",
    requiresPayment: false,
  },
  {
    id: "meshy",
    label: "Meshy",
    desc: "Premium quality (requires payment)",
    provider: "meshy",
    requiresPayment: true,
    price: 3.99, // USD per generation (profit margin goes to app)
  },
  {
    id: "sloyd",
    label: "Sloyd",
    desc: "Procedural 3D models",
    provider: "sloyd",
    requiresPayment: false,
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

const STICKER_PACK_SIZES = [1, 4, 8, 12, 20, 50, 100];

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
  const [uploadingRefs, setUploadingRefs] = useState(false);
  const [results, setResults] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [activeStyleTags, setActiveStyleTags] = useState([]);
  const [videoDuration, setVideoDuration] = useState(6);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);
  const [gifLoading, setGifLoading] = useState(false);

  const uploadRefImage = async (file) => {
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      return uploaded?.file_url;
    } catch (err) {
      console.error("Ref upload failed:", err);
      toast.error("Failed to upload reference image");
      return null;
    }
  };

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
  const countdownIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const { data: gallery = [] } = useQuery({
    queryKey: ["media-assets-gallery"],
    queryFn: async () => {
      const result = await base44.entities.MediaAsset.list("-created_date", 200);
      return Array.isArray(result) ? result : [];
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const filtered = (Array.isArray(gallery) ? gallery : [])
    .filter(g => g && (galleryFilter === "all" || g.type === galleryFilter))
    .filter(g => !gallerySearch || (g.name || "").toLowerCase().includes(gallerySearch.toLowerCase()) || (g.description || "").toLowerCase().includes(gallerySearch.toLowerCase()));

  const currentMode = MODES.find(m => m.id === mode) || MODES[0];

  const toggleStyleTag = (tag) => {
    setActiveStyleTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const getModeSuffix = () => {
    if (mode === "2d_model") {
      return SUBMODES_2D.find(s => s.id === subMode2D)?.suffix || "";
    }
    if (mode === "3d_model") {
      return ""; // 3D models don't use suffix
    }
    if (mode === "sticker") {
      return (currentMode?.suffix || "") + (STICKER_STYLES.find(s => s.id === stickerStyle)?.suffix || "");
    }
    return currentMode?.suffix || "";
  };

  const memoizedStyleStr = activeStyleTags.length > 0
    ? `, ${activeStyleTags.map(t => STYLE_TAG_MODIFIERS[t] || t).join(", ")}`
    : "";

  const buildPrompt = () => {
    return `MANDATORY: Generate EXACTLY what the user requests below. Do not deviate, substitute, or ignore any part of their description. Treat this as a strict requirement.\n\nUSER REQUEST:\n${prompt}\n\nADDITIONAL STYLE:\n${memoizedStyleStr}${getModeSuffix()}`;
  };

  const buildVideoPrompt = () => {
    return `MANDATORY: Generate EXACTLY what the user requests below. Do not deviate, substitute, or ignore any part of their description.\n\nUSER REQUEST:\n${prompt}\n\nADDITIONAL STYLE:\n${memoizedStyleStr}${currentMode?.suffix || ""}`;
  };

  const getCurrentSubMode = () => {
    if (mode === "2d_model") return SUBMODES_2D.find(s => s.id === subMode2D) || SUBMODES_2D[0];
    if (mode === "3d_model") return SUBMODES_3D.find(s => s.id === subMode3D) || SUBMODES_3D[0];
    return null;
  };

  // Initialize subMode2D to first available if not set
  useEffect(() => {
    if (SUBMODES_2D.length > 0 && !subMode2D) {
      setSubMode2D(SUBMODES_2D[0].id);
    }
  }, []);

  // ── Visual generation ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please describe your vision"); return; }
    if (genLoading) return; // Prevent duplicate submissions
    
    setGenLoading(true);
    setResults([]);
    
    // Calculate estimated time
    let estTime = 0;
    if (currentMode?.supportsVideo) {
      estTime = Math.ceil((videoDuration / 4) * 40 + 10);
    } else if (mode === "sticker") {
      estTime = Math.max(1, stickerPackSize * 20);
    } else {
      estTime = Math.max(1, batchCount * 20);
    }
    setEstimatedTime(estTime);
    setCountdownTime(estTime);
    
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const finalPrompt = buildPrompt();
      const isVideo = currentMode?.supportsVideo;
      const is3D = currentMode?.supportsTripo;

      if (is3D) {
        const selected3DProvider = SUBMODES_3D.find(s => s.id === subMode3D);
        if (selected3DProvider?.requiresPayment) {
          const paymentRes = await base44.functions.invoke('processPayment', {
            amount: Math.round(selected3DProvider.price * 100),
            description: `Meshy 3D: ${prompt.slice(0, 50)}`,
            provider: "meshy",
          });
          if (!paymentRes?.data?.success) throw new Error("Payment failed. Try again.");
          toast.success("Payment processed ✓");
        }

        const response = await base44.functions.invoke('generate3DModel', {
          prompt: finalPrompt,
          provider: selected3DProvider?.provider || "tripo3d",
        });
        const modelUrl = response?.data?.modelUrl;
        if (!modelUrl) throw new Error("3D generation failed - no model returned");
        
        setResults([{ url: modelUrl, type: "3d_model" }]);
        await base44.entities.MediaAsset.create({
          name: (prompt || "3D Model").slice(0, 60),
          url: modelUrl,
          type: "3d_model",
          description: finalPrompt,
          category: selected3DProvider?.provider || "tripo3d"
        });
        toast.success("3D model ready ✓");
      } else if (isVideo) {
        let videoPrompt = buildVideoPrompt();
        if (refImages.length > 0) {
          videoPrompt = `YOU MUST FOLLOW THE USER'S PROMPT EXACTLY.\n\nReference images are ONLY for visual style (colors, mood, aesthetic). Use their style but generate what the user requested.\n\n${videoPrompt}`;
        }
        const response = await base44.integrations.Core.GenerateVideo({
          prompt: videoPrompt,
          duration: Math.max(1, Math.min(3600, videoDuration)),
          aspect_ratio: "16:9",
        });
        const videoUrl = response?.url;
        if (!videoUrl) throw new Error("No video URL returned");
        
        setResults([{ url: videoUrl, type: "video", editable: true }]);
        await base44.entities.MediaAsset.create({
          name: (prompt || "Generated").slice(0, 60),
          url: videoUrl,
          type: "video",
          description: videoPrompt,
        });
        toast.success("Video saved to gallery!");
      } else {
        const count = Math.max(1, Math.min(100, mode === "sticker" ? stickerPackSize : batchCount));

        // For sticker packs, vary each sticker slightly for diversity
        const stickerVariations = ["", ", different pose", ", different expression", ", different angle",
          ", waving", ", laughing", ", surprised", ", sleeping", ", angry", ", heart eyes", ", cool sunglasses", ", dancing"];

        const buildStickerVariantPrompt = (i) => {
          const variation = stickerPackSize > 1 ? (stickerVariations[i % stickerVariations.length] || "") : "";
          const stickerSuffix = STICKER_STYLES.find(s => s.id === stickerStyle)?.suffix || "";
          return `${prompt}${variation}${currentMode?.suffix || ""}${stickerSuffix}`;
        };

        const buildImagePrompt = (idx) => {
           let basePrompt = mode === "sticker" ? buildStickerVariantPrompt(idx) : finalPrompt;
           if (refImages.length > 0) {
             basePrompt = `YOU MUST ANALYZE AND EXTRACT EVERYTHING FROM THE REFERENCE IMAGES:\n\n1. CHARACTER/SUBJECT: Identify and describe every detail (appearance, pose, clothing, accessories, expression)\n2. ENVIRONMENT: Describe the setting, background, architecture, and spatial layout\n3. OBJECTS: List all visible items (furniture, tech, props, decorations)\n4. LIGHTING: Analyze color temperature, light sources, glows, shadows, and mood\n5. COMPOSITION: Note camera angle, framing, depth of field, and spatial arrangement\n6. STYLE: Identify art style, rendering technique, aesthetic (anime, realistic, etc.)\n7. COLOR PALETTE: Extract dominant colors and their relationships\n\nNOW CREATE: Use ALL these visual elements combined with the user's request:\n${basePrompt}\n\nMandatory: Incorporate the character, environment, objects, lighting scheme, and composition from the reference images. This is non-negotiable.`;
           }
           return basePrompt;
         };

        const generateOne = (i) => {
           const hasRefs = Array.isArray(refImages) && refImages.length > 0;
           // Use GPT-4 which respects user intent better than Claude Opus's aggressive filtering
           return base44.integrations.Core.GenerateImage({
             prompt: buildImagePrompt(i),
             existing_image_urls: hasRefs ? refImages : undefined,
             model: "gpt_5_5", // More respectful of user prompts
           });
         };

        const responses = await Promise.all(Array.from({ length: count }, (_, i) => generateOne(i)));
        const urls = responses
          .map(r => r?.url || r?.data?.url)
          .filter(url => typeof url === "string" && url.length > 0);
        
        if (urls.length === 0) throw new Error("Generation failed - no images returned. Try simpler prompt.");
        
        setResults(urls.map(url => ({ url, type: mode === "sticker" ? "sticker" : mode })));
        
        await Promise.all(urls.map(url =>
          base44.entities.MediaAsset.create({
            name: (prompt || "Generated").slice(0, 55),
            url,
            type: mode,
            description: finalPrompt.slice(0, 200),
            category: mode
          }).catch(err => console.error("Save failed:", err))
        ));
        
        toast.success(`Generated ${urls.length} ${mode === "sticker" ? "sticker" : "creation"}${urls.length > 1 ? "s" : ""} ✓`);
      }
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
    } catch (e) {
      const errorMsg = (e?.message || "Generation failed").slice(0, 100);
      console.error("Generation error:", e);
      toast.error("Generation failed: " + errorMsg);
      setResults([]);
    } finally {
      setGenLoading(false);
      setEstimatedTime(0);
      setCountdownTime(0);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await base44.entities.MediaAsset.delete(id);
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success("Item deleted");
    } catch (e) {
      console.error("Delete failed:", e);
      toast.error("Delete failed: " + (e?.message || "Unknown error").slice(0, 60));
    }
  };

  const handleToggleFavorite = async (item) => {
    if (!item?.id) return;
    try {
      await base44.entities.MediaAsset.update(item.id, { is_favorite: !item.is_favorite });
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
    } catch (e) {
      console.error("Toggle favorite failed:", e);
      toast.error("Failed to update favorite: " + (e?.message || "Unknown").slice(0, 60));
    }
  };

  // ── GIF from video ───────────────────────────────────────────────────────────
  const handleMakeGif = async (videoUrl) => {
    if (!videoUrl || typeof videoUrl !== "string") {
      toast.error("Invalid video URL");
      return;
    }
    setGifLoading(true);
    try {
      const gifPrompt = `GENERATE THE USER'S EXACT REQUEST:\n${prompt || "Animation"}\n\nStyle: animated loop frame, motion blur, looping animation still, vibrant dynamic colors, GIF-style illustration, freeze frame from smooth animation, energetic movement. Make it loop-ready.`;
      const response = await base44.integrations.Core.GenerateImage({
        prompt: gifPrompt,
        existing_image_urls: [videoUrl],
        model: "gpt_5_5",
      });
      const gifUrl = response?.url;
      if (!gifUrl) throw new Error("GIF generation returned no URL");
      
      await base44.entities.MediaAsset.create({
        name: `GIF: ${(prompt || "Generated").slice(0, 45)}`,
        url: gifUrl,
        type: "image",
        description: gifPrompt,
        tags: ["gif", "animated"],
        category: "animation"
      });
      queryClient.invalidateQueries({ queryKey: ["media-assets-gallery"] });
      toast.success("GIF saved to gallery!");
    } catch (e) {
      console.error("GIF error:", e);
      toast.error("GIF failed: " + (e?.message || "Generation error").slice(0, 80));
    } finally {
      setGifLoading(false);
    }
  };

  // ── Content tools ────────────────────────────────────────────────────────────
  const handleContentGenerate = async () => {
    if (!contentInput.trim()) return;
    if (contentLoading) return;
    
    setContentLoading(true);
    try {
      const tool = CONTENT_TOOLS[selectedTool];
      if (!tool) throw new Error("Tool not found");
      
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: tool.prompt(contentInput),
        add_context_from_internet: false,
        model: "gpt_5_5",
      });
      setContentOutput(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (e) {
      console.error("Content generation error:", e);
      setContentOutput("Error: " + (e?.message || "Generation failed").slice(0, 80));
    } finally {
      setContentLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!contentOutput) return;
    navigator.clipboard.writeText(contentOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(e => {
      console.error("Copy failed:", e);
      toast.error("Failed to copy");
    });
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
                      Reference Images <span className="font-normal normal-case opacity-70">(for style matching)</span>
                    </p>
                    <label className="cursor-pointer rounded-xl border-2 border-dashed border-blue-900/40 px-4 py-3 text-center transition-all hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/5 flex items-center justify-center gap-2 group">
                      <Plus className="w-4 h-4 text-blue-400/40 group-hover:text-[#1e78ff] transition-colors" />
                      <p className="text-sm text-blue-400/50 group-hover:text-blue-300 transition-colors">
                        Upload reference <span className="text-[#1e78ff]">for exact style match</span>
                      </p>
                      <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingRefs}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          setUploadingRefs(true);
                          const urls = await Promise.all(files.map(f => uploadRefImage(f)));
                          setRefImages(prev => [...prev, ...urls.filter(url => url)]);
                          setUploadingRefs(false);
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

                  {/* 2D Sprite Sheet Note */}
                  {mode === "2d_model" && (
                    <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-lg p-3">
                      <p className="text-xs text-[#a855f7] font-semibold">🎯 Sprite Sheet Grid</p>
                      <p className="text-xs text-[#a855f7]/70 mt-1">Generates PNG sheets with multiple poses/frames in grid layout</p>
                    </div>
                  )}

                  {/* 3D Provider selector */}
                  {mode === "3d_model" && (
                    <div>
                      <p className="text-xs font-semibold text-blue-400/50 uppercase tracking-wider mb-2">3D Provider</p>
                      <div className="grid grid-cols-3 gap-1.5">
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
                            {s.requiresPayment && <p className="text-[8px] text-[#f97316] mt-1 font-semibold">${s.price}</p>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3D note */}
                  {mode === "3d_model" && (
                    <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg p-3">
                      <p className="text-xs text-[#f97316] font-semibold">🎯 Real 3D Generation</p>
                      <p className="text-xs text-[#f97316]/70 mt-1">
                        {getCurrentSubMode()?.requiresPayment 
                          ? `Premium quality - $${getCurrentSubMode()?.price} per generation` 
                          : "Free 3D model generation"}
                      </p>
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
                        <div className="flex flex-wrap gap-1.5">
                          {STICKER_PACK_SIZES.map(n => (
                            <button
                              key={n}
                              onClick={() => setStickerPackSize(n)}
                              className={`py-1 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                                stickerPackSize === n
                                  ? "bg-[#facc15]/20 border-[#facc15]/60 text-[#facc15]"
                                  : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                              }`}
                            >
                              {n}
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
                           <span className="text-xs text-blue-400/30">~{Math.ceil((videoDuration / 4) * 40 + 10)}s to generate</span>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {[4, 6, 8, 10, 15, 30, 60, 120, 300, 600, 1800, 3600].map(d => {
                             const label = d >= 60 ? (d === 3600 ? '1h' : `${Math.floor(d / 60)}m`) : `${d}s`;
                             const isActive = Math.abs(videoDuration - d) < 1;
                             return (
                               <button
                                 key={d}
                                 onClick={() => setVideoDuration(d)}
                                 className={`py-1 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                                   isActive
                                     ? "bg-[#ec4899]/20 border-[#ec4899]/40 text-[#ec4899]"
                                     : "border-blue-900/30 text-blue-400/40 hover:border-blue-700/50 hover:text-blue-300"
                                 }`}
                               >
                                 {label}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     ) : mode !== "sticker" && mode !== "2d_model" && mode !== "3d_model" ? (
                       <div className="space-y-2 mb-3">
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-blue-400/50 font-medium">Batch Size</span>
                           <span className="text-xs text-blue-400/30">~{Math.max(1, Math.min(100, batchCount)) * 20}s to generate all</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <input
                             type="number"
                             min="1"
                             max="100"
                             value={batchCount}
                             onChange={(e) => {
                               const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                               setBatchCount(val);
                             }}
                             className="flex-1 bg-[#0a1525]/80 border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-[#1e78ff] font-semibold outline-none focus:border-[#1e78ff]/50 transition-colors"
                             placeholder="1-100"
                           />
                           <span className="text-xs text-blue-400/50 whitespace-nowrap">images</span>
                         </div>
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
                          ? <><Layers className="w-4 h-4" /> Generate {getCurrentSubMode()?.label || "Sprite Sheet"}</>
                          : mode === "3d_model"
                           ? <><Box className="w-4 h-4" /> Generate 3D Model</>
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
                         <div className="text-center">
                           <p className="text-2xl font-black text-[#1e78ff] font-mono">{String(Math.ceil(countdownTime)).padStart(2, "0")}s</p>
                           <p className="text-xs text-blue-400/30 mt-1">Est. time remaining</p>
                         </div>
                         <p className="text-xs text-blue-400/25 max-w-xs">{currentMode?.supportsVideo ? `Video: ${videoDuration}s` : mode === "sticker" ? `${stickerPackSize}-sticker pack` : `${batchCount} ${batchCount === 1 ? "image" : "images"}`}</p>
                       </motion.div>
                    ) : results.length > 0 ? (
                      <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 h-full">
                        {results[0]?.type === "2d_model" && (
                            <div className="flex items-center gap-2 mb-1">
                              <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
                              <span className="text-xs font-bold text-[#a855f7]">Sprite Sheet</span>
                            </div>
                            )}
                            {results[0]?.type === "3d_model" && (
                            <div className="flex items-center gap-2 mb-1">
                            <Box className="w-3.5 h-3.5 text-[#f97316]" />
                            <span className="text-xs font-bold text-[#f97316]">3D GLB Model</span>
                            </div>
                            )}
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
                              {item.type === "3d_model" ? (
                                <div className="w-full bg-[#050a14] rounded-xl flex items-center justify-center" style={{ height: "300px" }}>
                                  <div className="text-center">
                                    <Box className="w-12 h-12 text-[#f97316] mx-auto mb-2" />
                                    <p className="text-xs text-blue-400/50">3D Model (GLB)</p>
                                    <p className="text-[10px] text-blue-400/30 mt-1">Download to view in 3D viewer</p>
                                  </div>
                                </div>
                              ) : item.type === "2d_model" ? (
                                <img src={item.url} alt={`Sprite Sheet ${i + 1}`} className="w-full object-contain rounded-xl" style={{ maxHeight: "420px", background: "transparent" }} />
                              ) : item.type === "video" ? (
                                <video src={item.url} controls className="w-full rounded-xl" style={{ maxHeight: "420px" }} />
                              ) : (
                                <img src={item.url} alt={`Result ${i + 1}`} className="w-full object-contain rounded-xl" style={{ maxHeight: results.length === 1 ? "420px" : results.length > 4 ? "160px" : "240px" }} />
                              )}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                                <a href={item.url} download={`artforge-${i + 1}.${item.type === "3d_model" ? "glb" : item.type === "video" ? "mp4" : "png"}`} target="_blank" rel="noopener noreferrer">
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
                           {/* Send to editor button for video results */}
                           {results[0]?.type === "video" && (
                             <Button
                               variant="outline"
                               className="gap-1.5 text-sm border-purple-600/40 text-purple-400 hover:bg-purple-500/10"
                               onClick={() => toast.info("Video link copied! Share with your editor for feedback")}
                             >
                               <Sparkles className="w-3.5 h-3.5" /> Send to Editor
                             </Button>
                           )}
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
                        <p className="text-base font-semibold text-blue-400/40">{mode === "2d_model" ? "Your sprite sheet will appear here" : mode === "3d_model" ? "Your 3D model will appear here" : "Your creation will appear here"}</p>
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