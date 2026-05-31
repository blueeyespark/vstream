import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock, Trophy, Play, Download, AlertCircle, Zap, Flame } from "lucide-react";
import TimeTracker from "./TimeTracker";
import LearningTimeAnalytics from "./LearningTimeAnalytics";
import BadgeDisplay from "./BadgeDisplay";
import OfflineDownload from "./OfflineDownload";
import CourseQnA from "./CourseQnA";

export default function MyCourses() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserEnrollment.filter({ user_email: user.email });
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Certificate.filter({ user_email: user.email });
    },
  });

  const completed = enrollments.filter(e => e.status === "completed").length;
  const inProgress = enrollments.filter(e => e.status === "in_progress").length;
  const totalHours = enrollments.reduce((sum, e) => sum + (e.actual_hours_spent || 0), 0);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const user = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Badges & XP */}
      {user.data?.email && <BadgeDisplay userEmail={user.data.email} />}

      {/* Learning Time Analytics */}
      <LearningTimeAnalytics enrollments={enrollments} />

      {/* Stats */}
      <div className="grid gap-3 grid-cols-4">
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <p className="text-2xl font-black text-white">{enrollments.length}</p>
          <p className="text-xs text-blue-100/50">Courses Enrolled</p>
        </div>
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <p className="text-2xl font-black text-emerald-400">{inProgress}</p>
          <p className="text-xs text-blue-100/50">In Progress</p>
        </div>
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <p className="text-2xl font-black text-amber-400">{completed}</p>
          <p className="text-xs text-blue-100/50">Completed</p>
        </div>
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
          <p className="text-2xl font-black text-[#00c8ff]">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-blue-100/50">Time Invested</p>
        </div>
      </div>

      {/* Timer Widget */}
      {selectedEnrollment && (
        <TimeTracker 
          enrollmentId={selectedEnrollment.id}
          onSessionSaved={() => {
            setSelectedEnrollment(null);
          }}
        />
      )}

      {/* Continue Watching */}
      {enrollments.filter(e => e.status === "in_progress").length > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-5">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#00c8ff]" /> Continue Watching
          </h3>
          <div className="space-y-3">
            {enrollments.filter(e => e.status === "in_progress").slice(0, 3).map(e => {
              const estimatedHours = e.estimated_hours || 0;
              const actualHours = e.actual_hours_spent || 0;
              const remainingHours = Math.max(0, estimatedHours - actualHours);
              const efficiency = estimatedHours > 0 ? (actualHours / estimatedHours * 100).toFixed(0) : 0;
              const streak = e.current_streak || 0;
              
              return (
                <div key={e.id} className="space-y-2">
                  <div className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-black text-white text-sm">{e.course_title}</p>
                        <div className="flex items-center gap-2 text-xs text-blue-100/60 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{actualHours.toFixed(1)}h / {estimatedHours}h</span>
                          {remainingHours > 0 && <span className="text-amber-400">({remainingHours.toFixed(1)}h remaining)</span>}
                          {streak > 0 && <span className="ml-auto flex items-center gap-1 text-red-400"><Flame className="h-3 w-3" /> {streak} days</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#00c8ff]">{efficiency}%</p>
                        <p className="text-[10px] text-blue-100/40">of time</p>
                      </div>
                    </div>
                    <div className="h-2 bg-[#12305f] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-[#1e78ff] to-[#00c8ff]" style={{ width: `${e.completion_percentage}%` }} />
                    </div>
                    <p className="text-xs text-blue-100/40 mb-2">{e.completion_percentage}% modules complete • {e.total_xp || 0} XP</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedEnrollment(e)}
                        className="flex-1 rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/50 py-1.5 text-[#00c8ff] hover:bg-[#1e78ff]/30 transition text-xs font-black flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" /> Track Time
                      </button>
                      <button className="flex-1 rounded-lg bg-purple-500/20 border border-purple-500/50 py-1.5 text-purple-300 hover:bg-purple-500/30 transition text-xs font-black flex items-center justify-center gap-1">
                        <Play className="h-3 w-3" /> Continue
                      </button>
                    </div>
                  </div>
                  <OfflineDownload enrollment={e} moduleIndex={e.current_module || 0} moduleTitle="Lesson" content="Cached content" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Courses */}
      {inProgress > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-5">
          <h3 className="font-black text-white mb-4">Active Courses</h3>
          <div className="space-y-3">
            {enrollments.filter(e => e.status === "in_progress").map(e => (
              <div key={e.id} className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-black text-white">{e.course_title}</p>
                  <span className="text-xs font-black px-2 py-1 rounded-full bg-[#1e78ff]/20 text-[#00c8ff]">
                    {e.completion_percentage}%
                  </span>
                </div>
                <div className="h-2 bg-[#12305f] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1e78ff] to-[#00c8ff]" style={{ width: `${e.completion_percentage}%` }} />
                </div>
                <p className="text-xs text-blue-100/40 mt-2">{e.modules_completed?.length || 0} of {e.total_modules} modules completed</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed & Certified */}
      {completed > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-5">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" /> Completed Courses
          </h3>
          <div className="space-y-3">
            {enrollments.filter(e => e.status === "completed").map(e => {
              const cert = certificates.find(c => c.course_id === e.course_id);
              return (
                <div key={e.id} className="rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <p className="font-black text-white">{e.course_title}</p>
                      </div>
                      {e.quiz_score && <p className="text-xs text-green-300 mt-1">Final Score: {e.quiz_score}%</p>}
                      <p className="text-xs text-blue-100/50 mt-1">Completed on {new Date(e.completed_date).toLocaleDateString()}</p>
                    </div>
                    {cert && (
                      <button className="ml-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 p-2 text-emerald-300 hover:bg-emerald-500/30 transition">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#12305f] p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-blue-200/30" />
          <p className="font-black text-white">No courses yet</p>
          <p className="text-sm text-blue-100/50 mt-1">Start a course to begin learning</p>
        </div>
      )}
    </div>
  );
}