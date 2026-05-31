import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Sparkles } from "lucide-react";

export default function BadgeDisplay({ userEmail }) {
  const { data: badges = [] } = useQuery({
    queryKey: ["user-badges", userEmail],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments-xp", userEmail],
    queryFn: () => base44.entities.UserEnrollment.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const totalXP = enrollments.reduce((sum, e) => sum + (e.total_xp || 0), 0);
  const totalCompleted = enrollments.filter(e => e.status === "completed").length;

  if (badges.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#12305f] bg-[#06101f]/50 p-4 text-center">
        <Trophy className="mx-auto mb-2 h-6 w-6 text-blue-200/30" />
        <p className="text-sm text-blue-100/60">Complete courses and hit milestones to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* XP and Progress */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <p className="font-black text-white">Experience Points</p>
            </div>
            <p className="text-xs text-blue-100/50">{totalCompleted} course{totalCompleted !== 1 ? 's' : ''} completed</p>
          </div>
          <p className="text-3xl font-black text-amber-400">{totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <p className="text-sm font-black text-white mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" /> Achievements ({badges.length})
        </p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-3 text-center hover:border-amber-500/60 transition group cursor-pointer"
            >
              <p className="text-3xl mb-1 group-hover:scale-110 transition">{badge.badge_icon}</p>
              <p className="text-xs font-black text-white">{badge.badge_name}</p>
              <p className="text-[10px] text-blue-100/50 mt-1">+{badge.xp_reward} XP</p>
              <p className="text-[9px] text-blue-100/40 mt-0.5">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}