import { motion } from "framer-motion";
import { Volume2, Zap } from "lucide-react";

export default function ProAudioMixer({ tracks }) {
  const audioTracks = tracks.filter(t => t.type === 'audio');

  return (
    <div className="h-full p-4 overflow-x-auto">
      <div className="flex gap-4">
        {audioTracks.map(track => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 bg-[#1a1f3a] p-3 rounded min-w-fit"
          >
            <div className="flex items-center gap-1 text-xs text-blue-300">
              <Volume2 className="w-3.5 h-3.5" />
              {track.name}
            </div>

            {/* Fader */}
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="80"
              className="w-full h-32 accent-cyan-500 [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
              style={{ writingMode: 'bt-lr' }}
            />

            {/* Meter */}
            <div className="flex items-center gap-1 h-8">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-1 h-4 bg-cyan-500/40 rounded-sm"
                    style={{ height: `${(i + 1) * 8}px`, opacity: Math.random() * 0.5 + 0.5 }}
                  />
                ))}
              </div>
            </div>

            {/* Mute */}
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">🔊</button>
          </motion.div>
        ))}

        {/* Master Channel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-2 bg-blue-600/20 p-3 rounded min-w-fit border border-blue-600/50"
        >
          <div className="flex items-center gap-1 text-xs text-blue-300 font-bold">
            <Zap className="w-3.5 h-3.5" />
            Master
          </div>

          <input
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            className="w-full h-32 accent-cyan-500 [writing-mode:bt-lr]"
            style={{ writingMode: 'bt-lr' }}
          />

          <div className="flex items-center gap-1 h-8">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-1 h-4 bg-cyan-500/40 rounded-sm"
                  style={{ height: `${(i + 1) * 8}px`, opacity: 0.7 }}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-cyan-400">-3dB</p>
        </motion.div>
      </div>
    </div>
  );
}