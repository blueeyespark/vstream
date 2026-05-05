import { motion } from "framer-motion";
import { Sliders, Volume2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProVideoProperties({ clip, onUpdate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-blue-900/40">
        <h3 className="text-xs font-bold text-blue-300">PROPERTIES</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Basic Properties */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs font-medium text-blue-300 mb-2">Clip Info</p>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-blue-400/60">Name</label>
              <Input
                value={clip?.name || ""}
                onChange={(e) => onUpdate({ ...clip, name: e.target.value })}
                className="bg-[#1a1f3a] border-blue-900/30 text-xs"
              />
            </div>
            <div>
              <label className="text-blue-400/60">Duration: {clip?.duration?.toFixed(1) || 0}s</label>
            </div>
            <div>
              <label className="text-blue-400/60">Start: {clip?.startTime?.toFixed(1) || 0}s</label>
            </div>
          </div>
        </motion.div>

        {/* Effects */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Effects</p>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-blue-400/60">Opacity</label>
                <span className="text-xs text-blue-400/40">{clip?.opacity || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={clip?.opacity || 100}
                onChange={(e) => onUpdate({ ...clip, opacity: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-blue-400/60">Scale</label>
                <span className="text-xs text-blue-400/40">{clip?.scale || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={clip?.scale || 100}
                onChange={(e) => onUpdate({ ...clip, scale: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Audio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Audio</p>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-blue-400/60">Volume</label>
              <span className="text-xs text-blue-400/40">{clip?.volume || 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={clip?.volume || 100}
              onChange={(e) => onUpdate({ ...clip, volume: parseInt(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </motion.div>

        {/* Display */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-xs font-medium text-blue-300">Display</p>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={clip?.visible !== false}
              onChange={(e) => onUpdate({ ...clip, visible: e.target.checked })}
              className="w-3 h-3 rounded"
            />
            <span className="text-blue-400/60">Visible</span>
          </label>
        </motion.div>
      </div>
    </div>
  );
}