import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ProVideoTimeline({
  tracks,
  currentTime,
  duration,
  zoom,
  isPlaying,
  selectedClip,
  onSelectClip,
  onTimeChange,
  onDurationChange
}) {
  const [expandedTracks, setExpandedTracks] = useState({});

  const toggleTrack = (trackId) => {
    setExpandedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const pixelsPerSecond = 100 * zoom;

  return (
    <div className="flex-1 bg-[#0a0e27] border-b border-blue-900/40 flex flex-col overflow-hidden">
      {/* Timeline Ruler */}
      <div className="h-8 bg-[#0f1535] border-b border-blue-900/40 flex items-center px-4">
        <div className="flex-1 relative overflow-x-auto scrollbar-hide">
          <div className="flex gap-0" style={{ width: `${(duration || 60) * pixelsPerSecond}px` }}>
            {Array.from({ length: Math.ceil(duration || 60) }).map((_, i) => (
              <div key={i} className="flex flex-col items-start" style={{ width: `${pixelsPerSecond}px` }}>
                <div className="flex items-end gap-1">
                  <div className="w-px h-2 bg-blue-700" />
                  <span className="text-xs text-blue-400/60 font-mono">{i}s</span>
                </div>
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-500 pointer-events-none"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          />
        </div>
      </div>

      {/* Tracks */}
      <div className="flex-1 overflow-y-auto bg-[#0a0e27]">
        <div className="divide-y divide-blue-900/20">
          {tracks.map(track => (
            <motion.div key={track.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0a0e27]">
              <div className="flex h-10 border-b border-blue-900/20">
                {/* Track Header */}
                <div className="w-48 bg-[#0f1535] flex items-center px-3 border-r border-blue-900/20">
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className="text-blue-400 hover:text-blue-300 mr-2"
                  >
                    <ChevronDown className="w-4 h-4" style={{ transform: expandedTracks[track.id] ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                  </button>
                  <span className="text-xs font-medium text-blue-300 truncate">{track.name}</span>
                </div>

                {/* Track Content */}
                <div className="flex-1 bg-[#0a0e27] relative overflow-hidden">
                  {track.clips.map(clip => (
                    <motion.div
                      key={clip.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onSelectClip(clip)}
                      className={`absolute h-full top-0 rounded border-2 cursor-pointer transition-all ${
                        selectedClip?.id === clip.id
                          ? "border-cyan-500 bg-cyan-500/20"
                          : "border-blue-600/60 bg-blue-600/10 hover:bg-blue-600/20"
                      }`}
                      style={{
                        left: `${clip.startTime * pixelsPerSecond}px`,
                        width: `${(clip.duration || 3) * pixelsPerSecond}px`,
                        minWidth: '60px'
                      }}
                    >
                      <div className="p-1 h-full flex flex-col justify-center">
                        <p className="text-xs font-medium text-blue-200 truncate">{clip.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Track Details (Expanded) */}
              {expandedTracks[track.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#0f1535] border-b border-blue-900/20 p-3 text-xs text-blue-400/60"
                >
                  <p>Track: {track.type.toUpperCase()}</p>
                  <p>Clips: {track.clips.length}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}