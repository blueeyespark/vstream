import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Upload, Wand2, Loader2, Download, RefreshCw, ExternalLink, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

const EDIT_PRESETS = [
  "Change the background to a dark cyberpunk cityscape at night",
  "Make the text bolder and more vibrant",
  "Add dramatic neon lighting effects",
  "Change the color scheme to blue and purple",
  "Remove the background and make it transparent",
  "Add a fire or energy aura around the subject",
  "Make it look like an anime illustration",
  "Change the outfit to a futuristic suit",
  "Add falling sakura petals or particles",
  "Make the image look cinematic and filmic",
];

export default function ImageEditorMode({ onAssetSaved }) {
  const { user } = useAuth();
  const [sourceImage, setSourceImage] = useState(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const hasKey = !!user?.fal_api_key;

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setSourceImage(res.file_url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
    setIsUploading(false);
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt.trim()) {
      toast.error("Upload an image and describe the edit");
      return;
    }
    if (!hasKey) {
      toast.error("Add your fal.ai API key in Settings → AI Providers");
      return;
    }
    setIsEditing(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("generateArtForgeAsset", {
        mode: "image_edit",
        provider: "fal",
        prompt: editPrompt.trim(),
        referenceImages: [sourceImage],
      });
      const data = res?.data || res;
      if (data?.url) {
        setResult(data.url);
        if (onAssetSaved) onAssetSaved(data);
        toast.success("✨ Edit complete!");
      } else {
        throw new Error("No result URL");
      }
    } catch (e) {
      toast.error(`Edit failed: ${e.message}`);
    }
    setIsEditing(false);
  };

  if (!hasKey) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-6 text-center space-y-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/20 border border-amber-500/30 mx-auto">
          <Wand2 className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="font-black text-white">fal.ai Key Required</h3>
          <p className="text-xs text-blue-200/50 mt-1">Add your fal.ai API key to enable FLUX Kontext image editing</p>
        </div>
        <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-black text-amber-300 hover:bg-amber-500/25 transition">
          <ExternalLink className="h-3.5 w-3.5" /> Get API key at fal.ai
        </a>
        <p className="text-[10px] text-blue-200/30">Then add it in: ArtForge → Settings → AI Providers</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source image upload */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Source Image</label>
        {sourceImage ? (
          <div className="relative group overflow-hidden rounded-xl border border-[#1a3a60]/60">
            <img src={sourceImage} alt="source" className="w-full max-h-64 object-contain bg-[#030e1f]" />
            <button onClick={() => { setSourceImage(null); setResult(null); }}
              className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a3a60]/60 bg-[#030e1f]/60 p-10 cursor-pointer hover:border-[#1e78ff]/40 transition"
          >
            {isUploading
              ? <Loader2 className="h-8 w-8 animate-spin text-blue-300/50" />
              : <ImagePlus className="h-8 w-8 text-blue-200/30" />}
            <p className="text-sm text-blue-200/40">{isUploading ? "Uploading…" : "Drop image or click to upload"}</p>
            <p className="text-xs text-blue-200/25">Thumbnail, character art, any image</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
      </div>

      {/* Edit prompt */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Describe the Edit</label>
        <textarea
          value={editPrompt}
          onChange={e => setEditPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Change the background to a neon cyberpunk city at night…"
          className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm text-white outline-none placeholder:text-blue-200/18 focus:border-[#a855f7]/60 transition"
        />
      </div>

      {/* Presets */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Quick Edit Presets</label>
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {EDIT_PRESETS.map(p => (
            <button key={p} onClick={() => setEditPrompt(p)}
              className="w-full rounded-lg border border-[#1a3a60]/50 bg-[#030e1f]/60 px-3 py-2 text-left text-xs text-blue-200/50 hover:text-white hover:border-[#a855f7]/40 transition">
              {p}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleEdit} disabled={isEditing || !sourceImage || !editPrompt.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7]/80 to-[#1e78ff]/80 py-3 text-sm font-black text-white disabled:opacity-50 hover:opacity-90 transition">
        {isEditing ? <><Loader2 className="h-4 w-4 animate-spin" /> Editing with FLUX Kontext…</> : <><Wand2 className="h-4 w-4" /> Edit Image</>}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-blue-200/35 font-black uppercase tracking-widest">Original</p>
              <img src={sourceImage} alt="original" className="w-full rounded-xl object-cover border border-[#1a3a60]/50" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-emerald-400/70 font-black uppercase tracking-widest">Edited ✨</p>
              <img src={result} alt="edited" className="w-full rounded-xl object-cover border border-emerald-500/30" />
            </div>
          </div>
          <div className="flex gap-2">
            <a href={result} target="_blank" rel="noreferrer" download
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1a3a60]/60 py-2.5 text-xs font-black text-blue-200 hover:bg-[#1a3a60]/40 transition">
              <Download className="h-3.5 w-3.5" /> Download
            </a>
            <button onClick={() => { setSourceImage(result); setResult(null); setEditPrompt(""); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/10 py-2.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/20 transition">
              <RefreshCw className="h-3.5 w-3.5" /> Edit Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}