import { motion } from "framer-motion";
import { Sparkles, Palette, Volume2 } from "lucide-react";

const EFFECTS = [
  { id: "blur", name: "Blur", icon: "✨", category: "visual" },
  { id: "brightness", name: "Brightness", icon: "☀️", category: "color" },
  { id: "contrast", name: "Contrast", icon: "◐", category: "color" },
  { id: "saturation", name: "Saturation", icon: "🎨", category: "color" },
  { id: "grayscale", name: "Grayscale", icon: "⚫", category: "color" },
  { id: "sepia", name: "Sepia", icon: "🟤", category: "color" },
  { id: "echo", name: "Echo", icon: "🔊", category: "audio" },
  { id: "reverb", name: "Reverb", icon: "🎵", category: "audio" },
];

export default function ProVideoEffects() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-blue-900/40">
        <h3 className="text-xs font-bold text-blue-300">EFFECTS</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Visual Effects */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Visual</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.filter(e => e.category === 'visual').map(effect => (
              <motion.button
                key={effect.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#1a1f3a] border border-blue-900/30 rounded hover:border-blue-600/60 transition-all text-center"
              >
                <p className="text-lg mb-1">{effect.icon}</p>
                <p className="text-xs text-blue-300">{effect.name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Color Effects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Color</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.filter(e => e.category === 'color').map(effect => (
              <motion.button
                key={effect.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#1a1f3a] border border-blue-900/30 rounded hover:border-blue-600/60 transition-all text-center"
              >
                <p className="text-lg mb-1">{effect.icon}</p>
                <p className="text-xs text-blue-300">{effect.name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Audio Effects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Audio</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.filter(e => e.category === 'audio').map(effect => (
              <motion.button
                key={effect.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-[#1a1f3a] border border-blue-900/30 rounded hover:border-blue-600/60 transition-all text-center"
              >
                <p className="text-lg mb-1">{effect.icon}</p>
                <p className="text-xs text-blue-300">{effect.name}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}