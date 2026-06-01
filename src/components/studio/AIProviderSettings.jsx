import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Key, Check, Eye, EyeOff, ExternalLink, Zap, Music, Video, Image, Loader2, Disc3 } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  // ── FREE PROVIDERS (Always Available) ──
  {
    id: "base44",
    label: "Base44 (Free)",
    field: null,
    icon: Zap,
    color: "from-emerald-500 to-green-500",
    description: "Free unlimited image generation, always available. No key needed.",
    tier: "FREE",
    tags: ["Images", "No Cost"],
    note: "✅ Always included. Unlimited generations per month."
  },
  
  // ── PREMIUM PROVIDERS (Optional, User Keys) ──
  {
    id: "fal-flux-pro",
    label: "fal.ai • FLUX 2 Pro",
    field: "fal_api_key",
    icon: Image,
    color: "from-violet-500 to-blue-500",
    description: "High-quality image generation with superior prompt adherence",
    url: "https://fal.ai/dashboard/keys",
    urlLabel: "fal.ai/dashboard/keys",
    tier: "PREMIUM",
    tags: ["Images", "Pro", "Paid"],
    free: false,
    note: "Optional: ~$0.005/image"
  },
  {
    id: "fal-flux-ultra",
    label: "fal.ai • FLUX 2 Ultra",
    field: "fal_api_key",
    icon: Image,
    color: "from-blue-600 to-purple-600",
    description: "Premium ultra-quality image generation with enhanced details",
    url: "https://fal.ai/dashboard/keys",
    urlLabel: "fal.ai/dashboard/keys",
    tier: "PREMIUM",
    tags: ["Images", "Ultra", "Paid"],
    free: false,
    note: "Optional: ~$0.015/image"
  },
  {
    id: "fal-flux-kontext",
    label: "fal.ai • FLUX Kontext",
    field: "fal_api_key",
    icon: Image,
    color: "from-indigo-500 to-cyan-500",
    description: "Image editing and inpainting with FLUX quality",
    url: "https://fal.ai/dashboard/keys",
    urlLabel: "fal.ai/dashboard/keys",
    tier: "PREMIUM",
    tags: ["Images", "Editing", "Paid"],
    free: false,
    note: "Optional: Image editing & inpainting"
  },
  {
    id: "fal-flux-schnell",
    label: "fal.ai • FLUX Schnell",
    field: "fal_api_key",
    icon: Image,
    color: "from-blue-500 to-cyan-500",
    description: "Fastest FLUX model for quick image generation",
    url: "https://fal.ai/dashboard/keys",
    urlLabel: "fal.ai/dashboard/keys",
    tier: "PREMIUM",
    tags: ["Images", "Fast", "Paid"],
    free: false,
    note: "Optional: Fastest FLUX model"
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs Music",
    field: "elevenlabs_api_key",
    icon: Music,
    color: "from-orange-500 to-amber-500",
    description: "Studio-quality music generation with fine-tuned styles",
    url: "https://elevenlabs.io/app/developers/api-keys",
    urlLabel: "elevenlabs.io/app/developers",
    tier: "PREMIUM",
    tags: ["Music", "Audio", "Paid"],
    free: false,
    note: "Optional: Free tier 10k chars/month, then $0.03/credit"
  },
  {
    id: "suno",
    label: "Suno AI Music",
    field: "suno_api_key",
    icon: Disc3,
    color: "from-rose-500 to-pink-500",
    description: "Full song generation with vocals, lyrics, and any style",
    url: "https://app.suno.ai/api-keys",
    urlLabel: "suno.ai/api-keys",
    tier: "PREMIUM",
    tags: ["Music", "Vocals", "Songs", "Paid"],
    free: false,
    note: "Optional: Free tier 50 songs/month, $10/mo for unlimited"
  },
  {
    id: "runway",
    label: "Runway Gen-4 Turbo",
    field: "runway_api_key",
    icon: Video,
    color: "from-emerald-500 to-teal-500",
    description: "Cinematic video generation with Gen-4 Turbo",
    url: "https://dev.runwayml.com",
    urlLabel: "dev.runwayml.com",
    tier: "PREMIUM",
    tags: ["Video", "Paid"],
    free: false,
    note: "Optional: $0.01/credit. ~50 credits per 5s video"
  },
  {
    id: "openai-dall-e",
    label: "OpenAI DALL-E 3",
    field: "openai_api_key",
    icon: Image,
    color: "from-teal-500 to-green-500",
    description: "DALL-E 3 image generation via OpenAI API",
    url: "https://platform.openai.com/api-keys",
    urlLabel: "platform.openai.com/api-keys",
    tier: "PREMIUM",
    tags: ["Images", "Paid"],
    free: false,
    note: "Optional: Add your OpenAI key for DALL-E 3"
  },
  {
    id: "stability",
    label: "Stability AI SDXL",
    field: "stability_api_key",
    icon: Image,
    color: "from-red-500 to-orange-500",
    description: "Stable Diffusion XL image generation",
    url: "https://platform.stability.ai/account/api-keys",
    urlLabel: "platform.stability.ai/account",
    tier: "PREMIUM",
    tags: ["Images", "Paid"],
    free: false,
    note: "Optional: Add your Stability AI key"
  },
  {
    id: "replicate",
    label: "Replicate Flux",
    field: "replicate_api_key",
    icon: Image,
    color: "from-yellow-500 to-orange-500",
    description: "FLUX and other models via Replicate",
    url: "https://replicate.com/account/api-tokens",
    urlLabel: "replicate.com/account",
    tier: "PREMIUM",
    tags: ["Images", "Paid"],
    free: false,
    note: "Optional: Add your Replicate API key"
  },
  {
    id: "tripo",
    label: "Tripo3D",
    field: "tripo3d_api_key",
    icon: Zap,
    color: "from-purple-500 to-indigo-500",
    description: "Game-ready 3D models with auto-rigging and stylization",
    url: "https://www.tripo3d.ai/dashboard",
    urlLabel: "tripo3d.ai/dashboard",
    tier: "PREMIUM",
    tags: ["3D", "Models", "Paid"],
    free: false,
    note: "Optional: From $11.94/mo, $0.01/credit"
  },
];

function KeyInput({ provider, value, onSave, saving }) {
  const [input, setInput] = useState(value || "");
  const [show, setShow] = useState(false);
  const [dirty, setDirty] = useState(false);
  const isFree = provider.tier === "FREE";

  useEffect(() => {
    setInput(value || "");
    setDirty(false);
  }, [value]);

  const Icon = provider.icon;

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isFree ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[#1a3a60]/60 bg-[#030e1f]/80'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${provider.color} bg-opacity-20`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-sm">{provider.label}</h3>
              {isFree && <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">✅ FREE</span>}
              {!isFree && value && <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-300"><Check className="h-2.5 w-2.5" /> Connected</span>}
              {!isFree && !value && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-300">Optional</span>}
            </div>
            <p className="text-[11px] text-blue-200/45 mt-0.5">{provider.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 shrink-0 justify-end">
          {provider.tags.map(t => (
            <span key={t} className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${isFree ? 'border-emerald-500/30 text-emerald-300' : 'border-[#1a3a60]/50 text-blue-200/40'}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* Only show input for non-free premium providers */}
      {!isFree && provider.field && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200/30" />
            <input
              type={show ? "text" : "password"}
              value={input}
              onChange={(e) => { setInput(e.target.value); setDirty(true); }}
              placeholder={`Paste your API key…`}
              className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#020812] pl-9 pr-10 py-2.5 text-sm text-white outline-none placeholder:text-blue-200/20 focus:border-[#a855f7]/60 transition"
            />
            <button onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/30 hover:text-white transition">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <button
            onClick={() => onSave(provider.field, input.trim())}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/30 px-3 py-2.5 text-xs font-black text-purple-200 hover:bg-[#a855f7]/30 disabled:opacity-40 transition shrink-0"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className={`text-[10px] ${isFree ? 'text-emerald-300/70' : 'text-blue-200/30'}`}>{provider.note}</p>
        {!isFree && provider.url && (
          <a href={provider.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-[#1e78ff]/60 hover:text-[#1e78ff] transition">
            <ExternalLink className="h-3 w-3" /> Get key
          </a>
        )}
      </div>
    </div>
  );
}

export default function AIProviderSettings() {
  const { user } = useAuth();
  const [keys, setKeys] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (user) {
      setKeys({
        fal_api_key: user.fal_api_key || "",
        openai_api_key: user.openai_api_key || "",
        stability_api_key: user.stability_api_key || "",
        replicate_api_key: user.replicate_api_key || "",
        elevenlabs_api_key: user.elevenlabs_api_key || "",
        runway_api_key: user.runway_api_key || "",
        tripo3d_api_key: user.tripo3d_api_key || "",
        suno_api_key: user.suno_api_key || "",
      });
    }
  }, [user]);

  const handleSave = async (field, value) => {
    setSaving(field);
    try {
      await base44.auth.updateMe({ [field]: value });
      setKeys(prev => ({ ...prev, [field]: value }));
      toast.success(value ? "API key saved!" : "Key removed");
    } catch {
      toast.error("Failed to save key");
    }
    setSaving(null);
  };

  const freeProviders = PROVIDERS.filter(p => p.tier === "FREE");
  const premiumProviders = PROVIDERS.filter(p => p.tier === "PREMIUM");
  const connectedCount = premiumProviders.filter(p => keys[p.field]).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-black text-white">AI Generation Providers</h2>
        <p className="text-xs text-blue-200/45 mt-0.5">
          Free providers always available • Optional premium keys for higher quality & speed
        </p>
      </div>

      {/* Always Free Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">✅ ALWAYS FREE & INCLUDED</span>
        </div>
        <div className="space-y-2">
          {freeProviders.map(provider => (
            <KeyInput
              key={provider.id}
              provider={provider}
              value={null}
              onSave={handleSave}
              saving={false}
            />
          ))}
        </div>
      </div>

      {/* Premium Optional Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 justify-between">
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">🎯 OPTIONAL PREMIUM</span>
          {connectedCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
              <Zap className="h-3 w-3" /> {connectedCount} connected
            </span>
          )}
        </div>
        <p className="text-[11px] text-blue-200/35">Enhance your creations with paid providers for better quality, speed, and advanced features.</p>
        <div className="space-y-2">
          {premiumProviders.map(provider => (
            <KeyInput
              key={provider.id}
              provider={provider}
              value={keys[provider.field] || ""}
              onSave={handleSave}
              saving={saving === provider.field}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#1a3a60]/40 bg-[#030e1f]/50 p-3 space-y-2">
        <p className="text-[11px] text-blue-200/35">
          🔒 API keys are encrypted and only used when you select that provider. Never shared or logged.
        </p>
        <p className="text-[11px] text-blue-200/25">
          💡 Tip: Use free providers for exploration, premium keys for production-quality outputs.
        </p>
      </div>
    </div>
  );
}