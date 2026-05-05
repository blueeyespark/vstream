import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MOODS = ["curious", "excited", "thoughtful", "focused", "energetic", "playful", "analytical", "inspired", "determined", "chill"];

const SUGGESTIONS = [
  "Roast my content strategy 🔥",
  "What should I stream tonight?",
  "Help me write a viral hook",
  "Why is my channel not growing?",
  "Best thumbnail tips right now?",
  "How do I get my first sponsor?",
  "Short-form vs long-form — what wins?",
  "Collab ideas for my niche",
  "How do I beat the algorithm?",
  "Turn my stream into a YouTube video",
  "What's my biggest missed opportunity?",
  "Give me a 30-day content plan",
];

function AvatarFace({ talking, thinking }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="faceBg" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#faceGlow)" />
      <circle cx="40" cy="40" r="30" fill="url(#faceBg)" />
      <motion.ellipse cx="30" cy="34" rx="4" ry={thinking ? 1 : 4} fill="white"
        animate={{ ry: thinking ? [4, 1, 4] : 4 }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} />
      <motion.ellipse cx="50" cy="34" rx="4" ry={thinking ? 1 : 4} fill="white"
        animate={{ ry: thinking ? [4, 1, 4] : 4 }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} />
      <circle cx="31" cy="35" r="2" fill="#312e81" />
      <circle cx="51" cy="35" r="2" fill="#312e81" />
      <circle cx="32" cy="33" r="0.8" fill="white" opacity="0.8" />
      <circle cx="52" cy="33" r="0.8" fill="white" opacity="0.8" />
      {talking ? (
        <motion.ellipse cx="40" cy="50" rx="7" ry={4} fill="white" opacity="0.9"
          animate={{ ry: [2, 5, 2, 4, 2] }}
          transition={{ duration: 0.4, repeat: Infinity }} />
      ) : (
        <path d="M 33 49 Q 40 55 47 49" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
      )}
    </svg>
  );
}

export default function AIAssistant({ projects = [], tasks = [], budget = [], userRole = 'viewer', channels = [], videos = [], subscriptions = [], user = null }) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("curious");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [talking, setTalking] = useState(false);
  const [pulsing, setPulsing] = useState(true);
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [checkInMessages, setCheckInMessages] = useState([]);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInReplying, setCheckInReplying] = useState(false);
  const [checkInInput, setCheckInInput] = useState("");
  
  const bottomRef = useRef(null);
  const checkInBottomRef = useRef(null);
  const timerRef = useRef(null);
  const shownCheckInRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const MIN_REQUEST_INTERVAL = 1000;

  // Initialize greeting on first mount
  useEffect(() => {
    if (messages.length === 0 && userRole !== 'viewer') {
      const greeting = getGreeting();
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [userRole]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  useEffect(() => {
    if (checkInVisible) {
      setTimeout(() => checkInBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [checkInMessages, checkInVisible]);

  // Pulse animation fade
  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Check-in trigger (delayed, once per session)
  useEffect(() => {
    if (shownCheckInRef.current || userRole === 'viewer' || tasks.length === 0) return;
    
    const timer = setTimeout(() => {
      shownCheckInRef.current = true;
      triggerCheckIn();
    }, 120000);
    
    return () => clearTimeout(timer);
  }, [tasks.length, userRole]);

  // Periodic check-ins (20-30 min intervals)
  useEffect(() => {
    const scheduleCheckIn = () => {
      const delay = (20 + Math.random() * 10) * 60 * 1000;
      timerRef.current = setTimeout(() => {
        if (!checkInVisible) triggerCheckIn();
        scheduleCheckIn();
      }, delay);
    };
    
    if (userRole !== 'viewer') {
      scheduleCheckIn();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userRole, checkInVisible]);

  const getGreeting = () => {
    switch (userRole) {
      case 'admin':
      case 'staff':
        return "Hey! I'm VStream AI 📊 I break down creator trends, platform analytics, and growth strategies. What insight do you need?";
      case 'owner':
      case 'editor':
        return "Hey! I'm VStream AI 🎬 Your AI co-creator for streams, videos, thumbnails, hooks, and viral strategies. What's your goal?";
      default:
        return "Hey! I'm VStream AI 👀 I break down creator trends and help you discover amazing channels. What would you like to know?";
    }
  };

  const buildContext = async () => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
    const activeProjects = projects.filter(p => p.status !== 'completed').length;
    const totalBudget = budget.reduce((s, b) => b.type === 'income' ? s + b.amount : s - b.amount, 0);
    
    const myChannels = channels.filter(c => c.creator_email === user?.email);
    const readyVideos = videos.filter(v => v.status === 'ready').length;
    const totalViews = videos.reduce((s, v) => s + (v.view_count || 0), 0);
    
    return `Platform Stats:
- Your channels: ${myChannels.length} | Videos published: ${readyVideos} | Total views: ${totalViews.toLocaleString()}
- Subscriptions: ${subscriptions.length} | Live streams now: ${channels.filter(c => c.is_live).length}

Work Context:
- ${activeProjects} active projects, ${tasks.length} total tasks (${completedTasks} done, ${overdueTasks} overdue)
- Net budget: $${totalBudget.toLocaleString()}`;
  };

  const triggerCheckIn = async () => {
    if (checkInLoading || checkInVisible || userRole === 'viewer') return;
    
    setCheckInLoading(true);
    setCheckInVisible(true);
    setCheckInMessages([]);

    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    const unassigned = tasks.filter(t => !t.assigned_to).length;

    let priorityMsg = 'OPTIMIZE - Keep workflow smooth';
    if (overdue > 0) priorityMsg = 'URGENT - Address overdue tasks!';
    else if (completionRate > 75) priorityMsg = 'CELEBRATE - Great progress momentum!';
    else if (unassigned > tasks.length * 0.3) priorityMsg = 'ORGANIZE - Assign pending tasks';

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are VStream AI, a warm, brief assistant. Be genuine and encouraging in 2-3 sentences max.

Context: ${tasks.length} tasks (${completionRate}% done, ${overdue} overdue)
Priority: ${priorityMsg}

Generate a contextual check-in message. Be specific.`,
        model: 'gpt_5_mini',
      });

      const msg = typeof result === 'string' ? result : result?.response || "Keep pushing—you've got this! 🚀";
      setCheckInMessages([{ role: "assistant", content: msg }]);
    } catch (err) {
      console.error('Check-in error:', err);
      setCheckInMessages([{ role: "assistant", content: "Stay focused on what matters most! 💪" }]);
    } finally {
      setCheckInLoading(false);
    }
  };

  const sendCheckInReply = async () => {
    const text = checkInInput.trim();
    if (!text || checkInReplying) return;

    setCheckInInput("");
    setCheckInReplying(true);

    const updated = [...checkInMessages, { role: "user", content: text }];
    setCheckInMessages(updated);

    const completed = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are VStream AI — friendly, sharp, concise.

Context: ${tasks.length} tasks (${completionRate}% done).

User: ${text}

Respond naturally in 1-2 sentences. Stay warm and actionable.`,
        model: 'gpt_5_mini',
      });

      const reply = typeof result === 'string' ? result : result?.response || "Happy to help! 😊";
      setCheckInMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error('Reply error:', err);
      setCheckInMessages(prev => [...prev, { role: "assistant", content: "Let me help you stay on track! 🎯" }]);
    } finally {
      setCheckInReplying(false);
    }
  };

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    
    const now = Date.now();
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) return;
    lastRequestTimeRef.current = now;
    
    setInput("");
    setDynamicSuggestions([]);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const context = await buildContext();
      const history = messages.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const newMood = MOODS[Math.floor(Math.random() * MOODS.length)];
      setMood(newMood);

      const getRoleContext = () => {
        if (userRole === 'admin' || userRole === 'staff') {
          return `You are VStream AI — sharp, analytical assistant for platform insights. Mood: ${newMood}.
          
EXPERTISE: Creator analytics, platform trends, growth strategies, multi-platform mechanics, monetization insights.
PERSONALITY: Data-driven, direct, no fluff. Identify bottlenecks and opportunities.`;
        } else if (userRole === 'owner' || userRole === 'editor') {
          return `You are VStream AI — the ultimate AI co-creator for streamers and content creators. Mood: ${newMood}.
          
EXPERTISE: Streaming, YouTube strategy, short-form content, growth, monetization, production, community building, cross-platform promotion, creator business.
PERSONALITY: Witty, sharp, brutally honest but actionable. Never repeat advice. Vary your tone based on context.`;
        }
        return `You are VStream AI — a friendly guide to amazing creators and content. Mood: ${newMood}.
        
EXPERTISE: Content discovery, creator strategies, trending content, viewer engagement.
PERSONALITY: Approachable, enthusiastic about discovery.`;
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${getRoleContext()}

CONTEXT:
${context}

CONVERSATION:
${history}

USER: ${userMsg}

Respond naturally and conversationally. Be specific. Be memorable. Never sugarcoat. Include 3 punchy follow-up suggestions (max 7 words each).`,
        model: 'gpt_5_mini',
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      const response = result?.response || "Sorry, I couldn't process that. Try again?";
      const suggestions = (result?.suggestions || []).filter(s => s && s.length > 0);

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setTalking(true);
      setDynamicSuggestions(suggestions);
      setTimeout(() => setTalking(false), Math.min(response.length * 25, 3500));
    } catch (err) {
      console.error('Send error:', err);
      setMessages(prev => [...prev, { role: "assistant", content: "I hit a snag. Try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  };

  // Viewer gets minimal interaction
  if (userRole === 'viewer') {
    return (
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-2xl overflow-hidden ring-2 ring-indigo-300 ring-offset-2 bg-gradient-to-br from-blue-500 to-blue-600"
        animate={pulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: pulsing ? Infinity : 0 }}
        whileHover={{ scale: 1.1 }}
        style={{ display: open ? 'none' : 'block' }}
      >
        <div className="w-full h-full flex items-center justify-center text-white text-xl">🎬</div>
      </motion.button>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-2xl overflow-hidden ring-2 ring-indigo-300 ring-offset-2 bg-gradient-to-br from-indigo-500 to-purple-600"
        animate={pulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: pulsing ? Infinity : 0 }}
        whileHover={{ scale: 1.1 }}
        style={{ display: open ? 'none' : 'block' }}
      >
        <AvatarFace talking={false} thinking={false} />
      </motion.button>

      {/* Check-in Panel */}
      <AnimatePresence>
        {checkInVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 left-4 md:bottom-8 md:left-6 z-50 w-72 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0 border-b border-white/10">
              <div className="w-7 h-7 flex-shrink-0">
                <AvatarFace talking={checkInReplying} thinking={false} />
              </div>
              <p className="text-white text-xs font-bold flex-1">VStream AI</p>
              <span className="text-indigo-100 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Feeling curious
              </span>
              <button onClick={() => setCheckInVisible(false)} className="text-indigo-200 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 max-h-48">
              {checkInLoading ? (
                <div className="flex gap-1 items-center py-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                      animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                  ))}
                </div>
              ) : (
                checkInMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/15 text-white backdrop-blur'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {checkInReplying && (
                <div className="flex justify-start">
                  <div className="bg-white/15 rounded-lg px-3 py-2 flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-white rounded-full"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={checkInBottomRef} />
            </div>

            {/* Reply Input */}
            {!checkInLoading && checkInMessages.length > 0 && (
              <div className="flex gap-2 px-3 py-2.5 border-t border-white/10 flex-shrink-0">
                <input
                  value={checkInInput}
                  onChange={e => setCheckInInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCheckInReply()}
                  placeholder="Reply..."
                  disabled={checkInReplying}
                  className="flex-1 text-xs bg-white/20 border border-white/30 rounded-lg px-2.5 py-1.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button
                  onClick={sendCheckInReply}
                  disabled={checkInReplying || !checkInInput.trim()}
                  className="w-7 h-7 bg-white/25 hover:bg-white/35 disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  {checkInReplying ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Send className="w-3 h-3 text-white" />}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[340px] sm:w-[380px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="w-10 h-10 flex-shrink-0">
                <AvatarFace talking={talking} thinking={loading} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">VStream AI</p>
                <p className="text-xs text-indigo-200 flex items-center gap-1">
                  {loading ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Thinking...</> : <><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Feeling {mood}</>}
                </p>
              </div>
              <button onClick={() => { setMessages([messages[0] || { role: "assistant", content: getGreeting() }]); setDynamicSuggestions([]); }} className="text-indigo-200 hover:text-white p-1">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="text-indigo-200 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900" style={{ minHeight: 200 }}>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">{getGreeting()}</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 flex-shrink-0 rounded-full overflow-hidden bg-indigo-600">
                        <AvatarFace talking={i === messages.length - 1 && talking} thinking={false} />
                      </div>
                    )}
                    <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-600'
                    }`}>
                      {msg.role === 'assistant'
                        ? <ReactMarkdown className="prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                        : msg.content
                      }
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600 flex-shrink-0">
                    <AvatarFace talking={false} thinking={true} />
                  </div>
                  <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl px-4 py-3 flex gap-1 items-center shadow-sm">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              {(dynamicSuggestions.length > 0 ? dynamicSuggestions : SUGGESTIONS).map(s => (
                <button key={s} onClick={() => send(s)} className="flex-shrink-0 text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 px-3 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}