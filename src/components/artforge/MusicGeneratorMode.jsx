import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Music, Loader2, Play, Download, Pause, AlertCircle, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

const GENRES = ["Electronic", "Lo-fi", "Cinematic", "Rock", "Hip-hop", "Jazz", "Ambient", "Pop", "Epic Orchestra", "Dark Trap", "Chillwave", "Synthwave"];
const MOODS = ["Energetic", "Relaxed", "Intense", "Happy", "Mysterious", "Triumphant", "Melancholic", "Hype", "Cozy", "Aggressive"];
const DURATIONS = [{ label: "15s", ms: 15000 }, { label: "30s", ms: 30000 }, { label: "60s", ms: 60000 }, { label: "2min", ms: 120000 }];
const USE_CASES = ["Stream Intro", "Background Music", "Hype Moment", "Outro", "Transition", "Gameplay BGM", "Podcast Intro", "Alert Sound"];

export default function MusicGeneratorMode({ onAssetSaved }) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [mood, setMood] = useState("Energetic");
  const [durationMs, setDurationMs] = useState(30000);
  const [useCase, setUseCase] = useState("Stream Intro");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState(null);

  const hasKey = !!user?.elevenlabs_api_key;

  const buildPrompt = () => {
    const base = prompt.trim() || `A ${mood.toLowerCase()} ${genre.toLowerCase()} track`;
    return `${base}. Genre: ${genre}. Mood: ${mood}. Use case: ${useCase}. High energy, professional quality, perfect for streaming content.`;
  };

  const handleGenerate = async () => {
    if (!hasKey) { toast.error("Add your ElevenLabs API key in Settings → AI Providers"); return; }
    setIsGenerating(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("generateArtForgeAsset", {
        mode: "music",
        provider: "elevenlabs",
        prompt: buildPrompt(),
        durationMs,
      });
      const data = res?.data || res;
      if (data?.url) {
        setResult(data);
        toast.success("🎵 Track generated!");
      } else {
        throw new Error("No audio URL returned");
      }
    } catch (e) {
      toast.error(`Music generation failed: ${e.message}`);
    }
    setIsGenerating(false);
  };

  const togglePlay = () => {
    if (!result?.url) return;
    if (playing && audioEl) {
      audioEl.pause();
      setPlaying(false);
    } else {
      const audio = new Audio(result.url);
      audio.onended = () => setPlaying(false);
      audio.play();
      setAudioEl(audio);
      setPlaying(true);
    }
  };

  if (!hasKey) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-6 text-center space-y-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/20 border border-amber-500/30 mx-auto">
          <Music className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="font-black text-white">ElevenLabs Music Required</h3>
          <p className="text-xs text-blue-200/50 mt-1">Add your ElevenLabs API key to generate custom music tracks</p>
        </div>
        <a href="https://elevenlabs.io/app/developers/api-keys" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-black text-amber-300 hover:bg-amber-500/25 transition">
          <ExternalLink className="h-3.5 w-3.5" /> Get free API key at ElevenLabs
        </a>
        <p className="text-[10px] text-blue-200/30">Then add it in: ArtForge → Settings → AI Providers</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Use case */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Use Case</label>
        <div className="flex flex-wrap gap-1.5">
          {USE_CASES.map(u => (
            <button key={u} onClick={() => setUseCase(u)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${useCase === u ? "border-[#a855f7]/60 bg-[#a855f7]/20 text-white" : "border-[#1a3a60]/50 text-blue-200/40 hover:text-white"}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Genre + Mood */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Genre</label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${genre === g ? "border-[#1e78ff]/60 bg-[#1e78ff]/20 text-white" : "border-[#1a3a60]/50 text-blue-200/40 hover:text-white"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Mood</label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {MOODS.map(m => (
              <button key={m} onClick={() => setMood(m)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${mood === m ? "border-emerald-500/60 bg-emerald-500/20 text-white" : "border-[#1a3a60]/50 text-blue-200/40 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Duration</label>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button key={d.ms} onClick={() => setDurationMs(d.ms)}
              className={`flex-1 rounded-xl border py-2 text-xs font-black transition ${durationMs === d.ms ? "border-[#a855f7]/60 bg-[#a855f7]/20 text-white" : "border-[#1a3a60]/60 text-blue-200/50 hover:text-white"}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional prompt */}
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-200/50">Custom Description <span className="text-blue-200/25">(optional)</span></label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={2}
          placeholder={`e.g. "Fast-paced with heavy bass drops, perfect for hype moments and raid alerts"`}
          className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm text-white outline-none placeholder:text-blue-200/18 focus:border-[#a855f7]/60 transition"
        />
      </div>

      {/* Preview prompt */}
      <div className="rounded-xl border border-[#1a3a60]/40 bg-[#030e1f]/60 p-3">
        <p className="text-[10px] text-blue-200/35 font-black uppercase tracking-widest mb-1">Will generate:</p>
        <p className="text-xs text-blue-100/60 italic">{buildPrompt()}</p>
      </div>

      <button onClick={handleGenerate} disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500/80 to-pink-500/80 py-3 text-sm font-black text-white disabled:opacity-50 hover:opacity-90 transition">
        {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Composing…</> : <><Sparkles className="h-4 w-4" /> Generate Track</>}
      </button>

      {/* Result */}
      {result?.url && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-black text-emerald-300 text-sm">🎵 Track Ready!</p>
            <a href={result.url} download className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-black text-emerald-300 hover:bg-emerald-500/15 transition">
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </div>
          <button onClick={togglePlay}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-3 text-sm font-black text-emerald-200 hover:bg-emerald-500/25 transition">
            {playing ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Preview Track</>}
          </button>
        </div>
      )}
    </div>
  );
}