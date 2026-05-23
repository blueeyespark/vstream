import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ArtForgeGenerationComments() {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");

  const handleAddComment = () => {
    if (!input.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    setComments(prev => [...prev, newComment]);
    setInput("");
  };

  const handleDeleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-4 backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-900/20">
        <MessageSquare className="w-4 h-4 text-[#1e78ff]" />
        <span className="text-xs font-bold text-blue-400/70 uppercase tracking-wider">Feedback & Changes</span>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-xs text-blue-400/40 py-4 text-center">No feedback yet — add your thoughts on what to change</p>
          ) : (
            comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a1525]/80 border border-blue-900/30 rounded-lg p-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#c8dff5] leading-tight break-words">{comment.text}</p>
                    <span className="text-[10px] text-blue-400/40 mt-1 block">{comment.timestamp}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex-shrink-0 text-blue-400/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="What should change?"
          className="flex-1 bg-[#0a1525]/80 border border-blue-900/40 rounded-lg px-2.5 py-1.5 text-xs text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 transition-colors"
        />
        <button
          onClick={handleAddComment}
          disabled={!input.trim()}
          className="w-8 h-8 bg-[#1e78ff]/20 hover:bg-[#1e78ff]/40 disabled:opacity-30 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-[#1e78ff]" />
        </button>
      </div>
    </div>
  );
}