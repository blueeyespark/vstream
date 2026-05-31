import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { goals, skillLevel, targetSkills, learningStyle } = await req.json();

    // Get all courses
    const allCourses = await base44.entities.UserEnrollment.list();
    const uniqueCourses = [...new Set(allCourses.map(e => e.course_id))];

    // Use AI to analyze and generate personalized path
    const prompt = `You are an expert learning path designer. Based on these inputs:
- User Goals: ${goals.join(', ')}
- Current Skill Level: ${skillLevel}
- Target Skills: ${targetSkills.join(', ')}
- Learning Style: ${learningStyle}
- Available Courses: Over 150+ courses in coding, art, and content creation

Generate a personalized 12-week learning path with:
1. Ordered list of courses with priority (1-10)
2. Why each course was recommended
3. Estimated weeks per course
4. Key milestones (every 3-4 weeks)
5. Skills gained at each milestone

Return as JSON: { 
  recommendedCourses: [{courseTitle, priority, reason, estimatedWeeks, skillsGained}],
  milestones: [{milestone, targetWeek, skillsGained, coursesToComplete}],
  totalHours: number
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendedCourses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courseTitle: { type: "string" },
                priority: { type: "number" },
                reason: { type: "string" },
                estimatedWeeks: { type: "number" },
                skillsGained: { type: "array", items: { type: "string" } }
              }
            }
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone: { type: "string" },
                targetWeek: { type: "number" },
                skillsGained: { type: "array", items: { type: "string" } }
              }
            }
          },
          totalHours: { type: "number" }
        }
      }
    });

    // Create learning path record
    const milestoneDates = response.milestones.map((m, idx) => ({
      milestone: m.milestone,
      target_date: new Date(Date.now() + (m.targetWeek * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      skills_gained: m.skillsGained
    }));

    const path = await base44.entities.CustomLearningPath.create({
      user_email: user.email,
      user_goals: goals,
      skill_gaps: targetSkills.map(s => ({ skill: s, current_level: skillLevel, target_level: "advanced" })),
      recommended_courses: response.recommendedCourses.slice(0, 8).map(c => ({
        course_title: c.courseTitle,
        priority: c.priority,
        reason: c.reason,
        estimated_weeks: c.estimatedWeeks
      })),
      milestones: milestoneDates,
      total_estimated_hours: response.totalHours
    });

    return Response.json({ path, recommendations: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});