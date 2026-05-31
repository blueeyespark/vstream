import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Upload, Link2, Send, Loader2, Sparkles, Copy, Download,
  X, FileText, RefreshCw, ChevronDown, Bot, User, Lightbulb
} from "lucide-react";
import { toast } from "sonner";

function cls(...parts) { return parts.filter(Boolean).join(" "); }

const QUICK_QUESTIONS = [
  "Summarize the key points of this conversation",
  "What decisions were made in this chat?",
  "List all action items and tasks mentioned",
  "What problems were discussed and what solutions were proposed?",
  "Extract any important links, names, or resources mentioned",
  "What is the overall tone and sentiment of this conversation?",
];

export default function ChatAnalyzer() {
  const [inputMode, setInputMode] = useState("paste"); // paste | file | link
  const [chatText, setChatText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsLoading(true);
    try {
      const text = await file.text();
      setChatText(text);
      setChatLoaded(false);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Failed to read file");
    }
    setIsLoading(false);
  };

  const [linkFallback, setLinkFallback] = useState(false);

  const handleLoadLink = async (autoAnalyze = false) => {
    if (!linkUrl.trim()) return null;
    if (!linkUrl.match(/(?:chatgpt\.com|chat\.openai\.com)\/share\//i)) {
      toast.error("Please enter a valid ChatGPT share link (chatgpt.com/share/...)");
      return null;
    }
    setIsFetchingLink(true);
    setLinkFallback(false);
    try {
      const res = await base44.functions.invoke("fetchChatGPTShare", { url: linkUrl.trim() });
      const data = res?.data || res;
      if (data?.text && data.messageCount > 0) {
        const text = data.text;
        const name = `"${data.title || "Conversation"}" (${data.messageCount} messages)`;
        setChatText(text);
        setFileName(name);
        toast.success(`Loaded ${data.messageCount} messages`);
        setIsFetchingLink(false);
        if (autoAnalyze) {
          setChatLoaded(true);
          setMessages([{
            role: "assistant",
            content: `✅ Conversation loaded (${text.split(/\s+/).length.toLocaleString()} words). Ask me anything about it!`
          }]);
        }
        return text;
      } else if (data?.requiresManualPaste) {
        setLinkFallback(true);
      } else {
        throw new Error(data?.error || "No content found");
      }
    } catch (e) {
      setLinkFallback(true);
    }
    setIsFetchingLink(false);
    return null;
  };

  const handleLoadChat = () => {
    if (!chatText.trim()) {
      toast.error("Please provide conversation text first");
      return;
    }
    setChatLoaded(true);
    setMessages([{
      role: "assistant",
      content: `✅ Conversation loaded (${chatText.split(/\s+/).length.toLocaleString()} words). Ask me anything about it — I can summarize, extract action items, find decisions, identify topics, and more.`
    }]);
    setTimeout(scrollToBottom, 100);
  };

  const handleAsk = async (q) => {
    const userQ = q || question;
    if (!userQ.trim() || !chatLoaded) return;
    
    setMessages(prev => [...prev, { role: "user", content: userQ }]);
    setQuestion("");
    setIsLoading(true);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing a ChatGPT conversation that the user has shared with you. Your job is to answer questions about this conversation accurately and helpfully.

=== CONVERSATION TEXT ===
${chatText.slice(0, 50000)}
=== END OF CONVERSATION ===

User's question: ${userQ}

Answer based only on what's in the conversation. Be clear, structured, and concise. Use bullet points or numbered lists when appropriate.`,
      });

      const answer = typeof res === "string" ? res : res?.text || res?.content || "No response generated.";
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't analyze that. Please try again." }]);
    }
    setIsLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const copyAnswer = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const reset = () => {
    setChatText("");
    setLinkUrl("");
    setFileName("");
    setChatLoaded(false);
    setMessages([]);
    setQuestion("");
    setLinkFallback(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-[#1e78ff]/20 border border-emerald-500/30">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-black text-white">Chat Analyzer</h2>
              <p className="text-xs text-blue-200/50">Load a ChatGPT conversation and ask questions about it</p>
            </div>
          </div>
          {chatLoaded && (
            <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-[#1a3a60]/60 px-3 py-1.5 text-xs font-black text-blue-200/60 hover:text-white transition">
              <RefreshCw className="h-3.5 w-3.5" /> New Chat
            </button>
          )}
        </div>
      </div>

      {!chatLoaded ? (
        /* Input area */
        <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-1.5 rounded-xl border border-[#1a3a60]/50 bg-[#030e1f]/60 p-1">
            {[
              { id: "paste", label: "Paste Text", icon: FileText },
              { id: "file", label: "Upload File", icon: Upload },
              { id: "link", label: "Share Link", icon: Link2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setInputMode(id)}
                className={cls("flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition",
                  inputMode === id ? "bg-[#1e78ff]/20 text-white border border-[#1e78ff]/30" : "text-blue-200/45 hover:text-white")}>
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>

          {/* Paste mode */}
          {inputMode === "paste" && (
            <div>
              <p className="mb-2 text-xs text-blue-200/50">Open your ChatGPT conversation, select all text (Ctrl+A), copy (Ctrl+C), and paste below:</p>
              <textarea
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Paste your ChatGPT conversation here…"
                rows={10}
                className="w-full resize-none rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] p-3 text-sm text-white outline-none placeholder:text-blue-200/20 focus:border-[#1e78ff]/60 transition"
              />
              <p className="mt-1 text-right text-[10px] text-blue-200/30">{chatText.split(/\s+/).filter(Boolean).length.toLocaleString()} words</p>
            </div>
          )}

          {/* File mode */}
          {inputMode === "file" && (
            <div>
              <p className="mb-2 text-xs text-blue-200/50">Upload a .txt or .json file exported from ChatGPT:</p>
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#1a3a60]/60 bg-[#030e1f]/60 p-10 cursor-pointer hover:border-[#1e78ff]/40 transition"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
              >
                <Upload className="h-8 w-8 text-blue-200/30" />
                {fileName ? (
                  <p className="text-sm font-black text-white">{fileName}</p>
                ) : (
                  <p className="text-sm text-blue-200/40">Drop file here or click to browse</p>
                )}
                <p className="text-xs text-blue-200/25">Supports .txt, .json</p>
                <input ref={fileInputRef} type="file" accept=".txt,.json,.md" className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])} />
              </div>
              {chatText && (
                <p className="mt-2 text-xs text-emerald-400">✓ File loaded — {chatText.split(/\s+/).filter(Boolean).length.toLocaleString()} words</p>
              )}
            </div>
          )}

          {/* Link mode */}
          {inputMode === "link" && (
            <div className="space-y-3">
              <p className="text-xs text-blue-200/50">Paste a ChatGPT share link — we'll try to load it automatically:</p>
              <div className="flex gap-2">
                <input
                  value={linkUrl}
                  onChange={(e) => { setLinkUrl(e.target.value); setLinkFallback(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLoadLink()}
                  placeholder="https://chatgpt.com/share/6a18ff21-8bfc-83e8-9bef-b649397ffebd"
                  className="flex-1 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-white outline-none placeholder:text-blue-200/20 focus:border-[#1e78ff]/60 transition"
                />
                <button onClick={handleLoadLink} disabled={isFetchingLink || !linkUrl.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#1e78ff]/20 border border-[#1e78ff]/30 px-4 py-2.5 text-sm font-black text-blue-200 hover:bg-[#1e78ff]/30 disabled:opacity-40 transition">
                  {isFetchingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                  {isFetchingLink ? "Loading…" : "Load"}
                </button>
              </div>
              <p className="text-[10px] text-blue-200/30">Supports: chatgpt.com/share/... and chat.openai.com/share/... links</p>

              {/* Success state */}
              {chatText && !linkFallback && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  ✓ {fileName} — {chatText.split(/\s+/).filter(Boolean).length.toLocaleString()} words loaded. Click "Analyze Conversation" below.
                </div>
              )}

              {/* Fallback: ChatGPT renders via JS so server can't extract it */}
              {linkFallback && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
                  <p className="text-xs font-black text-amber-300">⚡ Auto-load didn't work — here's the quick fix:</p>
                  <ol className="space-y-2 text-xs text-amber-200/75">
                    <li className="flex gap-2.5 items-start">
                      <span className="font-black text-amber-400 shrink-0 w-4">1.</span>
                      <span>Open the link: <a href={linkUrl} target="_blank" rel="noreferrer" className="underline text-amber-300 break-all">{linkUrl}</a></span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="font-black text-amber-400 shrink-0 w-4">2.</span>
                      <span>Press <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-white">Ctrl+A</kbd> (or <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-white">Cmd+A</kbd> on Mac) to select all</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="font-black text-amber-400 shrink-0 w-4">3.</span>
                      <span>Press <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-white">Ctrl+C</kbd> to copy</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="font-black text-amber-400 shrink-0 w-4">4.</span>
                      <span>Click <button onClick={() => setInputMode("paste")} className="underline font-black text-amber-300">Paste Text</button> tab and paste it there</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Load button */}
          <button
            onClick={async () => {
              if (inputMode === "link" && linkUrl.trim() && !chatText.trim()) {
                await handleLoadLink(true);
              } else {
                handleLoadChat();
              }
            }}
            disabled={(inputMode === "link" ? (!linkUrl.trim() && !chatText.trim()) : !chatText.trim()) || isLoading || isFetchingLink}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500/80 to-[#1e78ff]/80 py-3 text-sm font-black text-white disabled:opacity-40 hover:opacity-90 transition"
          >
            {isLoading || isFetchingLink ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 
              (inputMode === "link" && linkUrl.trim() && !chatText.trim()) ? "Fetch & Analyze →" : "Analyze Conversation →"}
          </button>
        </div>
      ) : (
        /* Chat interface */
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          {/* Messages */}
          <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 flex flex-col" style={{ minHeight: 500 }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 520 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={cls("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    )}
                    <div className={cls("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[#1e78ff]/20 border border-[#1e78ff]/30 text-white"
                        : "bg-[#030e1f] border border-[#1a3a60]/60 text-blue-100/80")}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === "assistant" && i > 0 && (
                        <button onClick={() => copyAnswer(msg.content)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-blue-200/30 hover:text-blue-200/60 transition">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/30 mt-0.5">
                        <User className="h-3.5 w-3.5 text-[#00c8ff]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                  </div>
                  <div className="rounded-2xl border border-[#1a3a60]/60 bg-[#030e1f] px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="h-2 w-2 rounded-full bg-blue-400/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#1a3a60]/50 p-3">
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
                  placeholder="Ask anything about this conversation…"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-[#1a3a60]/60 bg-[#030e1f] px-3 py-2.5 text-sm text-white outline-none placeholder:text-blue-200/20 focus:border-[#1e78ff]/60 disabled:opacity-50 transition"
                />
                <button onClick={() => handleAsk()} disabled={isLoading || !question.trim()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1e78ff] text-white disabled:opacity-40 hover:bg-[#3d8fff] transition">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Questions sidebar */}
          <div className="space-y-3">
            <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Quick Questions</h3>
              </div>
              <div className="space-y-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => handleAsk(q)} disabled={isLoading}
                    className="w-full rounded-lg border border-[#1a3a60]/50 bg-[#030e1f]/60 px-3 py-2.5 text-left text-xs text-blue-200/60 hover:text-white hover:border-[#1e78ff]/40 hover:bg-[#1e78ff]/5 disabled:opacity-40 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#1a3a60]/70 bg-[#06101f]/90 p-4">
              <h3 className="mb-2 text-sm font-black text-white">Loaded Conversation</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-200/40">Words</span>
                  <span className="font-black text-white">{chatText.split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-200/40">Characters</span>
                  <span className="font-black text-white">{chatText.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-200/40">Questions asked</span>
                  <span className="font-black text-white">{messages.filter(m => m.role === "user").length}</span>
                </div>
              </div>
              <button onClick={reset} className="mt-3 w-full rounded-lg border border-[#1a3a60]/50 py-2 text-xs font-black text-blue-200/50 hover:text-white transition">
                Load Different Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}