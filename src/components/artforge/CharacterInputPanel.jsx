import { useState, useRef, useCallback } from "react";
import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Type, Image as ImageIcon, Loader2, X, CheckCircle2, ImagePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

// ── Input mode tabs ───────────────────────────────────────────────────────────
const INPUT_MODES = [
  { id: "text",   label: "Text",   icon: Type,      hint: "Describe your character" },
  { id: "photo",  label: "Photo",  icon: ImageIcon, hint: "Upload a reference image" },
  { id: "speech", label: "Speech", icon: Mic,       hint: "Speak your description" },
];

export default function CharacterInputPanel({
  textPrompt, setTextPrompt,
  sourceImage, setSourceImage,
  sourcePreview, setSourcePreview,
  accentColor = "violet",
  placeholder = "e.g. cute anime idol, long twintails, pastel pink dress…",
  quickExamples = ["anime idol", "fantasy mage", "cyberpunk hacker", "vtuber cat girl"],
}) {
  const [inputMode, setInputMode] = useState("text");
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const accent = {
    violet: { ring: "border-violet-500/60", bg: "bg-violet-500/15", text: "text-violet-300", tabActive: "bg-violet-500/20 text-white", tabBtn: "hover:border-violet-500/40", mic: "bg-violet-500 hover:bg-violet-600", dashed: "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50" },
    orange: { ring: "border-orange-500/60", bg: "bg-orange-500/15", text: "text-orange-300", tabActive: "bg-orange-500/20 text-white", tabBtn: "hover:border-orange-500/40", mic: "bg-orange-500 hover:bg-orange-600", dashed: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50" },
  }[accentColor] || {};

  // ── Photo upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target.result);
    reader.readAsDataURL(file);
    setIsUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      if (res?.file_url) {
        setSourceImage(res.file_url);
        toast.success("Photo uploaded — AI will match this character");
      }
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  // ── Speech recording ──────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setIsTranscribing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const audioFile = new File([blob], "recording.webm", { type: "audio/webm" });
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
          const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
          if (transcript) {
            setTextPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);
            toast.success("Speech transcribed!");
          }
        } catch { toast.error("Transcription failed — try again"); }
        finally { setIsTranscribing(false); }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied. Allow mic in browser settings.");
    }
  }, [setTextPrompt]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return (
    <div className="rounded-2xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4 space-y-3">
      {/* Mode tabs */}
      <div className="flex rounded-xl border border-[#1a3a60]/60 overflow-hidden text-xs font-black">
        {INPUT_MODES.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setInputMode(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 transition ${inputMode === id ? accent.tabActive : "text-blue-200/40 hover:text-white"}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Text mode */}
      {inputMode === "text" && (
        <div>
          <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} rows={3}
            placeholder={placeholder}
            className={`w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm text-white outline-none placeholder:text-blue-200/20 focus:${accent.ring} transition`} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickExamples.map((ex) => (
              <button key={ex} onClick={() => setTextPrompt(ex)}
                className={`rounded-full border border-[#1a3a60]/50 px-2.5 py-1 text-[11px] text-blue-200/40 hover:text-white ${accent.tabBtn} transition`}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo mode */}
      {inputMode === "photo" && (
        <div
          onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className={`rounded-xl border-2 border-dashed ${accent.dashed} transition`}>
          {sourcePreview ? (
            <div className="relative">
              <img src={sourcePreview} alt="reference" className="w-full max-h-48 object-contain rounded-xl" />
              <button onClick={() => { setSourceImage(null); setSourcePreview(null); }}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition">
                <X className="h-4 w-4" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                </div>
              )}
              {sourceImage && !isUploading && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-1 text-[10px] font-black text-white">
                  <CheckCircle2 className="h-3 w-3" /> Ready — AI will match this
                </div>
              )}
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 p-6">
              <ImagePlus className="h-8 w-8 text-blue-200/40" />
              <p className="text-sm font-black text-white">Drop photo or click to upload</p>
              <p className="text-xs text-blue-200/35">Character art, sketch, or photo reference</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
            </label>
          )}
        </div>
      )}

      {/* Speech mode */}
      {inputMode === "speech" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-lg transition ${isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : accent.mic} disabled:opacity-50`}>
            {isTranscribing
              ? <Loader2 className="h-8 w-8 animate-spin" />
              : isRecording
              ? <MicOff className="h-8 w-8" />
              : <Mic className="h-8 w-8" />}
            {isRecording && (
              <span className="absolute -inset-1 rounded-full border-2 border-red-400/60 animate-ping" />
            )}
          </button>
          <div className="text-center">
            <p className="font-black text-white text-sm">
              {isTranscribing ? "Transcribing…" : isRecording ? "Recording — tap to stop" : "Tap to describe your character"}
            </p>
            <p className="text-xs text-blue-200/35 mt-1">
              {isTranscribing ? "AI is converting your speech to text" : "Speak naturally — AI will transcribe it"}
            </p>
          </div>
          {textPrompt && (
            <div className={`w-full rounded-xl border ${accent.ring} ${accent.bg} p-3`}>
              <p className={`text-xs font-black mb-1 ${accent.text}`}>Transcribed text:</p>
              <p className="text-sm text-white">{textPrompt}</p>
              <button onClick={() => setTextPrompt("")} className="mt-2 text-[10px] text-blue-200/40 hover:text-red-300 transition">Clear</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}