import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Key, Eye, EyeOff, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OpenAIKeySetup({ currentKey, onKeySaved }) {
  const [key, setKey] = useState(currentKey ? "sk-•••••••••••••••••••••••" : "");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!currentKey);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-")) {
      toast.error("Invalid API key — must start with sk-");
      return;
    }
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ openai_api_key: trimmed });
      toast.success("API key saved securely to your profile");
      onKeySaved(trimmed);
      setIsEditing(false);
      setKey("sk-•••••••••••••••••••••••");
    } catch {
      toast.error("Failed to save key");
    }
    setIsSaving(false);
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ openai_api_key: "" });
      toast.success("API key removed");
      onKeySaved("");
      setKey("");
      setIsEditing(true);
    } catch {
      toast.error("Failed to remove key");
    }
    setIsSaving(false);
  };

  return (
    <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-500/20 to-[#1e78ff]/20 border border-green-500/30">
          <Key className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">OpenAI API Key</h3>
          <p className="text-[11px] text-blue-200/50">Used to access your private ChatGPT conversations. Never shared.</p>
        </div>
        {currentKey && !isEditing && (
          <div className="ml-auto flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-black">Saved</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-blue-200/20 focus:border-[#1e78ff]/60 transition"
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/40 hover:text-white transition">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button onClick={handleSave} disabled={isSaving || !key.trim()}
              className="flex items-center gap-2 rounded-xl bg-green-600/80 px-4 py-2.5 text-sm font-black text-white hover:bg-green-600 disabled:opacity-40 transition">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </button>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-200/30">
            <span>Get your key at</span>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
              className="flex items-center gap-0.5 text-blue-400 underline hover:text-blue-300 transition">
              platform.openai.com/api-keys <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-blue-200/40 font-mono">
            sk-•••••••••••••••••••••••
          </div>
          <button onClick={() => { setKey(""); setIsEditing(true); }}
            className="rounded-xl border border-[#1a3a60]/60 px-4 py-2.5 text-xs font-black text-blue-200/60 hover:text-white transition">
            Change
          </button>
          <button onClick={handleRemove} disabled={isSaving}
            className="rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-black text-red-400/70 hover:text-red-300 transition">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}