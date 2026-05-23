import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Calendar, CheckCircle2, ChevronRight, Loader2, Send, Sparkles, Wand2, X, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PAGE_CONTEXT = {
  dashboard: {
    title: "Dashboard copilot",
    intro: "I can recommend what to watch, what to create next, and which creator signals deserve attention.",
    actions: ["What should I create?", "Find watch ideas", "Plan a short", "Growth angle"],
  },
  creator: {
    title: "Creator Studio copilot",
    intro: "I can turn your current project into next steps, metadata, a publish checklist, or a content calendar task.",
    actions: ["Next production step", "Publish checklist", "Content calendar", "Growth insight"],
  },
  production: {
    title: "Production assistant",
    intro: "I can move you through idea, assets, create, edit, review, and publish without losing the thread.",
    actions: ["Next step", "Title ideas", "Thumbnail concept", "Send to Production"],
  },
  upload: {
    title: "Upload metadata helper",
    intro: "I can draft a title, description, tags, and thumbnail direction from your file and topic.",
    actions: ["Generate metadata", "Improve title", "Write description", "Suggest tags"],
  },
  artforge: {
    title: "ArtForge prompt helper",
    intro: "I can sharpen prompts, add composition and lighting, and build negative prompts for cleaner outputs.",
    actions: ["Improve prompt", "Negative prompt", "Thumbnail prompt", "Variant ideas"],
  },
  communities: {
    title: "Community mod helper",
    intro: "I can suggest pinned prompts, event ideas, moderation actions, and calmer replies for active rooms.",
    actions: ["Moderation scan", "Conversation prompt", "Event idea", "Pinned message"],
  },
  analytics: {
    title: "Analytics insight assistant",
    intro: "I can summarize performance, identify bottlenecks, and recommend what to fix before your next upload.",
    actions: ["Summarize performance", "Improve retention", "Find opportunity", "Next experiment"],
  },
  general: {
    title: "VStream AI",
    intro: "I can help with ideas, titles, thumbnails, clips, livestreams, community, analytics, and publishing.",
    actions: ["Video idea", "Title ideas", "ArtForge prompt", "Publish checklist"],
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function detectContext(pathname) {
  if (pathname.includes("CreatorStudio")) return "creator";
  if (pathname.includes("ArtForge")) return "artforge";
  if (pathname.includes("Communities") || pathname.includes("WorldChat")) return "communities";
  if (pathname.includes("Analytics")) return "analytics";
  if (pathname === "/") return "dashboard";
  return "general";
}

function fallbackSuggestion(contextType, action, context = {}) {
  const label = action || "Video idea";
  const title = context.title || context.projectType || context.channelTitle || "VStream project";
  const map = {
    dashboard: `Demo suggestion: Create a short recap around "${title}" with a 3-second cold open, one visual payoff, and a community question at the end.`,
    creator: `Demo suggestion: Move this project to Review next. Check title, thumbnail contrast, tags, visibility, and whether one short clip can be cut from the same asset.`,
    production: `Demo suggestion: For ${title}, finish the active tool, save the strongest asset, then open Publish and complete title, thumbnail, tags, visibility, and schedule.`,
    upload: `Demo metadata:\nTitle: ${title} | The Moment Viewers Need To See\nDescription: A tight VStream upload built around the strongest moment, clear context, and a direct reason to watch through.\nTags: vstream, creator, live recap, shorts, community, behind the scenes`,
    artforge: `Demo prompt upgrade: ${title}, cinematic neon blue and violet lighting, strong subject silhouette, readable focal point, high contrast thumbnail composition, clean background, sharp detail. Negative prompt: blurry, extra fingers, muddy colors, unreadable text, warped face.`,
    communities: `Demo moderation note: Pin a calm room prompt, acknowledge the active topic, and move heated replies into a slow-mode reminder before removing anything.`,
    analytics: `Demo insight: Package the best-performing topic into one long video, two shorts, and one community post. Watch retention drop-offs and test a clearer thumbnail promise.`,
    general: `Demo suggestion: Start with a specific viewer promise, make the first 5 seconds visually obvious, then convert the idea into title, thumbnail, tags, and a publish checklist.`,
  };
  return `${map[contextType] || map.general}\n\nAction: ${label}`;
}

export default function VStreamAIAssistant({
  surface = "floating",
  contextType,
  context = {},
  onApply,
  onSendToProduction,
  className = "",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedContext = contextType || detectContext(location.pathname);
  const meta = PAGE_CONTEXT[resolvedContext] || PAGE_CONTEXT.general;
  const [open, setOpen] = useState(surface !== "floating");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const actions = useMemo(() => context.actions || meta.actions, [context.actions, meta.actions]);

  const runSuggestion = async (action) => {
    setLoading(true);
    setDemoMode(false);
    const userRequest = action || input.trim() || actions[0];
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are VStream AI, a creator assistant for a social video and live streaming platform.

Context type: ${resolvedContext}
Page data: ${JSON.stringify(context).slice(0, 2000)}
User request: ${userRequest}

Return practical creator help. Include concise, usable suggestions for relevant items: video ideas, titles, descriptions, thumbnails, tags, scripts, clips, shorts/reels, livestream planning, moderation, growth, ArtForge prompts, publish checklist, content calendar, or analytics insights. Avoid pretending you performed unavailable backend actions.`,
        add_context_from_internet: false,
      });
      setSuggestion(typeof result === "string" ? result : result?.response || fallbackSuggestion(resolvedContext, userRequest, context));
    } catch {
      setDemoMode(true);
      setSuggestion(fallbackSuggestion(resolvedContext, userRequest, context));
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const applySuggestion = () => {
    if (onApply && suggestion) onApply(suggestion);
  };

  const sendToProduction = () => {
    if (onSendToProduction) {
      onSendToProduction(suggestion);
      return;
    }
    navigate("/CreatorStudio?section=production", { state: { aiSuggestion: suggestion } });
  };

  if (surface === "floating") {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          className={cx("fixed bottom-20 right-4 z-50 grid h-14 w-14 place-items-center rounded-full border border-[#00c8ff]/50 bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-white shadow-2xl shadow-blue-950/60 md:bottom-6 md:right-6", open && "hidden")}
          whileHover={{ scale: 1.06 }}
          aria-label="Open VStream AI"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} className="fixed bottom-20 right-4 z-50 w-[min(380px,calc(100vw-2rem))] md:bottom-6 md:right-6">
              <AssistantPanel meta={meta} actions={actions} input={input} setInput={setInput} loading={loading} suggestion={suggestion} demoMode={demoMode} onClose={() => setOpen(false)} onRun={runSuggestion} onApply={onApply ? applySuggestion : null} onSendToProduction={sendToProduction} />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className={className}>
      <AssistantPanel meta={meta} actions={actions} input={input} setInput={setInput} loading={loading} suggestion={suggestion} demoMode={demoMode} onRun={runSuggestion} onApply={onApply ? applySuggestion : null} onSendToProduction={resolvedContext === "production" || resolvedContext === "dashboard" || resolvedContext === "artforge" ? sendToProduction : null} compact={surface === "compact"} />
    </div>
  );
}

function AssistantPanel({ meta, actions, input, setInput, loading, suggestion, demoMode, onClose, onRun, onApply, onSendToProduction, compact = false }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#12305f]/80 bg-[#030810]/96 text-[#e8f4ff] shadow-2xl shadow-black/45 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-[#12305f]/70 bg-[#06101f]/85 px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{meta.title}</p>
          <p className="truncate text-xs text-blue-200/45">Context-aware creator help</p>
        </div>
        {onClose && <button onClick={onClose} className="rounded-lg p-1 text-blue-200/45 hover:bg-blue-900/25 hover:text-white"><X className="h-4 w-4" /></button>}
      </div>

      <div className={cx("space-y-3 p-4", compact ? "max-h-[460px] overflow-y-auto" : "")}>
        <p className="text-sm leading-6 text-blue-100/62">{meta.intro}</p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button key={action} onClick={() => onRun(action)} disabled={loading} className="rounded-full border border-[#00c8ff]/25 bg-[#00c8ff]/10 px-3 py-1.5 text-xs font-black text-[#00c8ff] transition hover:bg-[#00c8ff]/16 disabled:opacity-50">
              {action}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onRun()} placeholder="Ask for a title, script, prompt, clip plan..." className="min-w-0 flex-1 rounded-xl border border-[#12305f] bg-[#06101f] px-3 py-2 text-sm text-white outline-none placeholder:text-blue-300/35 focus:border-[#00c8ff]" />
          <button onClick={() => onRun()} disabled={loading} className="grid h-10 w-10 place-items-center rounded-xl bg-[#1e78ff] text-white transition hover:bg-[#00a6ff] disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>

        {!suggestion && !loading && (
          <div className="rounded-2xl border border-dashed border-[#12305f] bg-[#06101f]/62 p-4 text-sm text-blue-100/45">
            Choose a chip or ask for specific help. If no AI provider is connected, I will show labeled local demo suggestions.
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-[#12305f] bg-[#06101f]/62 p-4 text-sm text-blue-100/55">
            <Loader2 className="h-4 w-4 animate-spin text-[#00c8ff]" />
            Thinking through the creator workflow...
          </div>
        )}

        {suggestion && (
          <div className="rounded-2xl border border-[#12305f] bg-[#06101f]/78 p-4">
            <div className="mb-3 flex items-center gap-2">
              {demoMode ? <Zap className="h-4 w-4 text-yellow-300" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/45">{demoMode ? "Local demo suggestion - connect AI provider for live generation" : "Suggestion"}</p>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-blue-50/82">{suggestion}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {onApply && <button onClick={onApply} className="inline-flex items-center gap-2 rounded-xl bg-[#1e78ff] px-3 py-2 text-xs font-black text-white hover:bg-[#00a6ff]"><Wand2 className="h-3.5 w-3.5" />Apply suggestion</button>}
              {onSendToProduction && <button onClick={onSendToProduction} className="inline-flex items-center gap-2 rounded-xl border border-[#00c8ff]/30 bg-[#00c8ff]/10 px-3 py-2 text-xs font-black text-[#00c8ff] hover:bg-[#00c8ff]/16"><Calendar className="h-3.5 w-3.5" />Send to Production<ChevronRight className="h-3.5 w-3.5" /></button>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
