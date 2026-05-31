import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Target, Calendar, BookOpen } from "lucide-react";

export default function LearningPathGenerator({ onPathGenerated }) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [targetSkills, setTargetSkills] = useState([]);
  const [learningStyle, setLearningStyle] = useState("balanced");
  const [generating, setGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState(null);

  const handleGeneratePath = async () => {
    if (goals.length === 0 || targetSkills.length === 0) return;

    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateLearningPath', {
        goals,
        skillLevel,
        targetSkills,
        learningStyle
      });

      setGeneratedPath(res.data.path);
      onPathGenerated?.(res.data.path);
    } catch (e) {
      console.error('Failed to generate path', e);
    }
    setGenerating(false);
  };

  if (generatedPath) {
    return <PathSummary path={generatedPath} />;
  }

  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/8 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-black text-white">AI Learning Path Generator</h3>
      </div>

      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" /> What are your learning goals?
              </label>
              <div className="space-y-2">
                {['Land a tech job', 'Start a side project', 'Improve skills', 'Switch careers', 'Build a portfolio'].map(goal => (
                  <label key={goal} className="flex items-center gap-2 text-blue-100">
                    <input
                      type="checkbox"
                      checked={goals.includes(goal)}
                      onChange={(e) => setGoals(e.target.checked ? [...goals, goal] : goals.filter(g => g !== goal))}
                      className="rounded"
                    />
                    {goal}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2">Current skill level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full rounded-lg border border-[#12305f] bg-[#06101f] px-3 py-2 text-white"
              >
                <option value="beginner">Beginner - Just starting</option>
                <option value="intermediate">Intermediate - Some experience</option>
                <option value="advanced">Advanced - Looking to specialize</option>
              </select>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={goals.length === 0}
              className="w-full rounded-lg bg-purple-500/20 border border-purple-500/50 px-4 py-2 text-purple-300 font-black hover:bg-purple-500/30 transition disabled:opacity-50"
            >
              Next: Select Target Skills →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2">Which skills do you want to develop?</label>
              <div className="grid gap-2 grid-cols-2">
                {['JavaScript', 'React', 'Python', 'Web Design', '3D Modeling', 'Video Editing', 'Content Strategy', 'UI/UX Design', 'Data Analysis', 'AI/ML', 'Mobile Dev', 'Cloud'].map(skill => (
                  <label key={skill} className="flex items-center gap-2 text-blue-100">
                    <input
                      type="checkbox"
                      checked={targetSkills.includes(skill)}
                      onChange={(e) => setTargetSkills(e.target.checked ? [...targetSkills, skill] : targetSkills.filter(s => s !== skill))}
                      className="rounded"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2">Learning style</label>
              <div className="space-y-2">
                {['Project-based', 'Video lectures', 'Reading & practice', 'Balanced'].map(style => (
                  <label key={style} className="flex items-center gap-2 text-blue-100">
                    <input
                      type="radio"
                      checked={learningStyle === style.toLowerCase().replace(/\s+/g, '_')}
                      onChange={() => setLearningStyle(style.toLowerCase().replace(/\s+/g, '_'))}
                      className="rounded-full"
                    />
                    {style}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-[#12305f] px-4 py-2 text-blue-100 font-black hover:bg-[#12305f]/30 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleGeneratePath}
                disabled={targetSkills.length === 0 || generating}
                className="flex-1 rounded-lg bg-purple-500/20 border border-purple-500/50 px-4 py-2 text-purple-300 font-black hover:bg-purple-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <>Generate Path</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PathSummary({ path }) {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/8 p-6">
      <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" /> Your Personalized Learning Path
      </h3>

      <div className="grid gap-3 mb-6 md:grid-cols-3">
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-3">
          <p className="text-xs text-blue-100/60">Total Duration</p>
          <p className="text-2xl font-black text-purple-400">{path.total_estimated_hours.toFixed(0)}h</p>
        </div>
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-3">
          <p className="text-xs text-blue-100/60">Courses</p>
          <p className="text-2xl font-black text-[#00c8ff]">{path.recommended_courses?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-3">
          <p className="text-xs text-blue-100/60">Milestones</p>
          <p className="text-2xl font-black text-emerald-400">{path.milestones?.length || 0}</p>
        </div>
      </div>

      {/* Courses */}
      <div className="mb-6">
        <h4 className="font-black text-white mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Recommended Courses
        </h4>
        <div className="space-y-2">
          {path.recommended_courses?.slice(0, 5).map((course, idx) => (
            <div key={idx} className="rounded-lg border border-[#1a3a60] bg-[#03080f] p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-black text-white">{idx + 1}. {course.course_title}</p>
                  <p className="text-xs text-blue-100/60 mt-1">{course.reason}</p>
                </div>
                <span className="text-xs font-black text-[#00c8ff] whitespace-nowrap ml-2">{course.estimated_weeks}w</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h4 className="font-black text-white mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Learning Milestones
        </h4>
        <div className="space-y-2">
          {path.milestones?.slice(0, 3).map((milestone, idx) => (
            <div key={idx} className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-3">
              <div className="flex items-start justify-between mb-1">
                <p className="font-black text-white">{milestone.milestone}</p>
                <p className="text-xs font-black text-amber-300">{new Date(milestone.target_date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {milestone.skills_gained?.slice(0, 3).map(skill => (
                  <span key={skill} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}