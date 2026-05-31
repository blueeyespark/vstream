import { base44 } from "@/api/base44Client";

const BADGE_CONFIG = {
  first_course: { icon: "🎓", name: "First Step", xp: 100, desc: "Complete your first course" },
  course_complete: { icon: "🏆", name: "Course Master", xp: 250, desc: "Complete a course" },
  "7day_streak": { icon: "🔥", name: "On Fire", xp: 150, desc: "7-day learning streak" },
  "14day_streak": { icon: "🚀", name: "Unstoppable", xp: 300, desc: "14-day learning streak" },
  perfect_quiz: { icon: "💯", name: "Perfect Score", xp: 200, desc: "Score 100% on a quiz" },
  helpful_answer: { icon: "💡", name: "Helper", xp: 50, desc: "Answer marked as helpful" },
  expert_contributor: { icon: "⭐", name: "Expert", xp: 500, desc: "5 helpful answers in course" }
};

export async function awardBadge(userEmail, badgeType, courseId = null) {
  const config = BADGE_CONFIG[badgeType];
  if (!config) return null;

  // Check if already has badge
  const existing = await base44.entities.UserBadge.filter({
    user_email: userEmail,
    badge_type: badgeType
  });

  if (existing.length > 0) return null; // Already earned

  const badge = await base44.entities.UserBadge.create({
    user_email: userEmail,
    badge_type: badgeType,
    badge_name: config.name,
    badge_icon: config.icon,
    description: config.desc,
    xp_reward: config.xp,
    course_id: courseId,
    earned_at: new Date().toISOString()
  });

  // Update enrollment XP
  if (courseId) {
    const enrollments = await base44.entities.UserEnrollment.filter({
      user_email: userEmail,
      course_id: courseId
    });
    if (enrollments.length > 0) {
      await base44.entities.UserEnrollment.update(enrollments[0].id, {
        total_xp: (enrollments[0].total_xp || 0) + config.xp
      });
    }
  }

  return badge;
}

export async function updateLearningStreak(enrollmentId) {
  const enrollment = await base44.entities.UserEnrollment.get(enrollmentId);
  const today = new Date().toISOString().split('T')[0];
  const lastDate = enrollment.last_learned_date;

  let newStreak = enrollment.current_streak || 0;
  
  if (lastDate) {
    const last = new Date(lastDate);
    const now = new Date(today);
    const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await base44.entities.UserEnrollment.update(enrollmentId, {
    current_streak: newStreak,
    last_learned_date: today,
    total_xp: (enrollment.total_xp || 0) + 10 // Daily bonus
  });

  // Check for streak badges
  if (newStreak === 7) {
    await awardBadge(enrollment.user_email, "7day_streak", enrollment.course_id);
  }
  if (newStreak === 14) {
    await awardBadge(enrollment.user_email, "14day_streak", enrollment.course_id);
  }

  return newStreak;
}

export async function checkAndAwardPerfectQuiz(enrollmentId, score) {
  if (score === 100) {
    const enrollment = await base44.entities.UserEnrollment.get(enrollmentId);
    await base44.entities.UserEnrollment.update(enrollmentId, {
      perfect_quizzes: (enrollment.perfect_quizzes || 0) + 1,
      total_xp: (enrollment.total_xp || 0) + 200
    });
    
    return await awardBadge(enrollment.user_email, "perfect_quiz", enrollment.course_id);
  }
  return null;
}

export async function recordFailedTopic(enrollmentId, topics) {
  const enrollment = await base44.entities.UserEnrollment.get(enrollmentId);
  const failed = new Set(enrollment.failed_topics || []);
  topics.forEach(t => failed.add(t));
  
  await base44.entities.UserEnrollment.update(enrollmentId, {
    failed_topics: Array.from(failed)
  });
}

export async function getUserBadges(userEmail) {
  return base44.entities.UserBadge.filter({ user_email: userEmail });
}