import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock, Trophy, Play, Download } from "lucide-react";

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

  if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
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
      </div>

      {/* Continue Watching */}
      {enrollments.filter(e => e.status === "in_progress").length > 0 && (
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-5">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#00c8ff]" /> Continue Watching
          </h3>
          <div className="space-y-3">
            {enrollments.filter(e => e.status === "in_progress").slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-[#1a3a60] bg-[#03080f] p-3">
                <div className="flex-1">
                  <p className="font-black text-white text-sm">{e.course_title}</p>
                  <div className="mt-1 h-2 bg-[#12305f] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1e78ff] to-[#00c8ff]" style={{ width: `${e.completion_percentage}%` }} />
                  </div>
                  <p className="text-xs text-blue-100/40 mt-1">{e.completion_percentage}% complete</p>
                </div>
                <button className="ml-4 rounded-lg bg-[#1e78ff]/20 border border-[#1e78ff]/50 p-2 text-[#00c8ff] hover:bg-[#1e78ff]/30 transition">
                  <Play className="h-4 w-4" />
                </button>
              </div>
            ))}
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