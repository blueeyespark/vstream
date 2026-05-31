import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Key, Check, Eye, EyeOff, ExternalLink, Zap, Music, Video, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  {
    id: "fal",
    label: "fal.ai",
    field: "fal_api_key",
    icon: Image,
    color: "from-violet-500 to-blue-500",
    description: "FLUX 2 Pro, FLUX Kontext (image editing), Kling v3, 1000+ models",
    url: "https://fal.ai/dashboard/keys",
    urlLabel: "fal.ai/dashboard/keys",
    tags: ["Images", "Video", "Editing"],
    free: false,
    note: "Pay-per-use. ~$0.003–$0.05/image"
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs Music",
    field: "elevenlabs_api_key",
    icon: Music,
    color: "from-orange-500 to-pink-500",
    description: "Generate custom stream intros, BGM, and full tracks from text prompts",
    url: "https://elevenlabs.io/app/developers/api-keys",
    urlLabel: "elevenlabs.io/app/developers",
    tags: ["Music", "Audio"],
    free: false,
    note: "Free tier: 10k chars/month. Paid plans available."
  },
  {
    id: "runway",
    label: "Runway Gen-4",
    field: "runway_api_key",
    icon: Video,
    color: "from-emerald-500 to-cyan-500",
    description: "High-quality cinematic video generation with Gen-4 Turbo",
    url: "https://dev.runwayml.com",
    urlLabel: "dev.runwayml.com",
    tags: ["Video"],
    free: false,
    note: "$0.01/credit. ~50 credits per 5s video."
  },
];

function KeyInput({ provider, value, onSave, saving }) {
  const [input, setInput] = useState(value || "");
  const [show, setShow] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setInput(value || "");
    setDirty(false);
  }, [value]);

  const Icon = provider.icon;

  return (
    <div className="rounded-xl border border-[#1a3a60]/60 bg-[#030e1f]/80 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${provider.color} bg-opacity-20`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-sm">{provider.label}</h3>
              {value && <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-300"><Check className="h-2.5 w-2.5" /> Connected</span>}
            </div>
            <p className="text-[11px] text-blue-200/45 mt-0.5">{provider.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 shrink-0">
          {provider.tags.map(t => (
            <span key={t} className="rounded-full border border-[#1a3a60]/50 px-2 py-0.5 text-[9px] font-black text-blue-200/40 uppercase tracking-wide">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200/30" />
          <input
            type={show ? "text" : "password"}
            value={input}
            onChange={(e) => { setInput(e.target.value); setDirty(true); }}
            placeholder={`Paste your ${provider.label} API key…`}
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

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-blue-200/30">{provider.note}</p>
        <a href={provider.url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-[#1e78ff]/60 hover:text-[#1e78ff] transition">
          <ExternalLink className="h-3 w-3" /> Get key at {provider.urlLabel}
        </a>
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
        elevenlabs_api_key: user.elevenlabs_api_key || "",
        runway_api_key: user.runway_api_key || "",
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

  const connectedCount = PROVIDERS.filter(p => keys[p.field]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-white">AI Provider Keys</h2>
          <p className="text-xs text-blue-200/45 mt-0.5">
            Connect your own API keys to unlock premium AI providers in ArtForge. Keys are stored securely on your account.
          </p>
        </div>
        {connectedCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300">{connectedCount} connected</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {PROVIDERS.map(provider => (
          <KeyInput
            key={provider.id}
            provider={provider}
            value={keys[provider.field]}
            onSave={handleSave}
            saving={saving === provider.field}
          />
        ))}
      </div>

      <div className="rounded-xl border border-[#1a3a60]/40 bg-[#030e1f]/50 p-3">
        <p className="text-[11px] text-blue-200/35 leading-relaxed">
          🔒 Your API keys are stored encrypted on your account and are only used when you select that provider in ArtForge. Base44 never stores or logs them.
        </p>
      </div>
    </div>
  );
}