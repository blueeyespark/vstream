import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Play, Pause, Save } from "lucide-react";

export default function TimeTracker({ enrollmentId, onSessionSaved }) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleSaveSession = async () => {
    if (timeElapsed < 60) return; // Don't save sessions shorter than 1 minute
    
    setIsSaving(true);
    try {
      const enrollment = await base44.entities.UserEnrollment.get(enrollmentId);
      const minutesSpent = Math.round(timeElapsed / 60);
      const hoursSpent = minutesSpent / 60;
      
      const sessions = enrollment.learning_sessions || [];
      sessions.push({
        date: new Date().toISOString(),
        minutes_spent: minutesSpent,
        module_index: enrollment.current_module || 0
      });

      await base44.entities.UserEnrollment.update(enrollmentId, {
        learning_sessions: sessions,
        actual_hours_spent: (enrollment.actual_hours_spent || 0) + hoursSpent
      });

      setTimeElapsed(0);
      setIsActive(false);
      onSessionSaved?.();
    } catch (e) {
      console.error('Failed to save session', e);
    }
    setIsSaving(false);
  };

  const hours = Math.floor(timeElapsed / 3600);
  const minutes = Math.floor((timeElapsed % 3600) / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-[#00c8ff]" />
        <div className="flex-1">
          <p className="text-sm font-black text-white">Learning Session Timer</p>
          <p className="text-xs text-blue-100/50">Track your learning time</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-white font-mono">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-black transition ${
            isActive
              ? 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'
              : 'bg-[#1e78ff]/20 border border-[#1e78ff]/50 text-[#00c8ff] hover:bg-[#1e78ff]/30'
          }`}
        >
          {isActive ? (
            <><Pause className="h-4 w-4" /> Pause</>
          ) : (
            <><Play className="h-4 w-4" /> Start</>
          )}
        </button>
        <button
          onClick={handleSaveSession}
          disabled={timeElapsed === 0 || isSaving}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 py-2 text-sm font-black text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </div>
  );
}